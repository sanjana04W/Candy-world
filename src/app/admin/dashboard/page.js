"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDBService } from "@/lib/firebase";
import {
  ClipboardList, PackagePlus, AlertTriangle, BarChart3, Tag,
  LogOut, UserCheck, Plus, Trash2, Edit3, MessageSquare, Users,
  ChevronDown, Lock, Shield, ShieldCheck, CheckCircle2, XCircle,
  TrendingUp, Package, ShoppingBag, Eye, EyeOff, Minus, FileText,
  LayoutDashboard, DollarSign, Clock, ArrowUpRight, ArrowDownRight, ArrowRight,
  Bell, X as XIcon, ShoppingCart, Inbox, Mail, Send, Settings, ImageIcon, ExternalLink, Menu
} from "lucide-react";

// -----------------------------------------------------------------
// ROLE PERMISSIONS CONFIG
// -----------------------------------------------------------------
const PERMISSIONS = {
  Owner: ["dashboard", "orders", "products", "inventory", "promotions", "analytics", "users", "messages", "settings"],
  Staff: ["dashboard", "orders", "inventory", "messages"],
};

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",               icon: LayoutDashboard, roles: ["Owner","Staff"] },
  { id: "orders",     label: "Order Management",         icon: ClipboardList,   roles: ["Owner","Staff"] },
  { id: "products",   label: "Product Catalog",          icon: PackagePlus,     roles: ["Owner"] },
  { id: "inventory",  label: "Inventory & Stock",        icon: Package,         roles: ["Owner","Staff"] },
  { id: "promotions", label: "Promotions & Offers",      icon: Tag,             roles: ["Owner"] },
  { id: "analytics",  label: "Analytics",                icon: BarChart3,       roles: ["Owner"] },
  { id: "users",      label: "User Management",          icon: Users,           roles: ["Owner"] },
  { id: "messages",   label: "Messages",                 icon: Mail,            roles: ["Owner","Staff"] },
  { id: "settings",   label: "System Settings",          icon: Settings,        roles: ["Owner"] },
];

const STATUS_COLORS = {
  Pending:    "bg-amber-50 border-amber-200 text-amber-700",
  Confirmed:  "bg-blue-50 border-blue-200 text-blue-700",
  Processing: "bg-indigo-50 border-indigo-200 text-indigo-700",
  Dispatched: "bg-purple-50 border-purple-200 text-purple-700",
  Completed:  "bg-emerald-50 border-emerald-200 text-emerald-700",
  Cancelled:  "bg-rose-50 border-rose-200 text-rose-700",
};

// -----------------------------------------------------------------
// INVENTORY ROW — inline-editable sub-component
// -----------------------------------------------------------------
const STOCK_STATUS_OPTIONS = [
  { value: "instock",    label: "In Stock",     color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "madetoorder",label: "Made to Order",color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "lowstock",   label: "Low Stock",    color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "outofstock", label: "Out of Stock", color: "text-rose-600 bg-rose-50 border-rose-200" },
  { value: "hidden",     label: "Draft",        color: "text-gray-500 bg-gray-50 border-gray-200" },
];

const getSku = (prod) => {
  const categoryPrefixMap = {
    candy: "CW",
    chocolate: "CC",
    gourmet: "CG",
    cosmetics: "CM"
  };
  const prefix = categoryPrefixMap[prod.categoryId] || "PD";
  const num = prod.productId.replace("prod-", "").padStart(3, "0");
  return `${prefix}-${num}`;
};

