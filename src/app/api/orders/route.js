import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const JSONBLOB_URL = "https://jsonblob.com/api/jsonBlob/019f837e-f83c-77a7-9e33-701e4f92fa2f";

async function readCloudOrders() {
  try {
    const res = await fetch(JSONBLOB_URL, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) return data.orders;
    }
  } catch (err) {
    console.error("[JSONBLOB Read Error]", err);
  }
  return null;
}

async function writeCloudOrders(orders) {
  try {
    await fetch(JSONBLOB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });
  } catch (err) {
    console.error("[JSONBLOB Write Error]", err);
  }
}

function getDbPath() {
  const primary = path.join(process.cwd(), "mock-db.json");
  try {
    fs.accessSync(primary, fs.constants.W_OK);
    return primary;
  } catch {
    const tmp = path.join("/tmp", "mock-db.json");
    if (!fs.existsSync(tmp)) {
      try {
        const src = fs.readFileSync(primary, "utf-8");
        fs.writeFileSync(tmp, src, "utf-8");
      } catch {
        fs.writeFileSync(tmp, JSON.stringify({ customers: [], orders: [], products: [] }, null, 2), "utf-8");
      }
    }
    return tmp;
  }
}

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(getDbPath(), "utf-8"));
  } catch {
    return { customers: [], orders: [], products: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore write error on read-only environments
  }
}

export async function GET() {
  try {
    let orders = await readCloudOrders();
    if (!orders) {
      const db = readDb();
      orders = db.orders || [];
    }
    return NextResponse.json(orders, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err) {
    console.error("[API GET /api/orders]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const db = readDb();
    if (!db.orders) db.orders = [];
    if (!db.products) db.products = [];
    if (!db.customers) db.customers = [];

    if (orderData.customerInfo) {
      if (orderData.customerInfo.email) {
        orderData.customerInfo.email = orderData.customerInfo.email.trim().toLowerCase();
      }
      if (orderData.customerInfo.phone) {
        orderData.customerInfo.phone = orderData.customerInfo.phone.trim();
      }
    }

    // Decrement stock for purchased items
    orderData.items.forEach(item => {
      const prodIndex = db.products.findIndex(p => p.productId === item.productId);
      if (prodIndex > -1) {
        const product = db.products[prodIndex];
        if (item.variantId && product.variants) {
          const varIndex = product.variants.findIndex(v => v.variantId === item.variantId);
          if (varIndex > -1) {
            product.variants[varIndex].stockLevel = Math.max(0, product.variants[varIndex].stockLevel - item.quantity);
          }
        } else {
          product.stockLevel = Math.max(0, product.stockLevel - item.quantity);
        }

        const currentStock = item.variantId && product.variants
          ? product.variants.reduce((acc, v) => acc + v.stockLevel, 0)
          : product.stockLevel;

        if (currentStock === 0) {
          product.stockStatus = "outofstock";
        } else if (currentStock <= (product.lowStockThreshold || 5)) {
          product.stockStatus = "lowstock";
        } else {
          product.stockStatus = "instock";
        }
      }
    });

    let cloudOrders = await readCloudOrders();
    const ordersList = cloudOrders || db.orders || [];

    const newOrder = {
      ...orderData,
      orderId: `ord-${Date.now()}`,
      orderNumber: `CW-${10000 + ordersList.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ordersList.push(newOrder);
    if (!db.orders.some(o => o.orderId === newOrder.orderId)) {
      db.orders.push(newOrder);
    }

    // Save customer record or update count
    if (orderData.customerInfo && orderData.customerInfo.phone) {
      const custIndex = db.customers.findIndex(c => c.phone === orderData.customerInfo.phone);
      if (custIndex > -1) {
        db.customers[custIndex].totalOrdersCount += 1;
        db.customers[custIndex].lifetimeValue += orderData.totalAmount || 0;
      }
    }

    await writeCloudOrders(ordersList);
    writeDb(db);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err) {
    console.error("[API POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { orderId, status, internalNote, riderInfo } = await request.json();
    let cloudOrders = await readCloudOrders();
    const db = readDb();
    if (!db.orders) db.orders = [];

    const ordersList = cloudOrders || db.orders || [];

    const index = ordersList.findIndex(o => o.orderId === orderId);
    if (index > -1) {
      const order = ordersList[index];
      const oldStatus = order.orderStatus;
      order.orderStatus = status;
      order.updatedAt = new Date().toISOString();
      if (internalNote) {
        order.internalNotes = (order.internalNotes || "") + `\n[${new Date().toLocaleDateString()}] ${internalNote}`;
      }
      if (status === "Dispatched" && riderInfo) {
        order.courierName = riderInfo;
      }

      // If cancelled, restore stock
      if (status === "Cancelled" && oldStatus !== "Cancelled") {
        if (!db.products) db.products = [];
        order.items.forEach(item => {
          const prodIndex = db.products.findIndex(p => p.productId === item.productId);
          if (prodIndex > -1) {
            const product = db.products[prodIndex];
            if (item.variantId && product.variants) {
              const varIndex = product.variants.findIndex(v => v.variantId === item.variantId);
              if (varIndex > -1) {
                product.variants[varIndex].stockLevel += item.quantity;
              }
            } else {
              product.stockLevel += item.quantity;
            }
            product.stockStatus = "instock";
          }
        });
      }

      ordersList[index] = order;
      await writeCloudOrders(ordersList);

      const dbIdx = db.orders.findIndex(o => o.orderId === orderId);
      if (dbIdx > -1) db.orders[dbIdx] = order;
      writeDb(db);

      return NextResponse.json({ success: true, order }, { status: 200 });
    }
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  } catch (err) {
    console.error("[API PUT /api/orders]", err);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