function InventoryRow({ prod, isOwner, onSave }) {
  const [editing, setEditing] = React.useState(false);
  const [row, setRow] = React.useState({
    stockLevel:        prod.stockLevel,
    lowStockThreshold: prod.lowStockThreshold || 5,
    stockStatus:       prod.stockStatus || "instock",
    leadDays:          prod.leadDays || "",
  });

  const sku = getSku(prod);

  // If status is Made to Order, or Draft, QTY is usually not applicable (displays as —)
  const isQtyDisabled = row.stockStatus === "madetoorder" || row.stockStatus === "hidden";

  const statusOpt = STOCK_STATUS_OPTIONS.find(o => o.value === row.stockStatus) || STOCK_STATUS_OPTIONS[0];

  const handleSave = () => {
    onSave({ 
      ...prod, 
      ...row,
      stockLevel: isQtyDisabled ? 0 : Number(row.stockLevel)
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setRow({
      stockLevel:        prod.stockLevel,
      lowStockThreshold: prod.lowStockThreshold || 5,
      stockStatus:       prod.stockStatus || "instock",
      leadDays:          prod.leadDays || "",
    });
    setEditing(false);
  };

  return (
    <tr className={`border-b border-gray-100 transition-colors ${editing ? "bg-purple-50/20" : "hover:bg-gray-50/50"}`}>
      {/* Product Name */}
      <td className="px-5 py-4 font-bold text-gray-800 text-xs sm:text-sm">
        {prod.name}
      </td>

      {/* SKU */}
      <td className="px-5 py-4 text-xs font-mono text-gray-400">
        {sku}
      </td>

      {/* Stock Status Dropdown */}
      <td className="px-5 py-4">
        {editing ? (
          <div className="relative inline-block">
            <select
              value={row.stockStatus}
              onChange={e => {
                const newStatus = e.target.value;
                setRow(r => ({ 
                  ...r, 
                  stockStatus: newStatus,
                  stockLevel: (newStatus === "madetoorder" || newStatus === "hidden") ? "" : r.stockLevel
                }));
              }}
              className={`appearance-none text-xs font-bold border rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer ${statusOpt.color}`}
            >
              {STOCK_STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        ) : (
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusOpt.color}`}>
            {statusOpt.label}
          </span>
        )}
      </td>

      {/* QTY */}
      <td className="px-5 py-4">
        {editing ? (
          <input
            type="number"
            min="0"
            disabled={isQtyDisabled}
            placeholder={isQtyDisabled ? "—" : ""}
            value={isQtyDisabled ? "" : row.stockLevel}
            onChange={e => setRow(r => ({ ...r, stockLevel: e.target.value }))}
            className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-40 disabled:bg-gray-100"
          />
        ) : (
          <span className="text-xs font-bold text-gray-600">
            {prod.stockStatus === "madetoorder" || prod.stockStatus === "hidden" ? "—" : `${prod.stockLevel}`}
          </span>
        )}
      </td>

      {/* Threshold */}
      <td className="px-5 py-4">
        {editing ? (
          <input
            type="number"
            min="0"
            value={row.lowStockThreshold}
            onChange={e => setRow(r => ({ ...r, lowStockThreshold: e.target.value }))}
            className="w-16 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        ) : (
          <span className="text-xs text-gray-600 font-bold">{prod.lowStockThreshold || 5}</span>
        )}
      </td>

      {/* Lead Days */}
      <td className="px-5 py-4">
        {editing ? (
          <input
            type="text"
            placeholder="e.g. 2d"
            value={row.leadDays}
            onChange={e => setRow(r => ({ ...r, leadDays: e.target.value }))}
            className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        ) : (
          <span className="text-xs text-gray-600 font-bold">{prod.leadDays || "—"}</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg shadow-sm transition-colors"
              title="Save"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 border border-gray-200 hover:border-purple-400 hover:text-purple-500 text-gray-400 rounded-lg transition-colors bg-white hover:bg-purple-50"
            title="Edit Row"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

function InventoryTab({ products, lowStockProducts, isOwner, onSave }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-black text-gray-900">Inventory & Stock Control</h2>
        <p className="text-xs text-gray-400">Manage stock levels, thresholds, lead days, and statuses inline.</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <h4 className="font-black text-amber-800 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 animate-pulse" /> Low Stock Alerts — {lowStockProducts.length} items
          </h4>
          <ul className="text-xs text-amber-700 space-y-1 pl-5 list-disc">
            {lowStockProducts.map(p => (
              <li key={p.productId}><strong>{p.name}</strong> — {p.stockLevel} units left (threshold: {p.lowStockThreshold || 5})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3">Product ↕</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Stock Status</th>
                <th className="px-5 py-3">QTY ↕</th>
                <th className="px-5 py-3">Threshold</th>
                <th className="px-5 py-3">Lead Days ↕</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(prod => (
                <InventoryRow
                  key={prod.productId}
                  prod={prod}
                  isOwner={isOwner}
                  onSave={onSave}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// NOTIFICATION CENTER — top-bar bell dropdown
// -----------------------------------------------------------------
function NotificationCenter({ orders, lowStockProducts, messages, onNavigate, onCloseSidebar }) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("orders");
  const [readIds, setReadIds] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("cw_notif_read") || "[]"); } catch { return []; }
  });
  const ref = React.useRef(null);
  const btnRef = React.useRef(null);
  const [dropPos, setDropPos] = React.useState({ top: 0, right: 0 });

  // Pending orders = unread notifications
  const pendingOrders = orders.filter(o => o.orderStatus === "Pending");
  const unreadOrders  = pendingOrders.filter(o => !readIds.includes(o.orderId));
  const unreadMessages = messages.filter(m => m.status === "unread");
  const totalUnread   = unreadOrders.length + (lowStockProducts.length > 0 ? 1 : 0) + unreadMessages.length;

  const markAllRead = async () => {
    const ids = [...readIds, ...pendingOrders.map(o => o.orderId)];
    setReadIds(ids);
    localStorage.setItem("cw_notif_read", JSON.stringify(ids));

    // Also mark messages read in the database
    const db = getDBService();
    const unread = messages.filter(m => m.status === "unread");
    if (unread.length > 0) {
      for (const msg of unread) {
        await db.saveMessage({ ...msg, status: "read" });
      }
      window.dispatchEvent(new CustomEvent("candy_catalog_updated", { detail: { key: "messages" } }));
    }
  };

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Calculate fixed dropdown position relative to bell button
  const handleBellClick = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    if (onCloseSidebar) onCloseSidebar(); // close sidebar on mobile before opening
    setOpen(v => !v);
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        ref={btnRef}
        onClick={handleBellClick}
        className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-white" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {/* Dropdown Panel — fixed so it escapes all parent stacking contexts */}
      {open && (
        <div
          style={{ top: dropPos.top, right: dropPos.right }}
          className="fixed w-[min(320px,calc(100vw-16px))] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-black uppercase tracking-widest text-gray-700">Notifications</p>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-bold text-purple-500 hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "orders",    label: "Orders",    count: unreadOrders.length },
              { id: "inventory", label: "Stock",     count: lowStockProducts.length },
              { id: "messages",  label: "Messages",  count: unreadMessages.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="max-h-72 overflow-y-auto">
            {/* — ORDERS TAB — */}
            {activeTab === "orders" && (
              pendingOrders.length === 0 ? (
                <div className="py-10 text-center">
                  <Inbox className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-semibold">No new notifications</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {pendingOrders.map(o => {
                    const isNew = !readIds.includes(o.orderId);
                    return (
                      <li
                        key={o.orderId}
                        onClick={() => { onNavigate("orders"); setOpen(false); }}
                        className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isNew ? "bg-purple-50/40" : ""
                        }`}
                      >
                        <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isNew ? "bg-purple-100" : "bg-gray-100"
                        }`}>
                          <ShoppingCart className={`h-3.5 w-3.5 ${isNew ? "text-purple-600" : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isNew ? "text-gray-900" : "text-gray-500"}`}>
                            New order from {o.customerName || "Customer"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            LKR {o.totalAmount?.toLocaleString()} · {timeAgo(o.createdAt)}
                          </p>
                        </div>
                        {isNew && <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </li>
                    );
                  })}
                </ul>
              )
            )}

            {/* — INVENTORY TAB — */}
            {activeTab === "inventory" && (
              lowStockProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-semibold">All products are well stocked</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {lowStockProducts.map(p => (
                    <li
                      key={p.productId}
                      onClick={() => { onNavigate("inventory"); setOpen(false); }}
                      className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        p.stockStatus === "outofstock" ? "bg-rose-100" : "bg-amber-100"
                      }`}>
                        <AlertTriangle className={`h-3.5 w-3.5 ${
                          p.stockStatus === "outofstock" ? "text-rose-500" : "text-amber-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {p.stockStatus === "outofstock" ? "Out of Stock" : `Only ${p.stockLevel} units left`}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                        p.stockStatus === "outofstock" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      }`}>
                        {p.stockStatus === "outofstock" ? "OUT" : "LOW"}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {/* — MESSAGES TAB — */}
            {activeTab === "messages" && (
              unreadMessages.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-semibold">No new messages</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {unreadMessages.map(m => (
                    <li
                      key={m.id}
                      onClick={() => { onNavigate("messages", m.id); setOpen(false); }}
                      className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 bg-purple-50/20"
                    >
                      <div className="mt-0.5 w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{m.name}</p>
                        <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">{m.subject}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{timeAgo(m.createdAt)}</p>
                      </div>
                      <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1.5" />
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => { onNavigate(activeTab === "inventory" ? "inventory" : activeTab === "messages" ? "messages" : "orders"); setOpen(false); }}
              className="text-[10px] font-bold text-purple-500 hover:underline w-full text-center"
            >
              View all {activeTab === "inventory" ? "Alerts" : activeTab === "messages" ? "Messages" : "Orders"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const dbService = getDBService();

  const [adminUser, setAdminUser]     = useState(null);
  const [testRole, setTestRole]       = useState(null); // for demo role switching
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading]         = useState(true);

  // Data
  const [orders, setOrders]           = useState([]);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [adminUsers, setAdminUsers]   = useState([]);
  const [messages, setMessages]       = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Orders state
  const [orderFilter, setOrderFilter]                   = useState("all");
  const [internalNote, setInternalNote]                 = useState("");
  const [riderInfo, setRiderInfo]                       = useState("");
  const [selectedOrderIdForNotes, setSelectedOrderIdForNotes] = useState(null);
  const [expandedOrderId, setExpandedOrderId]           = useState(null);

  // Products state
  const [showProductForm, setShowProductForm] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    productId: "", name: "", slug: "", categoryId: "candy",
    subCategoryId: "", description: "", basePrice: 0, salePrice: "",
    weight: 0, images: [], stockLevel: 0, lowStockThreshold: 5,
    isFeatured: false, isNewArrival: false, status: "active"
  });

  // User Management state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Staff", isActive: true });

  // Messages state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReply, setMessageReply] = useState("");
  const [messageFilter, setMessageFilter] = useState("all"); // "all", "unread", "read", "replied"

  // Product toast
  const [productToast, setProductToast] = useState(null); // { type: "success"|"error", text: string }

  // On mount: auth check
  useEffect(() => {
    const user = dbService.getCurrentAdminUser();
    if (!user) { router.push("/admin/login"); return; }
    setAdminUser(user);
    setTestRole(user.role);
    loadAll();

    // Listen for catalog or database updates (like new messages or status changes)
    const handleUpdate = () => {
      loadAll();
    };
    window.addEventListener("candy_catalog_updated", handleUpdate);
    return () => window.removeEventListener("candy_catalog_updated", handleUpdate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ords, prods, cats, custs, admins, msgs, stgs] = await Promise.all([
        dbService.getOrders(),
        dbService.getProducts(),
        dbService.getCategories(),
        dbService.getCustomers(),
        dbService.getAdminUsers(),
        dbService.getMessages(),
        dbService.getSettings(),
      ]);
      setOrders([...ords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setProducts(prods);
      setCategories(cats);
      setCustomers(custs);
      setAdminUsers(admins);
      setMessages(msgs.reverse());
      setSiteSettings(stgs);
      setSettingsForm(stgs);
    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { dbService.logoutAdmin(); router.push("/admin/login"); };

  // Effective role (for testing)
  const effectiveRole = testRole || adminUser?.role || "Staff";
  const isOwner = effectiveRole === "Owner";
  const canAccess = (tab) => PERMISSIONS[effectiveRole]?.includes(tab);

  const handleTabChange = (tab) => {
    if (!canAccess(tab)) return; // silently ignore — button is already visually locked
    setActiveTab(tab);
  };

  // -----------------------------------------------------------------
  // ORDERS HANDLERS
  // -----------------------------------------------------------------
  const filteredOrders = orders.filter(o =>
    orderFilter === "all" ? true : o.orderStatus === orderFilter
  );

  const handleUpdateStatus = async (orderId, newStatus) => {
    const note = newStatus === "Cancelled"
      ? "Cancelled by operations staff."
      : `Status updated to ${newStatus}`;
    await dbService.updateOrderStatus(orderId, newStatus, note, newStatus === "Dispatched" ? riderInfo : "");
    setRiderInfo("");
    loadAll();
  };

  const handleAddNote = async (orderId) => {
    if (!internalNote.trim()) return;
    await dbService.updateOrderStatus(orderId, null, internalNote);
    setInternalNote("");
    setSelectedOrderIdForNotes(null);
    loadAll();
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm("Are you sure you want to delete this order permanently?")) {
      await dbService.deleteOrder(orderId);
      loadAll();
    }
  };

  const handleClearAllOrders = async () => {
    if (confirm("⚠️ Are you sure you want to delete ALL order histories permanently? This action cannot be undone.")) {
      await dbService.clearAllOrders();
      loadAll();
    }
  };

  const handleDownloadInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the invoice.");
      return;
    }
    
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            color: #8b5cf6;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            text-align: right;
            margin: 0;
            color: #111827;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9ca3af;
            margin-bottom: 8px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #fafaf9;
            font-weight: 700;
            text-align: left;
            padding: 12px;
            font-size: 12px;
            text-transform: uppercase;
            color: #4b5563;
            border-bottom: 2px solid #e5e7eb;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 40px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
          }
          .totals-row.grand {
            font-size: 16px;
            font-weight: 900;
            border-top: 2px solid #111827;
            padding-top: 12px;
            color: #111827;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 60px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🍬 CANDY WORLD</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
              Thalawathugoda & Colombo 03, Sri Lanka<br>
              Phone: +94 77 123 4567 | candyworld.lk23@gmail.com
            </div>
          </div>
          <div>
            <h1 class="title">INVOICE</h1>
            <div style="text-align: right; font-size: 12px; color: #4b5563; margin-top: 8px;">
              <strong>Invoice #:</strong> ${order.orderNumber}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Billing & Shipping To</div>
            <strong>${order.customerInfo.name}</strong><br>
            Phone: ${order.customerInfo.phone}<br>
            Email: ${order.customerInfo.email}<br>
            Address: ${order.customerInfo.address}, ${order.customerInfo.district}
          </div>
          <div>
            <div class="section-title">Payment & Delivery Info</div>
            <strong>Payment Method:</strong> ${order.paymentMethod || "COD"}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus || "Pending"}<br>
            <strong>Status:</strong> ${order.orderStatus || "Pending"}<br>
            ${order.requestedDeliveryDate ? `<strong>Delivery Date:</strong> ${new Date(order.requestedDeliveryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center; width: 80px;">Qty</th>
              <th style="text-align: right; width: 120px;">Unit Price</th>
              <th style="text-align: right; width: 120px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.variantName ? `<br><span style="font-size: 11px; color: #6b7280;">Variant: ${item.variantName}</span>` : ""}
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">LKR ${item.price.toLocaleString()}</td>
                <td style="text-align: right;">LKR ${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>LKR ${(order.subtotal || (order.totalAmount - (order.deliveryFee || 0))).toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>Delivery Fee</span>
            <span>LKR ${(order.deliveryFee || 0).toLocaleString()}</span>
          </div>
          <div class="totals-row grand">
            <span>Total Amount</span>
            <span>LKR ${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for shopping at Candy World!<br>
          For support or returns, please contact our support team.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  // -----------------------------------------------------------------
  // PRODUCTS HANDLERS
  // -----------------------------------------------------------------
  const startEditProduct = (prod) => {
    setProductForm({ ...prod, salePrice: prod.salePrice || "", subCategoryId: prod.subCategoryId || "" });
    setIsEditingProduct(true);
    setShowProductForm(true);
  };
  const startCreateProduct = () => {
    setProductForm({
      productId: `prod-${Date.now()}`, name: "", slug: "", categoryId: "candy",
      subCategoryId: "", description: "", basePrice: 0, salePrice: "",
      weight: 0, images: ["/images/placeholder.jpg"], stockLevel: 10,
      lowStockThreshold: 5, isFeatured: false, isNewArrival: true, status: "active"
    });
    setIsEditingProduct(false);
    setShowProductForm(true);
  };
  const handleProductFormSubmit = async (e) => {
    e.preventDefault();
    const sl = Number(productForm.stockLevel);
    const lt = Number(productForm.lowStockThreshold);
    // Filter out any blank image URL fields
    const cleanImages = (productForm.images || []).filter(url => url && url.trim() !== "");
    const payload = {
      ...productForm,
      images: cleanImages,
      basePrice: Number(productForm.basePrice),
      salePrice: productForm.salePrice ? Number(productForm.salePrice) : null,
      weight: Number(productForm.weight),
      stockLevel: sl, lowStockThreshold: lt,
      stockStatus: sl === 0 ? "outofstock" : sl <= lt ? "lowstock" : "instock"
    };
    try {
      await dbService.saveProduct(payload);
      setShowProductForm(false);
      loadAll();
      const isNew = !isEditingProduct;
      setProductToast({ type: "success", text: isNew ? `"${payload.name}" created & live on website!` : `"${payload.name}" updated successfully!` });
      setTimeout(() => setProductToast(null), 4000);
    } catch (err) {
      setProductToast({ type: "error", text: "Failed to save product. Please try again." });
      setTimeout(() => setProductToast(null), 4000);
    }
  };
  const handleDeleteProduct = async (prodId) => {
    if (confirm("Delete this product permanently?")) {
      await dbService.deleteProduct(prodId);
      loadAll();
    }
  };

  // -----------------------------------------------------------------
  // INVENTORY HANDLERS
  // -----------------------------------------------------------------
  // Products that need attention: explicitly Out of Stock, explicitly Low Stock,
  // OR whose qty has dropped at or below their threshold (excluding Made to Order / Draft)
  const lowStockProducts = products.filter(p => {
    if (p.stockStatus === "hidden" || p.stockStatus === "madetoorder") return false;
    if (p.stockStatus === "outofstock") return true;
    if (p.stockStatus === "lowstock") return true;
    return p.stockLevel <= (p.lowStockThreshold || 5) && p.stockStatus !== "instock";
  });

  const handleUpdateStock = async (prod, newLevel) => {
    const lvl = Math.max(0, newLevel);
    const lt = prod.lowStockThreshold || 5;
    await dbService.saveProduct({
      ...prod, stockLevel: lvl,
      stockStatus: lvl === 0 ? "outofstock" : lvl <= lt ? "lowstock" : "instock"
    });
    loadAll();
  };

  // -----------------------------------------------------------------
  // USER MANAGEMENT HANDLERS
  // -----------------------------------------------------------------
  const handleSaveUser = () => {
    const existing = adminUsers.find(u => u.email === userForm.email);
    let updated;
    if (existing) {
      updated = adminUsers.map(u => u.email === userForm.email ? { ...u, ...userForm } : u);
    } else {
      updated = [...adminUsers, { uid: `admin-${Date.now()}`, ...userForm }];
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("candy_world_adminUsers", JSON.stringify(updated));
    }
    setAdminUsers(updated);
    setShowUserForm(false);
    setUserForm({ name: "", email: "", role: "Staff", isActive: true });
  };
  const handleToggleUserActive = (uid) => {
    const updated = adminUsers.map(u => u.uid === uid ? { ...u, isActive: !u.isActive } : u);
    if (typeof window !== "undefined") {
      localStorage.setItem("candy_world_adminUsers", JSON.stringify(updated));
    }
    setAdminUsers(updated);
  };
  const handleDeleteUser = (uid) => {
    if (!confirm("Remove this staff member?")) return;
    const updated = adminUsers.filter(u => u.uid !== uid);
    if (typeof window !== "undefined") {
      localStorage.setItem("candy_world_adminUsers", JSON.stringify(updated));
    }
    setAdminUsers(updated);
  };

  // Track header height so the mobile backdrop starts below it
  const headerRef = React.useRef(null);
  React.useEffect(() => {
    const update = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          "--header-h", `${headerRef.current.offsetHeight}px`
        );
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // -----------------------------------------------------------------
  // LOADING
  // -----------------------------------------------------------------
  if (loading || !adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-white border-t-transparent rounded-full mb-3"></div>
          <p className="text-white font-bold text-sm">Loading Operations Panel...</p>
        </div>
      </div>
    );
  }

  // Stat cards for header
  const pendingCount   = orders.filter(o => o.orderStatus === "Pending").length;
  const todayRevenue   = orders
    .filter(o => o.orderStatus !== "Cancelled")
    .reduce((s, o) => s + o.totalAmount, 0);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── TOP HEADER BAR ── */}
      <div ref={headerRef} className="bg-gradient-to-r from-rose-500 via-fuchsia-600 to-purple-700 text-white px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg relative z-50 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Hamburger button for mobile/tablet */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-75 mb-0.5">Candy World</p>
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-1.5">
              <span>🍬</span> Operations Control Panel
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full md:w-auto justify-between md:justify-end">
          {/* STAT PILLS */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5">
            <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">{pendingCount} Pending</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5">
            <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="text-[10px] sm:text-xs font-bold">LKR {todayRevenue.toLocaleString()}</span>
          </div>

          {/* TEST ROLE SWITCHER */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5">
            <Shield className="h-3.5 w-3.5 opacity-70" />
            <span className="text-[10px] font-black uppercase tracking-wider opacity-70 hidden sm:block">Test Role:</span>
            <select
              value={testRole}
              onChange={(e) => {
                setTestRole(e.target.value);
                // Reset to first allowed tab
                const allowed = PERMISSIONS[e.target.value];
                if (!allowed.includes(activeTab)) setActiveTab(allowed[0]);
              }}
              className="bg-transparent text-white text-xs font-black border-none outline-none cursor-pointer appearance-none pr-4"
              style={{ WebkitAppearance: "none" }}
            >
              <option value="Owner" className="text-gray-800">Owner</option>
              <option value="Staff" className="text-gray-800">Staff</option>
            </select>
            <ChevronDown className="h-3 w-3 opacity-70 -ml-3" />
          </div>

          {/* NOTIFICATION BELL + USER INFO + LOGOUT */}
          <div className="flex items-center gap-2">
            <NotificationCenter
              orders={orders}
              lowStockProducts={lowStockProducts}
              messages={messages}
              onCloseSidebar={() => setMobileSidebarOpen(false)}
              onNavigate={(tab, msgId) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
                if (msgId) {
                  const msg = messages.find(m => m.id === msgId);
                  if (msg) setSelectedMessage(msg);
                }
              }}
            />
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              {adminUser.name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-black leading-tight">{adminUser.name}</p>
              <p className="text-[10px] opacity-60 uppercase font-bold">{effectiveRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* ── MOBILE BACKDROP OVERLAY ── */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
            style={{ top: "var(--header-h, 120px)" }}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR DRAWER (RESPONSIVE) ── */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 p-4 space-y-1 overflow-y-auto z-50 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:w-60 lg:flex-shrink-0 lg:z-0
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between lg:hidden px-3 pb-4 border-b border-gray-50 mb-3">
            <span className="font-extrabold text-sm text-gray-800">Navigation Menu</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 pb-2 pt-1">Navigation</p>
          {NAV_ITEMS.filter(item => canAccess(item.id)).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all
                  ${isActive ? "bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md" :
                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.id === "inventory" && lowStockProducts.length > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {lowStockProducts.length}
                  </span>
                )}
                {item.id === "orders" && pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {pendingCount}
                  </span>
                )}
                {item.id === "messages" && messages.filter(m => m.status === "unread").length > 0 && (
                  <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {messages.filter(m => m.status === "unread").length}
                  </span>
                )}
              </button>
            );
          })}

          {/* Role note */}
          <div className="pt-4 px-3">
            <div className={`rounded-xl p-3 text-[9px] font-bold uppercase tracking-wider ${isOwner ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-400"}`}>
              {isOwner ? (
                <><ShieldCheck className="h-3.5 w-3.5 inline mr-1" />Full Owner Access</>
              ) : (
                <><Lock className="h-3.5 w-3.5 inline mr-1" />Staff — Limited Access</>
              )}
            </div>
          </div>

          {/* Logout button */}
          <div className="pt-2 px-3">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all bg-[#2C2520] hover:bg-[#3D342D] text-white shadow-md"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">Logout</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ═══════════════════════════════
              TAB 0 — DASHBOARD HOME
          ═══════════════════════════════ */}
          {activeTab === "dashboard" && (() => {
            const now = new Date();
            const totalRevenue = orders.filter(o => o.orderStatus !== "Cancelled").reduce((s,o) => s + o.totalAmount, 0);
            const pendingOrders = orders.filter(o => o.orderStatus === "Pending").length;
            const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            // Top products by order frequency (mock scoring)
            const productFreq = {};
            orders.forEach(o => o.items?.forEach(it => {
              productFreq[it.name] = (productFreq[it.name] || 0) + (it.quantity || 1);
            }));
            const topProducts = Object.entries(productFreq)
              .sort((a,b) => b[1]-a[1])
              .slice(0, 5);
            const maxFreq = topProducts[0]?.[1] || 1;

            const kpis = [
              {
                label: "Total Revenue",
                value: `LKR ${totalRevenue.toLocaleString()}`,
                icon: DollarSign,
                change: "+12.5%",
                positive: true,
                bg: "bg-gradient-to-br from-emerald-400 to-teal-600",
                lightBg: "bg-emerald-50",
                textColor: "text-emerald-600"
              },
              {
                label: "Total Orders",
                value: orders.length.toString(),
                icon: ShoppingBag,
                change: "+8.2%",
                positive: true,
                bg: "bg-gradient-to-br from-blue-400 to-indigo-600",
                lightBg: "bg-blue-50",
                textColor: "text-blue-600"
              },
              {
                label: "Total Customers",
                value: customers.length.toString(),
                icon: Users,
                change: "+5.1%",
                positive: true,
                bg: "bg-gradient-to-br from-fuchsia-400 to-purple-600",
                lightBg: "bg-fuchsia-50",
                textColor: "text-fuchsia-600"
              },
              {
                label: "Pending Orders",
                value: pendingOrders.toString(),
                icon: Clock,
                change: "-2.4%",
                positive: false,
                bg: "bg-gradient-to-br from-amber-400 to-orange-500",
                lightBg: "bg-amber-50",
                textColor: "text-amber-600"
              },
            ];

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Dashboard</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Welcome back! Here&apos;s what&apos;s happening at Candy World.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                    Updated: {now.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}, {now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className={`${kpi.lightBg} p-3 rounded-xl flex-shrink-0`}>
                        <kpi.icon className={`h-6 w-6 ${kpi.textColor}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{kpi.value}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${kpi.positive ? "text-emerald-600" : "text-rose-500"}`}>
                          {kpi.positive
                            ? <ArrowUpRight className="h-3 w-3" />
                            : <ArrowDownRight className="h-3 w-3" />}
                          {kpi.change} vs last month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* Recent Orders */}
                  <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-5 pt-5 pb-3">
                      <h3 className="font-black text-gray-900">Recent Orders</h3>
                      <button onClick={() => setActiveTab("orders")} className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-wider text-gray-400">
                            <th className="px-5 py-2.5">Order ID</th>
                            <th className="px-5 py-2.5">Customer</th>
                            <th className="px-5 py-2.5">Date</th>
                            <th className="px-5 py-2.5">Status</th>
                            <th className="px-5 py-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                          {recentOrders.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 font-semibold">No orders yet</td></tr>
                          ) : recentOrders.map(order => (
                            <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setActiveTab("orders")}>
                              <td className="px-5 py-3 font-mono font-bold text-gray-600 text-[10px]">{order.orderNumber}</td>
                              <td className="px-5 py-3 font-bold text-gray-900">{order.customerInfo?.name}</td>
                              <td className="px-5 py-3 text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-black text-gray-900">LKR {order.totalAmount?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">

                    {/* Low Stock Alerts */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Low Stock Alerts
                        </h3>
                        <div className={`w-2.5 h-2.5 rounded-full ${lowStockProducts.length > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-400"}`} />
                      </div>
                      {lowStockProducts.length === 0 ? (
                        <div className="text-center py-4">
                          <CheckCircle2 className="h-8 w-8 text-emerald-300 mx-auto mb-1" />
                          <p className="text-xs text-gray-400 font-semibold">No low stock alerts.<br/>You&apos;re fully stocked!</p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {lowStockProducts.slice(0,4).map(p => (
                            <li key={p.productId} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-gray-700 truncate max-w-[140px]">{p.name}</span>
                              <span className={`font-black text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                                p.stockStatus === "outofstock"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {p.stockStatus === "outofstock" ? "Out of Stock" : `${p.stockLevel} left`}
                              </span>
                            </li>
                          ))}
                          {lowStockProducts.length > 4 && (
                            <button onClick={() => setActiveTab("inventory")} className="text-[10px] font-bold text-amber-600 hover:underline">
                              +{lowStockProducts.length - 4} more alerts →
                            </button>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* Top Products (7 Days) */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h3 className="font-black text-gray-900 mb-4">Top Products (7 Days)</h3>
                      {topProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No order data yet</p>
                      ) : (
                        <div className="space-y-3">
                          {topProducts.map(([name, count], i) => {
                            const pct = Math.round((count / maxFreq) * 100);
                            const colors = ["from-rose-400 to-pink-600","from-fuchsia-400 to-purple-600","from-blue-400 to-indigo-500","from-amber-400 to-orange-500","from-emerald-400 to-teal-500"];
                            return (
                              <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{name}</span>
                                  <span className="text-[10px] font-black text-gray-400">{pct}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all`}
                                    style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-black text-gray-900 mb-4">Order Status Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {["Pending","Confirmed","Processing","Dispatched","Completed","Cancelled"].map(status => {
                      const count = orders.filter(o => o.orderStatus === status).length;
                      const icons = { Pending: Clock, Confirmed: CheckCircle2, Processing: Package, Dispatched: ShoppingBag, Completed: CheckCircle2, Cancelled: XCircle };
                      const StatusIcon = icons[status] || Package;
                      return (
                        <div key={status} className={`rounded-2xl p-4 border text-center ${STATUS_COLORS[status] || "bg-gray-50 border-gray-200 text-gray-500"}`}>
                          <StatusIcon className="h-5 w-5 mx-auto mb-1 opacity-60" />
                          <p className="text-xl font-black">{count}</p>
                          <p className="text-[9px] font-black uppercase tracking-wider opacity-70 mt-0.5">{status}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}

          {/* ═══════════════════════════════
              TAB 1 — ORDER MANAGEMENT
          ═══════════════════════════════ */}
          {activeTab === "orders" && (

            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Order Management</h2>
                    <p className="text-xs text-gray-400">Real-time order tracking & workflow</p>
                  </div>
                  {isOwner && orders.length > 0 && (
                    <button
                      onClick={handleClearAllOrders}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ml-4"
                    >
                      <Trash2 className="h-3 w-3" /> Clear All Orders
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["all","Pending","Confirmed","Processing","Dispatched","Completed","Cancelled"].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all ${
                        orderFilter === st
                          ? "bg-gradient-to-r from-rose-500 to-purple-600 border-transparent text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400">No orders matching this filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => {
                    const isExpanded = expandedOrderId === order.orderId;
                    return (
                      <div key={order.orderId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        {/* Order Row Header */}
                        <button
                          className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-sm font-black text-gray-900 block">{order.orderNumber}</span>
                              <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-gray-50 border-gray-200 text-gray-500"}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-gray-900 hidden sm:block">LKR {order.totalAmount.toLocaleString()}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        {/* Expanded Order Detail */}
                        {isExpanded && (
                          <div className="px-5 pb-5 border-t border-gray-50 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                              <div className="space-y-1">
                                <p className="font-black text-gray-500 uppercase text-[9px] tracking-wider mb-1">Customer</p>
                                <p><strong>Name:</strong> {order.customerInfo.name}</p>
                                <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
                                <p><strong>Email:</strong> {order.customerInfo.email}</p>
                                <p><strong>Address:</strong> {order.customerInfo.address}, {order.customerInfo.district}</p>
                                {order.courierName && <p className="text-purple-600"><strong>Courier:</strong> {order.courierName}</p>}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-gray-500 uppercase text-[9px] tracking-wider mb-1">Items Ordered</p>
                                {order.items.map((item, i) => (
                                  <p key={i} className="text-gray-700">{item.name} × {item.quantity} — LKR {(item.price * item.quantity).toLocaleString()}</p>
                                ))}
                                <p className="font-black text-gray-900 pt-1 border-t border-gray-100">Total COD: LKR {order.totalAmount.toLocaleString()}</p>
                              </div>
                            </div>

                            {order.internalNotes && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-[10px] text-gray-500 font-mono whitespace-pre-line">
                                <strong className="text-gray-700">📋 Operation Logs:</strong><br/>
                                {order.internalNotes}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 items-start justify-between">

                              {/* Left: Status + Rider info */}
                              <div className="flex flex-wrap gap-2 items-start">
                                {/* Status section */}
                                <div className="space-y-1.5">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Status</p>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${STATUS_COLORS[order.orderStatus] || "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                      {order.orderStatus}
                                    </span>
                                    <div className="relative">
                                      <select
                                        defaultValue=""
                                        onChange={e => {
                                          if (!e.target.value) return;
                                          handleUpdateStatus(order.orderId, e.target.value);
                                          e.target.value = "";
                                        }}
                                        className="appearance-none bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1.5 pr-8 rounded-xl cursor-pointer hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all shadow-sm"
                                      >
                                        <option value="" disabled>Change status...</option>
                                        {["Pending","Confirmed","Processing","Dispatched","Completed","Cancelled"]
                                          .filter(s => s !== order.orderStatus)
                                          .map(s => (
                                            <option key={s} value={s}
                                              className={
                                                s === "Cancelled" ? "text-rose-600" :
                                                s === "Completed" ? "text-emerald-600" :
                                                s === "Dispatched" ? "text-purple-600" :
                                                "text-gray-700"
                                              }>
                                              {s}
                                            </option>
                                          ))}
                                      </select>
                                      <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                {/* Rider info — show only for Processing status */}
                                {order.orderStatus === "Processing" && (
                                  <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Rider / Courier</p>
                                    <div className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        placeholder="Enter rider or courier name..."
                                        value={riderInfo}
                                        onChange={e => setRiderInfo(e.target.value)}
                                        className="bg-white border border-gray-200 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 w-52"
                                      />
                                      <button
                                        onClick={() => handleUpdateStatus(order.orderId, "Dispatched")}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex-shrink-0"
                                      >
                                        🚚 Dispatch
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right: Note + WhatsApp */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                                  <FileText className="h-3 w-3" /> Invoice
                                </button>
                                <button
                                  onClick={() => setSelectedOrderIdForNotes(selectedOrderIdForNotes === order.orderId ? null : order.orderId)}
                                  className="bg-white border border-gray-200 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
                                  <MessageSquare className="h-3 w-3" /> Add Note
                                </button>
                                <a
                                  href={`https://wa.me/${order.customerInfo.phone}?text=Hi%20${encodeURIComponent(order.customerInfo.name)}%2C%20this%20is%20Candy%20World%20regarding%20order%20${order.orderNumber}.`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                                  💬 WhatsApp
                                </a>
                                <button
                                  onClick={() => handleDeleteOrder(order.orderId)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            </div>

                            {selectedOrderIdForNotes === order.orderId && (
                              <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <input type="text" placeholder="Type internal note or tracking info..."
                                  value={internalNote} onChange={e => setInternalNote(e.target.value)}
                                  className="flex-grow text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <button onClick={() => handleAddNote(order.orderId)}
                                  className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-lg">
                                  Save
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════
              TAB 2 — PRODUCT CATALOG (Owner only)
          ═══════════════════════════════ */}
          {activeTab === "products" && isOwner && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Product Catalog</h2>
                  <p className="text-xs text-gray-400">Full CRUD — {products.length} SKUs</p>
                </div>
                {!showProductForm && (
                  <button onClick={startCreateProduct}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                )}
              </div>

              {/* Product toast notification */}
              {productToast && (
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-lg border ${
                  productToast.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  {productToast.type === "success"
                    ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                    : <XCircle className="h-5 w-5 shrink-0" />}
                  <span>{productToast.text}</span>
                  {productToast.type === "success" && (
                    <a href="/shop" target="_blank" rel="noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                      View Shop <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}

              {showProductForm ? (
                <form onSubmit={handleProductFormSubmit} className="bg-white border border-gray-100 p-6 rounded-2xl space-y-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-gray-800 text-base">
                      {isEditingProduct ? "✏️ Edit Product" : "➕ New Product"}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                      {isEditingProduct ? "Editing — changes go live instantly" : "New product — will appear on website after save"}
                    </span>
                  </div>

                  {/* Row 1: Name + Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name *</label>
                      <input required type="text" value={productForm.name} placeholder="e.g. Haribo Gold Bears 200g"
                        onChange={e => setProductForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Slug (Auto-generated URL)</label>
                      <input readOnly type="text" value={productForm.slug}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-400" />
                    </div>
                  </div>

                  {/* Row 2: Category + Sub-category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Category *</label>
                      <select required value={productForm.categoryId}
                        onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value, subCategoryId: "" }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300">
                        {categories.filter(c => c.parentId === null && c.status === "active").map(cat => (
                          <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Sub-Category (Optional)</label>
                      <select value={productForm.subCategoryId || ""}
                        onChange={e => setProductForm(p => ({ ...p, subCategoryId: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300">
                        <option value="">— None —</option>
                        {categories.filter(c => c.parentId === productForm.categoryId && c.status === "active").map(sub => (
                          <option key={sub.categoryId} value={sub.categoryId}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Prices */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Base Price (LKR) *</label>
                      <input required type="number" min="1" value={productForm.basePrice} placeholder="0"
                        onChange={e => setProductForm(p => ({ ...p, basePrice: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Sale Price (LKR) — Optional</label>
                      <input type="number" min="0" value={productForm.salePrice} placeholder="Leave blank for no sale"
                        onChange={e => setProductForm(p => ({ ...p, salePrice: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (g)</label>
                      <input type="number" min="0" value={productForm.weight} placeholder="100"
                        onChange={e => setProductForm(p => ({ ...p, weight: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                  </div>

                  {/* Row 4: Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Count *</label>
                      <input required type="number" min="0" value={productForm.stockLevel} placeholder="10"
                        onChange={e => setProductForm(p => ({ ...p, stockLevel: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Low Stock Alert Threshold</label>
                      <input required type="number" min="0" value={productForm.lowStockThreshold} placeholder="5"
                        onChange={e => setProductForm(p => ({ ...p, lowStockThreshold: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                  </div>

                  {/* Row 5: Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description *</label>
                    <textarea rows={3} required value={productForm.description} placeholder="Describe the product — taste, ingredients, origin…"
                      onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>

                  {/* Row 6: Images */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" /> Product Images (Paste URL — up to 3)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[0, 1, 2].map(idx => {
                        const imgUrl = (productForm.images || [])[idx] || "";
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt={`preview-${idx}`}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display = "none"; }} />
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-gray-300">
                                  <ImageIcon className="h-6 w-6" />
                                  <span className="text-[9px]">Image {idx + 1}</span>
                                </div>
                              )}
                            </div>
                            <input type="url" value={imgUrl} placeholder="https://example.com/image.jpg"
                              onChange={e => {
                                const imgs = [...(productForm.images || ["", "", ""])];
                                imgs[idx] = e.target.value;
                                setProductForm(p => ({ ...p, images: imgs }));
                              }}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-purple-300" />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400">💡 Paste any public image URL (e.g. from Google Images, Unsplash, or your own CDN). The first image will be the main product photo.</p>
                  </div>

                  {/* Row 7: Flags & Visibility */}
                  <div className="flex gap-5 flex-wrap items-center pt-1 border-t border-gray-50">
                    {[["isFeatured", "⭐ Feature on Homepage"], ["isNewArrival", "🆕 New Arrival Tag"]].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={productForm[key]}
                          onChange={e => setProductForm(p => ({ ...p, [key]: e.target.checked }))}
                          className="rounded accent-purple-500" />
                        {label}
                      </label>
                    ))}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Visibility</span>
                      <select value={productForm.status}
                        onChange={e => setProductForm(p => ({ ...p, status: e.target.value }))}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-300">
                        <option value="active">🟢 Visible (Live)</option>
                        <option value="hidden">🔴 Hidden (Draft)</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button type="submit"
                      className="bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-xs px-7 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {isEditingProduct ? "Save Changes" : "Create Product"}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)}
                      className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="w-full min-w-[700px] text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3 w-12"></th>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Price</th>
                        <th className="px-5 py-3">Stock</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                      {products.map(prod => (
                        <tr key={prod.productId} className="hover:bg-gray-50/50 transition-colors">
                          {/* Thumbnail */}
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                              {prod.images?.[0] ? (
                                <img src={prod.images[0]} alt={prod.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display = "none"; }} />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-gray-300" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900">{prod.name}</div>
                            {prod.subCategoryId && (
                              <span className="text-[9px] text-gray-400">{prod.subCategoryId}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 capitalize">{prod.categoryId}</td>
                          <td className="px-5 py-3.5">
                            {prod.salePrice
                              ? <><span className="text-rose-600 font-black">LKR {prod.salePrice.toLocaleString()}</span> <span className="line-through text-gray-300">{prod.basePrice.toLocaleString()}</span></>
                              : <span>LKR {prod.basePrice.toLocaleString()}</span>
                            }
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                              prod.stockLevel === 0 ? "bg-rose-100 text-rose-700" :
                              prod.stockLevel <= (prod.lowStockThreshold || 5) ? "bg-amber-100 text-amber-700 animate-pulse" :
                              "bg-emerald-100 text-emerald-700"
                            }`}>{prod.stockLevel} units</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${prod.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                              {prod.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => startEditProduct(prod)}
                                className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors"
                                title="Edit">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.productId)}
                                className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-rose-500 hover:text-rose-500 transition-colors"
                                title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════
          {/* ═══════════════════════════════
              TAB 3 — INVENTORY & STOCK
          ═══════════════════════════════ */}
          {activeTab === "inventory" && (() => {
            // Local row-edit state (managed inside IIFE via a wrapper component approach)
            return <InventoryTab
              products={products}
              lowStockProducts={lowStockProducts}
              isOwner={isOwner}
              onSave={async (prod) => {
                const isDraft = prod.stockStatus === "hidden";
                await dbService.saveProduct({
                  ...prod,
                  stockLevel: Number(prod.stockLevel) || 0,
                  lowStockThreshold: Number(prod.lowStockThreshold) || 0,
                  stockStatus: prod.stockStatus,
                  status: isDraft ? "hidden" : "active"
                });
                loadAll();
              }}
            />;
          })()}


          {/* ═══════════════════════════════
              TAB 4 — PROMOTIONS (Owner only)
          ═══════════════════════════════ */}
          {activeTab === "promotions" && isOwner && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">Promotions & Offers</h2>
                <p className="text-xs text-gray-400">Manage discount campaigns and banner promotions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Mega Candy Price Drop", discount: "25% Off Storewide Candies", scope: "Category: Candy", status: "Active", color: "from-rose-400 to-pink-600" },
                  { name: "Premium Swiss Chocolates Sale", discount: "35% Off Selected Chocolates", scope: "Category: Chocolate", status: "Active", color: "from-amber-400 to-orange-600" },
                  { name: "Weekend Gourmet Bundle", discount: "15% Off All Gourmet Items", scope: "Category: Gourmet", status: "Scheduled", color: "from-purple-400 to-indigo-600" },
                ].map((promo, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className={`inline-block text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${promo.color}`}>
                      {promo.status}
                    </div>
                    <h4 className="font-black text-gray-900">{promo.name}</h4>
                    <p className="text-xs text-gray-500">{promo.discount}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{promo.scope}</p>
                    <div className="flex gap-2 pt-2">
                      <button className="text-xs font-bold text-purple-600 border border-purple-100 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-lg">
                        Edit Rules
                      </button>
                      <button className="text-xs font-bold text-gray-400 border border-gray-100 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg">
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-300 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-400">Create New Promotion</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              TAB 5 — ANALYTICS (Owner only)
          ═══════════════════════════════ */}
          {activeTab === "analytics" && isOwner && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">Analytics Dashboard</h2>
                <p className="text-xs text-gray-400">Revenue, conversions & business performance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue", value: `LKR ${orders.filter(o => o.orderStatus !== "Cancelled").reduce((s,o) => s + o.totalAmount, 0).toLocaleString()}`, icon: TrendingUp, color: "from-purple-500 to-indigo-600" },
                  { label: "Total Orders", value: `${orders.length} Orders`, icon: ShoppingBag, color: "from-rose-500 to-pink-600" },
                  { label: "Unique Customers", value: `${customers.length} Users`, icon: Users, color: "from-amber-500 to-orange-600" },
                  { label: "Completed Orders", value: `${orders.filter(o=>o.orderStatus==="Completed").length}`, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
                  { label: "Cancelled Orders", value: `${orders.filter(o=>o.orderStatus==="Cancelled").length}`, icon: XCircle, color: "from-gray-400 to-gray-600" },
                  { label: "Low Stock SKUs", value: `${lowStockProducts.length} Items`, icon: Package, color: "from-amber-500 to-yellow-600" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}>
                    <stat.icon className="h-6 w-6 opacity-60 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-black text-gray-800 text-sm">Meta & TikTok Pixel Conversions</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { event: "PageView",         val: 450 },
                    { event: "ViewContent",      val: 280 },
                    { event: "AddToCart",        val: 95 },
                    { event: "InitiateCheckout", val: 48 },
                    { event: "Purchase",         val: orders.filter(o => o.orderStatus !== "Cancelled").length },
                  ].map(({ event, val }) => (
                    <div key={event} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase">{event}</p>
                      <p className="text-xl font-black text-gray-900 mt-1">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-black text-gray-800 text-sm mb-4">Order Status Breakdown</h4>
                <div className="space-y-2">
                  {["Pending","Confirmed","Processing","Dispatched","Completed","Cancelled"].map(status => {
                    const count = orders.filter(o => o.orderStatus === status).length;
                    const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="w-24 text-[10px] font-black text-gray-500 uppercase">{status}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full bg-gradient-to-r from-rose-400 to-purple-600`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-[10px] font-black text-gray-600 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              TAB 6 — USER MANAGEMENT (Owner only)
          ═══════════════════════════════ */}
          {activeTab === "users" && isOwner && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900">User Management</h2>
                  <p className="text-xs text-gray-400">Add, remove & configure staff access roles</p>
                </div>
                {!showUserForm && (
                  <button onClick={() => setShowUserForm(true)}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                    <Plus className="h-4 w-4" /> Add Staff
                  </button>
                )}
              </div>

              {/* Role Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    <h4 className="font-black text-purple-800 text-sm">Owner / Super Admin</h4>
                  </div>
                  <ul className="text-xs text-purple-700 space-y-1 pl-1">
                    {["All 5 admin modules","Product pricing & catalog","Promotions & discount rules","Analytics & revenue data","Pixel & system settings","User management & role assignment"].map(p => (
                      <li key={p} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-purple-400 flex-shrink-0" />{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-gray-500" />
                    <h4 className="font-black text-gray-700 text-sm">Staff / Operator</h4>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1 pl-1">
                    {["Order management & status updates","Internal notes per order","Inventory view & stock adjustment"].map(p => (
                      <li key={p} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />{p}</li>
                    ))}
                    {["Product pricing","Promotions / discounts","Analytics & revenue","User management"].map(p => (
                      <li key={p} className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-rose-300 flex-shrink-0" />{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {showUserForm && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-black text-gray-800">Add / Update Staff Account</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                      <input type="text" value={userForm.name}
                        onChange={e => setUserForm(u => ({ ...u, name: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Email</label>
                      <input type="email" value={userForm.email}
                        onChange={e => setUserForm(u => ({ ...u, email: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Role</label>
                      <select value={userForm.role}
                        onChange={e => setUserForm(u => ({ ...u, role: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold">
                        <option value="Owner">Owner</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveUser}
                      className="bg-gradient-to-r from-rose-500 to-purple-600 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md">
                      Save User
                    </button>
                    <button onClick={() => setShowUserForm(false)}
                      className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-6 py-2 rounded-xl">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                    {adminUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-400 to-purple-600 text-white flex items-center justify-center font-black text-xs">
                            {u.name?.charAt(0) || "?"}
                          </div>
                          {u.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase border ${
                            u.role === "Owner"
                              ? "bg-purple-50 border-purple-200 text-purple-700"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase ${u.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button onClick={() => handleToggleUserActive(u.uid)}
                            className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-purple-400 hover:text-purple-500 transition-colors"
                            title={u.isActive ? "Deactivate" : "Activate"}>
                            {u.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteUser(u.uid)}
                            disabled={u.email === adminUser.email}
                            className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-rose-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                            title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              TAB 7 — MESSAGES / INBOX
          ═══════════════════════════════ */}
          {activeTab === "messages" && (
            <div className="space-y-5 lg:h-[calc(100vh-140px)] lg:flex lg:flex-col h-auto">
              <div className="flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Customer Inbox</h2>
                  <p className="text-xs text-gray-400">View and respond to inquiries submitted from the website contact form</p>
                </div>
                <div className="flex gap-2">
                  {messages.filter(m => m.status === "unread").length > 0 && (
                    <button
                      onClick={async () => {
                        const unread = messages.filter(m => m.status === "unread");
                        for (const m of unread) {
                          await dbService.saveMessage({ ...m, status: "read" });
                        }
                        loadAll();
                      }}
                      className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
              </div>

              {/* Inbox Container */}
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm lg:flex-1 flex flex-col lg:flex-row min-h-0">
                
                {/* List Panel (Top section on mobile, Left panel on desktop) */}
                <div className="w-full lg:w-80 h-72 lg:h-auto border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col flex-shrink-0 min-h-0">
                  {/* Filter tabs */}
                  <div className="p-3 border-b border-gray-50 flex gap-1">
                    {[
                      { id: "all", label: "All" },
                      { id: "unread", label: "Unread" },
                      { id: "replied", label: "Replied" }
                    ].map(tab => {
                      const count = tab.id === "all" 
                        ? messages.length 
                        : messages.filter(m => m.status === tab.id).length;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setMessageFilter(tab.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                            messageFilter === tab.id
                              ? "bg-purple-500 text-white shadow-sm"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {tab.label}
                          {count > 0 && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                              messageFilter === tab.id ? "bg-white text-purple-600" : "bg-gray-100 text-gray-600"
                            }`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Message List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
                    {messages
                      .filter(m => {
                        if (messageFilter === "all") return true;
                        return m.status === messageFilter;
                      })
                      .length === 0 ? (
                        <div className="text-center py-12 text-gray-300">
                          <Mail className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                          <p className="text-xs font-semibold">No messages found</p>
                        </div>
                      ) : (
                        messages
                          .filter(m => {
                            if (messageFilter === "all") return true;
                            return m.status === messageFilter;
                          })
                          .map(m => {
                            const isSelected = selectedMessage?.id === m.id;
                            return (
                              <div
                                key={m.id}
                                onClick={async () => {
                                  setSelectedMessage(m);
                                  if (m.status === "unread") {
                                    // Automatically mark read when clicking
                                    const updated = { ...m, status: "read" };
                                    await dbService.saveMessage(updated);
                                    loadAll();
                                  }
                                }}
                                className={`p-4 cursor-pointer hover:bg-gray-50/75 transition-colors border-l-4 ${
                                  isSelected 
                                    ? "bg-purple-50/20 border-purple-500" 
                                    : m.status === "unread" 
                                      ? "border-emerald-400 bg-emerald-50/5" 
                                      : "border-transparent"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-extrabold text-gray-900 text-xs truncate max-w-[130px]">{m.name}</span>
                                  <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">
                                    {new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-gray-600 truncate mt-0.5">{m.subject}</p>
                                <p className="text-[11px] text-gray-400 truncate mt-1">{m.message}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    m.status === "unread"
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : m.status === "replied"
                                        ? "bg-purple-50 border-purple-200 text-purple-700"
                                        : "bg-gray-50 border-gray-200 text-gray-500"
                                  }`}>
                                    {m.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                      )}
                  </div>
                </div>

                {/* Content Panel */}
                <div className="flex-1 bg-gray-50/30 flex flex-col min-h-0">
                  {selectedMessage ? (
                    <div className="h-full flex flex-col min-h-0">
                      
                      {/* Sender details */}
                      <div className="bg-white border-b border-gray-100 p-5 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                            {selectedMessage.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-black text-gray-900 text-sm leading-snug">{selectedMessage.name}</h3>
                            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                              {selectedMessage.email} {selectedMessage.phone ? `· ${selectedMessage.phone}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const newStatus = selectedMessage.status === "unread" ? "read" : "unread";
                              const updated = { ...selectedMessage, status: newStatus };
                              await dbService.saveMessage(updated);
                              setSelectedMessage(updated);
                              loadAll();
                            }}
                            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 p-2 rounded-xl text-xs font-bold"
                            title="Toggle read/unread status"
                          >
                            Mark {selectedMessage.status === "unread" ? "Read" : "Unread"}
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Delete this message permanently?")) {
                                await dbService.deleteMessage(selectedMessage.id);
                                setSelectedMessage(null);
                                loadAll();
                              }
                            }}
                            className="bg-white border border-rose-200 hover:border-rose-300 text-rose-500 hover:bg-rose-50/50 p-2 rounded-xl text-xs font-bold"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Message body & Reply History */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              Subject: {selectedMessage.subject}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                              Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </p>
                        </div>

                        {/* Reply Thread */}
                        {selectedMessage.replies?.map((rep, idx) => (
                          <div key={idx} className="flex flex-col items-end space-y-1">
                            <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] text-xs shadow-sm">
                              <p className="font-extrabold text-[10px] opacity-75 mb-1">
                                Reply from {rep.adminName}
                              </p>
                              <p className="leading-relaxed">{rep.text}</p>
                            </div>
                            <span className="text-[9px] text-gray-400 font-semibold mr-1">
                              {new Date(rep.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0 space-y-3">
                        <textarea
                          rows={3}
                          placeholder={`Reply to ${selectedMessage.name}... (Message status will change to 'replied')`}
                          value={messageReply}
                          onChange={(e) => setMessageReply(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-semibold">
                            Pressing send updates message status to &quot;replied&quot;
                          </span>
                          <button
                            onClick={async () => {
                              if (!messageReply.trim()) return;
                              const replies = selectedMessage.replies || [];
                              const newReplies = [
                                ...replies,
                                {
                                  text: messageReply,
                                  adminName: adminUser.name || "Operations Control",
                                  createdAt: new Date(),
                                }
                              ];
                              const updated = {
                                ...selectedMessage,
                                status: "replied",
                                replies: newReplies
                              };
                              await dbService.saveMessage(updated);
                              setSelectedMessage(updated);
                              setMessageReply("");
                              loadAll();
                            }}
                            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                          >
                            <Send className="h-3.5 w-3.5" /> Send Reply
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                      <Mail className="h-12 w-12 text-gray-200 mb-2 animate-bounce" style={{ animationDuration: "2s" }} />
                      <h4 className="font-extrabold text-gray-800 text-sm">Select an Enquiry</h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-1 leading-normal">
                        Select a message from the list on the left to read details, mark status, or reply directly.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              TAB 8 — SYSTEM SETTINGS (Owner only)
          ═══════════════════════════════ */}
          {activeTab === "settings" && isOwner && settingsForm && (
            <div className="space-y-6 max-w-4xl">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900">System Settings</h2>
                  <p className="text-xs text-gray-400">Configure store information, delivery rates, and third-party integrations</p>
                </div>
                <div className="flex items-center gap-3">
                  {settingsSaved && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Settings saved!
                    </span>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await dbService.saveSettings(settingsForm);
                        setSiteSettings(settingsForm);
                        setSettingsSaved(true);
                        setTimeout(() => setSettingsSaved(false), 3000);
                      } catch (e) {
                        console.error("Failed to save settings", e);
                      }
                    }}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" /> Save All Settings
                  </button>
                </div>
              </div>

              {/* — SECTION 1: Store Profile — */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2.5 bg-rose-50 rounded-2xl">
                    <ShoppingBag className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">Store Profile</h3>
                    <p className="text-[11px] text-gray-400">Your brand identity and contact info shown across the website</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { key: "storeName",    label: "Store Name",        type: "text",  placeholder: "Candy World" },
                    { key: "contactEmail", label: "Support Email",      type: "email", placeholder: "candyworld.lk23@gmail.com" },
                    { key: "contactPhone", label: "Contact Phone",      type: "tel",   placeholder: "+94 77 123 4567" },
                    { key: "storeAddress", label: "Store Address",      type: "text",  placeholder: "124 Hokandara Road, Thalawathugoda" },
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <input
                        type={field.type}
                        value={settingsForm[field.key] || ""}
                        onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* — SECTION 2: Delivery & Operations — */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2.5 bg-amber-50 rounded-2xl">
                    <Package className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">Delivery &amp; Pricing</h3>
                    <p className="text-[11px] text-gray-400">Zone-based delivery fees and free shipping thresholds (LKR)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {[
                    { key: "deliveryFeeColombo",    label: "Colombo Zone Fee",      suffix: "LKR" },
                    { key: "deliveryFeeOutstation",  label: "Outstation Fee",         suffix: "LKR" },
                    { key: "freeDeliveryThreshold",  label: "Free Delivery Above",   suffix: "LKR" },
                    { key: "weightExtraCharge",      label: "Weight Surcharge / kg", suffix: "LKR" },
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={settingsForm[field.key] ?? ""}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: Number(e.target.value) }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-black">{field.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 font-medium">
                  💡 <strong>Colombo Zone</strong> includes Colombo, Gampaha, and Kalutara districts. All other districts use the Outstation rate.
                  Orders above the Free Delivery threshold ship for free regardless of zone.
                </div>
              </div>

              {/* — SECTION 3: Integrations — */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2.5 bg-purple-50 rounded-2xl">
                    <ArrowRight className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">Integrations &amp; Pixels</h3>
                    <p className="text-[11px] text-gray-400">EmailJS credentials for order &amp; verification emails, plus tracking pixels</p>
                  </div>
                </div>

                {/* EmailJS */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">✉️ EmailJS Configuration</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "emailjsServiceId",        label: "Service ID",                  placeholder: "service_wanl11i" },
                      { key: "emailjsPublicKey",         label: "Public Key",                  placeholder: "OyFOVHnKDcQ3-Iqs8" },
                      { key: "emailjsTemplateId",        label: "Order Email Template ID",     placeholder: "template_j03vo2h" },
                      { key: "emailjsVerifyTemplateId",  label: "Verify Email Template ID",    placeholder: "template_j03vo2h" },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                        <input
                          type="text"
                          value={settingsForm[field.key] || ""}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pixels */}
                <div className="space-y-4 pt-2 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">📡 Tracking Pixels</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "metaPixelId",   label: "Meta (Facebook) Pixel ID",  placeholder: "FB-1234567890" },
                      { key: "tiktokPixelId", label: "TikTok Pixel ID",            placeholder: "TT-1234567890" },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{field.label}</label>
                        <input
                          type="text"
                          value={settingsForm[field.key] || ""}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-medium">
                    🔎 Pixel events are currently logged to the browser console (mock mode). Wire up the real pixel script tags in <code className="bg-blue-100 px-1 rounded">src/app/layout.js</code> to activate live tracking.
                  </div>
                </div>
              </div>

              {/* — SECTION 4: Danger Zone — */}
              <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-rose-50">
                  <div className="p-2.5 bg-rose-50 rounded-2xl">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-rose-700 text-sm">Danger Zone</h3>
                    <p className="text-[11px] text-gray-400">Irreversible operations — proceed with caution</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (confirm("Reset ALL settings to factory defaults? This cannot be undone.")) {
                        const defaults = {
                          storeName: "Candy World", contactPhone: "+94 77 123 4567",
                          contactEmail: "candyworld.lk23@gmail.com", storeAddress: "124, Hokandara Road, Thalawathugoda, Sri Lanka",
                          metaPixelId: "FB-1234567890", tiktokPixelId: "TT-1234567890",
                          emailjsServiceId: "service_wanl11i", emailjsTemplateId: "template_j03vo2h",
                          emailjsVerifyTemplateId: "template_j03vo2h", emailjsPublicKey: "OyFOVHnKDcQ3-Iqs8",
                          deliveryFeeColombo: 250, deliveryFeeOutstation: 450,
                          freeDeliveryThreshold: 5000, weightExtraCharge: 50
                        };
                        setSettingsForm(defaults);
                      }
                    }}
                    className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reset Settings to Defaults
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Clear all local demo data (orders, messages, customers)? Products will remain. This cannot be undone.")) {
                        ["candy_world_orders", "candy_world_messages", "candy_world_customers"].forEach(k => localStorage.removeItem(k));
                        loadAll();
                      }
                    }}
                    className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Clear Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
