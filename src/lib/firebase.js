import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Default configuration with placeholder values.
// If actual env variables are provided, they will be used.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

// Check if we are running in real Firebase mode or mock mode
const isRealFirebase = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key";

let app, db, auth, storage;

if (isRealFirebase) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

// -------------------------------------------------------------
// LOCAL STORAGE MOCK DATABASE (Fallback)
// -------------------------------------------------------------

const DEFAULT_CATEGORIES = [
  { categoryId: "candy", name: "Candy", slug: "candy", parentId: null, displayOrder: 1, status: "active" },
  { categoryId: "chocolate", name: "Chocolate", slug: "chocolate", parentId: null, displayOrder: 2, status: "active" },
  { categoryId: "gourmet", name: "Gourmet", slug: "gourmet", parentId: null, displayOrder: 3, status: "active" },
  // Sub-categories for Candy
  { categoryId: "candy-gummy", name: "Gummy & Jelly Candy", slug: "gummy-jelly", parentId: "candy", displayOrder: 1, status: "active" },
  { categoryId: "candy-lollipops", name: "Lollipops", slug: "lollipops", parentId: "candy", displayOrder: 2, status: "active" },
  { categoryId: "candy-sour", name: "Sour Candy", slug: "sour-candy", parentId: "candy", displayOrder: 3, status: "active" },
  { categoryId: "candy-hard", name: "Hard Candy", slug: "hard-candy", parentId: "candy", displayOrder: 4, status: "active" },
  { categoryId: "candy-bars", name: "Candy Bars", slug: "candy-bars", parentId: "candy", displayOrder: 5, status: "active" },
  { categoryId: "candy-novelty", name: "Novelty & Viral Candy", slug: "novelty-viral", parentId: "candy", displayOrder: 6, status: "active" },
  { categoryId: "candy-pick-mix", name: "Pick & Mix", slug: "pick-mix", parentId: "candy", displayOrder: 7, status: "active" },

  // Sub-categories for Chocolate
  { categoryId: "chocolate-imported", name: "Imported Chocolate Bars", slug: "imported-bars", parentId: "chocolate", displayOrder: 1, status: "active" },
  { categoryId: "chocolate-pralines", name: "Pralines & Truffles", slug: "pralines-truffles", parentId: "chocolate", displayOrder: 2, status: "active" },
  { categoryId: "chocolate-gift", name: "Chocolate Gift Boxes", slug: "gift-boxes", parentId: "chocolate", displayOrder: 3, status: "active" },
  { categoryId: "chocolate-dark", name: "Dark Chocolate", slug: "dark-chocolate", parentId: "chocolate", displayOrder: 4, status: "active" },
  { categoryId: "chocolate-white-milk", name: "White & Milk Chocolate", slug: "white-milk-chocolate", parentId: "chocolate", displayOrder: 5, status: "active" },
  { categoryId: "chocolate-snacks", name: "Chocolate-Covered Snacks", slug: "chocolate-snacks", parentId: "chocolate", displayOrder: 6, status: "active" },

  // Sub-categories for Gourmet
  { categoryId: "gourmet-snacks", name: "Imported Snacks & Crisps", slug: "snacks-crisps", parentId: "gourmet", displayOrder: 1, status: "active" },
  { categoryId: "gourmet-spreads", name: "Spreads & Condiments", slug: "spreads-condiments", parentId: "gourmet", displayOrder: 2, status: "active" },
  { categoryId: "gourmet-beverages", name: "Beverages & Drinks", slug: "beverages-drinks", parentId: "gourmet", displayOrder: 3, status: "active" },
  { categoryId: "gourmet-biscuits", name: "Biscuits & Cookies", slug: "biscuits-cookies", parentId: "gourmet", displayOrder: 4, status: "active" },
  { categoryId: "gourmet-hampers", name: "Gourmet Gift Hampers", slug: "gourmet-hampers", parentId: "gourmet", displayOrder: 5, status: "active" },
];


const DEFAULT_PRODUCTS = [
  // Candy Category
  {
    productId: "prod-1",
    name: "Sour Patch Kids (Original)",
    slug: "sour-patch-kids-original",
    categoryId: "candy",
    subCategoryId: "candy-sour",
    description: "First they're sour, then they're sweet! Soft & chewy candy imported directly from the US. Perfect for kids and adults alike.",
    basePrice: 1200,
    salePrice: 950,
    weight: 140,
    images: ["/images/products/sour-patch.jpg"],
    stockLevel: 15,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: [
      { variantId: "v1-1", name: "140g Pack", price: 950, stockLevel: 10 },
      { variantId: "v1-2", name: "250g Share Pack", price: 1600, stockLevel: 5 }
    ]
  },
  {
    productId: "prod-2",
    name: "Haribo Goldbears Gummy Candy",
    slug: "haribo-goldbears",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "The original gummy bear that started it all. Contains 5 delicious fruit flavors: Lemon, Orange, Pineapple, Raspberry, and Strawberry.",
    basePrice: 850,
    salePrice: null,
    weight: 100,
    images: ["/images/products/haribo-goldbears.jpg"],
    stockLevel: 4,
    lowStockThreshold: 5,
    stockStatus: "lowstock",
    isFeatured: true,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-3",
    name: "Giant Rainbow Lollipop",
    slug: "giant-rainbow-lollipop",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "A colossal swirl lollipop featuring a rainbow design and a sweet, classic fruit flavor. Perfect for party favors and gifts.",
    basePrice: 450,
    salePrice: null,
    weight: 85,
    images: ["/images/products/rainbow-lollipop.jpg"],
    stockLevel: 0,
    lowStockThreshold: 5,
    stockStatus: "outofstock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },

  // Chocolate Category
  {
    productId: "prod-4",
    name: "Toblerone Swiss Milk Chocolate",
    slug: "toblerone-swiss-milk",
    categoryId: "chocolate",
    subCategoryId: "chocolate-imported",
    description: "Iconic triangular Swiss milk chocolate bar with honey and almond nougat. Imported from Switzerland.",
    basePrice: 1100,
    salePrice: 890,
    weight: 100,
    images: ["/images/products/toblerone.jpg"],
    stockLevel: 35,
    lowStockThreshold: 8,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: [
      { variantId: "v4-1", name: "Milk Chocolate 100g", price: 890, stockLevel: 20 },
      { variantId: "v4-2", name: "Dark Chocolate 100g", price: 950, stockLevel: 15 }
    ]
  },
  {
    productId: "prod-5",
    name: "Ferrero Rocher Gift Box (16 Pcs)",
    slug: "ferrero-rocher-16",
    categoryId: "chocolate",
    subCategoryId: "chocolate-gift",
    description: "A whole hazelnut, dipped in smooth chocolaty filling, surrounded by a crispy wafer shell and covered in milk chocolate.",
    basePrice: 3200,
    salePrice: 2850,
    weight: 200,
    images: ["/images/products/ferrero-16.jpg"],
    stockLevel: 12,
    lowStockThreshold: 4,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: true,
    status: "active",
    variants: []
  },


  // Gourmet Category
  {
    productId: "prod-8",
    name: "Pringles Sour Cream & Onion",
    slug: "pringles-sour-cream-onion",
    categoryId: "gourmet",
    subCategoryId: "gourmet-snacks",
    description: "The awesome flavor of sour cream, onion and potato together can't be measured by modern science. Imported stackable chips.",
    basePrice: 950,
    salePrice: 790,
    weight: 165,
    images: ["/images/products/pringles-sour.jpg"],
    stockLevel: 18,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-9",
    name: "Nutella Hazelnut Spread",
    slug: "nutella-hazelnut-spread",
    categoryId: "gourmet",
    subCategoryId: "gourmet-spreads",
    description: "Original creamy hazelnut cocoa spread that turns a simple snack into an extraordinary treat. Great with pancakes and bread.",
    basePrice: 2400,
    salePrice: null,
    weight: 350,
    images: ["/images/products/nutella.jpg"],
    stockLevel: 3,
    lowStockThreshold: 5,
    stockStatus: "lowstock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },

  // New Requested Products
  {
    productId: "prod-10",
    name: "Classic Jelly Beans",
    slug: "classic-jelly-beans",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Assorted fruit flavored gourmet jelly beans. Chewy, sweet, and bursting with colorful flavors.",
    basePrice: 650,
    salePrice: null,
    weight: 150,
    images: ["https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=600&q=80"],
    stockLevel: 25,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-11",
    name: "Mix Gummy Cup",
    slug: "mix-gummy-cup",
    categoryId: "candy",
    subCategoryId: "candy-pick-mix",
    description: "A fun cup filled to the brim with an assortment of our best gummy candies. Perfect for sweet tooth cravings.",
    basePrice: 850,
    salePrice: 750,
    weight: 250,
    images: ["/images/products/Mix Gummy Cup.jpg"],
    stockLevel: 30,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-12",
    name: "Kit Kat Chocolate Bouquet",
    slug: "kit-kat-bouquet",
    categoryId: "chocolate",
    subCategoryId: "chocolate-gift",
    description: "An elegant, handcrafted bouquet made entirely of delicious Kit Kat bars. The ultimate gift for chocolate lovers.",
    basePrice: 3800,
    salePrice: null,
    weight: 450,
    images: ["/images/products/kitkat-bouquet.jpg"],
    stockLevel: 10,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-13",
    name: "Mini Gummies Pack",
    slug: "mini-gummies-pack",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Bite-sized mini gummy candies in various fruit shapes. Soft, chewy, and highly addictive.",
    basePrice: 400,
    salePrice: null,
    weight: 80,
    images: ["/images/products/Mini Gummies Pack.jpg"],
    stockLevel: 40,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-14",
    name: "Coca Cola Gummies",
    slug: "coca-cola-gummies",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Classic cola bottle shaped gummies with a refreshing and sweet cola taste.",
    basePrice: 500,
    salePrice: null,
    weight: 120,
    images: ["/images/products/Coca Cola Gummies.jpg"],
    stockLevel: 35,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-15",
    name: "Classic Gummy Bears",
    slug: "classic-gummy-bears",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Traditional soft and delicious gummy bears in classic fruit flavors.",
    basePrice: 550,
    salePrice: 480,
    weight: 150,
    images: ["https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80"],
    stockLevel: 50,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-16",
    name: "Fried Egg Gummy Candy",
    slug: "fried-egg-gummy",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Fun, fried-egg shaped sweet gummies with a soft white foam back and a fruity yolk.",
    basePrice: 480,
    salePrice: null,
    weight: 100,
    images: ["/images/products/Fried Egg Gummy Candy.jpg"],
    stockLevel: 15,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-17",
    name: "Sweet Berry Gummies",
    slug: "sweet-berry-gummies",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Raspberry and blackberry shaped crunchy sugar pearl coated soft gummies.",
    basePrice: 600,
    salePrice: null,
    weight: 120,
    images: ["/images/products/Sweet Berry Gummies.jpg"],
    stockLevel: 22,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-18",
    name: "Mini Burger Gummy",
    slug: "mini-burger-gummy",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Individually wrapped mini gummy burgers. Layered with detailed bun, cheese, and lettuce shapes.",
    basePrice: 350,
    salePrice: null,
    weight: 50,
    images: ["/images/products/Mini Burger Gummy.jpg"],
    stockLevel: 60,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-19",
    name: "Crocodile Gummy Candy",
    slug: "crocodile-gummy",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Giant crocodile shaped gummies with a sweet marshmallow underbelly and fruity top.",
    basePrice: 650,
    salePrice: null,
    weight: 150,
    images: ["/images/products/Crocodile Gummy Candy.jpg"],
    stockLevel: 18,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-20",
    name: "Sour Cola Gummies",
    slug: "sour-cola-gummies",
    categoryId: "candy",
    subCategoryId: "candy-sour",
    description: "Fizzy, sour sugar-coated cola bottles that pack a tangy punch.",
    basePrice: 550,
    salePrice: 490,
    weight: 120,
    images: ["/images/products/Sour Cola Gummies.jpg"],
    stockLevel: 28,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-21",
    name: "Rainbow Frizz Gummy",
    slug: "rainbow-frizz-gummy",
    categoryId: "candy",
    subCategoryId: "candy-sour",
    description: "Colorful sour belts with rainbow stripes coated in dynamic sour powder.",
    basePrice: 600,
    salePrice: null,
    weight: 100,
    images: ["/images/products/rainbow.jpg"],
    stockLevel: 30,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-22",
    name: "Spooky Gummy Eyeballs",
    slug: "gummy-eye-ball",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Individually packed gummy eyeballs with a liquid sour fruit center. A viral TikTok favorite!",
    basePrice: 750,
    salePrice: null,
    weight: 75,
    images: ["/images/products/Spooky Gummy Eyeballs.jpg"],
    stockLevel: 14,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-23",
    name: "Watermelon Gummy Ball",
    slug: "watermelon-gummy-ball",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Watermelon flavored round liquid-filled soft gummy balls.",
    basePrice: 650,
    salePrice: null,
    weight: 90,
    images: ["/images/products/Watermelon Gummy Ball.jpg"],
    stockLevel: 22,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-24",
    name: "Gold Chocolate Coins",
    slug: "chocolate-coin",
    categoryId: "chocolate",
    subCategoryId: "chocolate-snacks",
    description: "Classic milk chocolate coins wrapped in shiny gold foil wrapper.",
    basePrice: 450,
    salePrice: null,
    weight: 70,
    images: ["/images/products/Gold Chocolate Coins.jpg"],
    stockLevel: 50,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-25",
    name: "Coffee Nut Hard Candy",
    slug: "coffee-nut-candy",
    categoryId: "candy",
    subCategoryId: "candy-hard",
    description: "Rich, aromatic coffee flavored hard candies with a crunchy nut center.",
    basePrice: 700,
    salePrice: null,
    weight: 180,
    images: ["/images/products/Coffee Nut Hard Candy.jpg"],
    stockLevel: 15,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-26",
    name: "Kit Kat Chunky Bar",
    slug: "kit-kat-bar",
    categoryId: "chocolate",
    subCategoryId: "chocolate-imported",
    description: "Crispy wafer bar covered in smooth, thick milk chocolate. Single bar.",
    basePrice: 380,
    salePrice: null,
    weight: 40,
    images: ["/images/products/Kit Kat Chunky Bar.jpg"],
    stockLevel: 100,
    lowStockThreshold: 15,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-27",
    name: "Popin Cookin Candy Kit",
    slug: "popin-candy",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "DIY Japanese candy kit. Create your own mini sweets with edible powders and water.",
    basePrice: 1600,
    salePrice: 1450,
    weight: 120,
    images: ["/images/products/Popin Cookin Candy Kit.jpg"],
    stockLevel: 8,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-28",
    name: "Strawberry Gummy Ball",
    slug: "strawberry-gummy-ball",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Round, chewy strawberry liquid-filled gummy spheres.",
    basePrice: 650,
    salePrice: null,
    weight: 90,
    images: ["/images/products/Strawberry Gummy Ball.jpg"],
    stockLevel: 20,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-29",
    name: "Imported Strawberry Oreo",
    slug: "strawberry-oreo",
    categoryId: "gourmet",
    subCategoryId: "gourmet-biscuits",
    description: "Crispy dark chocolate sandwich cookies filled with rich strawberry cream.",
    basePrice: 850,
    salePrice: null,
    weight: 120,
    images: ["/images/products/Imported Strawberry Oreo.jpg"],
    stockLevel: 18,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-30",
    name: "Chewy Sour Candy Balls",
    slug: "chew-sour-candy",
    categoryId: "candy",
    subCategoryId: "candy-sour",
    description: "Super sour chewy candy balls with intense fruit centers.",
    basePrice: 500,
    salePrice: null,
    weight: 100,
    images: ["/images/products/Chewy Sour Candy Balls.jpg"],
    stockLevel: 45,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-31",
    name: "Sprite Toffee Candy",
    slug: "sprite-toffee",
    categoryId: "candy",
    subCategoryId: "candy-hard",
    description: "Lemon-lime soda flavored hard toffees. Refreshing and sweet.",
    basePrice: 600,
    salePrice: null,
    weight: 150,
    images: ["/images/products/Sprite Toffee Candy.jpg"],
    stockLevel: 30,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-32",
    name: "Goods Premium Chocolate",
    slug: "goods-chocolate",
    categoryId: "chocolate",
    subCategoryId: "chocolate-imported",
    description: "Smooth, velvety premium imported dark milk chocolate bar.",
    basePrice: 1200,
    salePrice: 1050,
    weight: 100,
    images: ["/images/products/Goods Premium Chocolate.jpg"],
    stockLevel: 25,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-33",
    name: "Cadbury Dairy Milk Chocolate",
    slug: "dairy-milk-chocolate",
    categoryId: "chocolate",
    subCategoryId: "chocolate-imported",
    description: "Classic smooth and creamy Cadbury Dairy Milk chocolate bar from the UK.",
    basePrice: 750,
    salePrice: null,
    weight: 110,
    images: ["/images/products/Cadbury Dairy Milk Chocolate.jpg"],
    stockLevel: 60,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-34",
    name: "Snickers Chocolate Bar",
    slug: "snickers",
    categoryId: "chocolate",
    subCategoryId: "chocolate-imported",
    description: "Milk chocolate, peanuts, caramel, and nougat bar. Full-sized imported bar.",
    basePrice: 420,
    salePrice: null,
    weight: 50,
    images: ["/images/products/Snickers Chocolate Bar.jpg"],
    stockLevel: 80,
    lowStockThreshold: 10,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-35",
    name: "Mixed Candy Party Cup",
    slug: "mix-candy-cup",
    categoryId: "candy",
    subCategoryId: "candy-pick-mix",
    description: "An assortment of hard, chewy, and sour candies inside a fun party cup.",
    basePrice: 900,
    salePrice: null,
    weight: 250,
    images: ["/images/products/Mixed Candy Party Cup.jpg"],
    stockLevel: 15,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-36",
    name: "Heart Gummy Gift Box",
    slug: "heart-gummy-box",
    categoryId: "candy",
    subCategoryId: "candy-pick-mix",
    description: "Beautiful heart shaped gift box loaded with colorful, fruity gummy hearts.",
    basePrice: 1800,
    salePrice: 1500,
    weight: 300,
    images: ["/images/products/Heart Gummy Gift Box.jpg"],
    stockLevel: 12,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-37",
    name: "Valentine Special Chocolate Box",
    slug: "valentine-box",
    categoryId: "chocolate",
    subCategoryId: "chocolate-gift",
    description: "Heart shaped box filled with premium assorted chocolates and truffles.",
    basePrice: 4500,
    salePrice: 3900,
    weight: 350,
    images: ["/images/products/Valentine Special Chocolate Box.jpg"],
    stockLevel: 8,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-38",
    name: "Assorted Chocolate Box",
    slug: "chocolate-box",
    categoryId: "chocolate",
    subCategoryId: "chocolate-gift",
    description: "Gift box featuring a variety of milk, dark, and white chocolate pralines.",
    basePrice: 3200,
    salePrice: null,
    weight: 250,
    images: ["/images/products/Assorted Chocolate Box.jpg"],
    stockLevel: 20,
    lowStockThreshold: 4,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-39",
    name: "6-Pack Candy Collection",
    slug: "6-candy-pack",
    categoryId: "candy",
    subCategoryId: "candy-pick-mix",
    description: "A combination of 6 different viral and premium candy packs to try out.",
    basePrice: 2800,
    salePrice: 2400,
    weight: 600,
    images: ["/images/products/6-Pack Candy Collection.jpg"],
    stockLevel: 15,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-40",
    name: "Cadbury Dairy Milk Bouquet",
    slug: "dairy-milk-bouquet",
    categoryId: "chocolate",
    subCategoryId: "chocolate-gift",
    description: "Gift bouquet created with Cadbury Dairy Milk chocolate bars. Exquisitely packed.",
    basePrice: 3800,
    salePrice: null,
    weight: 400,
    images: ["/images/products/Cadbury Dairy Milk Chocolate.jpg"],
    stockLevel: 10,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-41",
    name: "Mixed Gummy Sharing Box",
    slug: "mix-gummy-box",
    categoryId: "candy",
    subCategoryId: "candy-pick-mix",
    description: "A large box packed with our complete catalog of gummy candies for sharing.",
    basePrice: 3500,
    salePrice: null,
    weight: 800,
    images: ["/images/products/Mixed Gummy Sharing Box.jpg"],
    stockLevel: 12,
    lowStockThreshold: 3,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  },
  {
    productId: "prod-42",
    name: "Peel-Off Mango Gummy",
    slug: "peel-off-gummy",
    categoryId: "candy",
    subCategoryId: "candy-novelty",
    description: "Mango flavored peelable gummy candy. Peel off the outer layer to reveal a soft fruit core. Viral hit!",
    basePrice: 750,
    salePrice: 650,
    weight: 120,
    images: ["/images/products/Peel-Off Mango Gummy.jpg"],
    stockLevel: 25,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: true,
    isNewArrival: true,
    status: "active",
    variants: []
  },
  {
    productId: "prod-43",
    name: "Haribo Mini Goldbears Pack",
    slug: "mini-haribo-gummies",
    categoryId: "candy",
    subCategoryId: "candy-gummy",
    description: "Individually wrapped mini packets of legendary Haribo Goldbears.",
    basePrice: 950,
    salePrice: null,
    weight: 220,
    images: ["/images/products/Haribo Mini Goldbears Pack.jpg"],
    stockLevel: 30,
    lowStockThreshold: 5,
    stockStatus: "instock",
    isFeatured: false,
    isNewArrival: false,
    status: "active",
    variants: []
  }
];

const DEFAULT_PROMOTIONS = [
  { promoId: "promo-1", title: "Mega Candy Price Drop - 25% Off!", discountPercentage: 25, isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 7 * 86400000) },
  { promoId: "promo-2", title: "Premium Chocolates Discount - 35% Off!", discountPercentage: 35, isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 10 * 86400000) }
];

const DEFAULT_ADMIN_USERS = [
  { uid: "admin-owner", name: "Candy Owner", email: "owner@candyworld.lk", role: "Owner", isActive: true },
  { uid: "admin-staff", name: "Candy Staff", email: "staff@candyworld.lk", role: "Staff", isActive: true }
];

// Data version — increment this whenever DEFAULT_PRODUCTS changes to force cache refresh
const DATA_VERSION = "v4.0-2026-07-07-images-fix";

// Load or Seed DB Helper — with automatic version-based cache busting
const initializeDB = () => {
  if (typeof window === "undefined") return;
  const storedVersion = localStorage.getItem("candy_world_data_version");
  
  if (storedVersion !== DATA_VERSION) {
    const existingProductsStr = localStorage.getItem("candy_world_products");
    if (!existingProductsStr) {
      localStorage.setItem("candy_world_products", JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      try {
        const existingProducts = JSON.parse(existingProductsStr);
        let updated = false;
        
        const upgradedProducts = existingProducts.map(eprod => {
          const defaultProd = DEFAULT_PRODUCTS.find(dp => dp.productId === eprod.productId);
          if (defaultProd) {
            // Check if existing product has placeholder image (e.g., placehold.co, dummyimage, etc.) or doesn't match local path
            const hasPlaceholder = !eprod.images || eprod.images.length === 0 || eprod.images.some(img => img.includes("placehold") || img.includes("dummyimage"));
            if (hasPlaceholder) {
              updated = true;
              return {
                ...eprod,
                images: defaultProd.images
              };
            }
          }
          return eprod;
        });

        if (updated) {
          localStorage.setItem("candy_world_products", JSON.stringify(upgradedProducts));
        }
      } catch (err) {
        console.error("Error upgrading products data:", err);
      }
    }
    
    if (!localStorage.getItem("candy_world_categories")) {
      localStorage.setItem("candy_world_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
    localStorage.setItem("candy_world_data_version", DATA_VERSION);
  }
};

// Call once on module load (client-side only)
if (typeof window !== "undefined") {
  initializeDB();
}

const getMockData = (key, defaultVal) => {
  if (typeof window === "undefined") return defaultVal;
  const val = localStorage.getItem(`candy_world_${key}`);
  if (!val) {
    localStorage.setItem(`candy_world_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(val);
};

const saveMockData = (key, data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`candy_world_${key}`, JSON.stringify(data));
    // Notify same-tab components
    window.dispatchEvent(new CustomEvent("candy_catalog_updated", { detail: { key } }));
    // Notify OTHER tabs via storage event (cross-tab sync)
    localStorage.setItem("candy_world_sync_signal", JSON.stringify({ key, ts: Date.now() }));
  }
};

const DEFAULT_SETTINGS = {
  storeName: "Candy World",
  contactPhone: "+94 77 123 4567",
  contactEmail: "candyworld.lk23@gmail.com",
  storeAddress: "124, Hokandara Road, Thalawathugoda, Sri Lanka",
  metaPixelId: "FB-1234567890",
  tiktokPixelId: "TT-1234567890",
  emailjsServiceId: "service_wanl11i",
  emailjsTemplateId: "template_j03vo2h",
  emailjsVerifyTemplateId: "template_j03vo2h",
  emailjsPublicKey: "OyFOVHnKDcQ3-Iqs8",
  deliveryFeeColombo: 250,
  deliveryFeeOutstation: 450,
  freeDeliveryThreshold: 5000,
  weightExtraCharge: 50
};


// -------------------------------------------------------------
// EXPORTED SERVICE INTERFACES
// -------------------------------------------------------------

export const getDBService = () => {
  if (isRealFirebase) {
    // Real Firestore wrappers would go here. For the scope of Phase 1-5,
    // we use a fully functional mock system backed by LocalStorage,
    // and stub real client configurations so it runs seamlessly on local.
  }
  
  return {
    // --- Products ---
    getProducts: async () => {
      return getMockData("products", DEFAULT_PRODUCTS);
    },
    getProductBySlug: async (slug) => {
      const prods = getMockData("products", DEFAULT_PRODUCTS);
      return prods.find(p => p.slug === slug && p.status === "active") || null;
    },
    saveProduct: async (product) => {
      const prods = getMockData("products", DEFAULT_PRODUCTS);
      const index = prods.findIndex(p => p.productId === product.productId);
      if (index > -1) {
        prods[index] = { ...prods[index], ...product, updatedAt: new Date() };
      } else {
        prods.push({ ...product, productId: `prod-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() });
      }
      saveMockData("products", prods);
      return true;
    },
    deleteProduct: async (productId) => {
      const prods = getMockData("products", DEFAULT_PRODUCTS);
      const updated = prods.filter(p => p.productId !== productId);
      saveMockData("products", updated);
      return true;
    },

    // --- Categories ---
    getCategories: async () => {
      return getMockData("categories", DEFAULT_CATEGORIES);
    },
    saveCategory: async (category) => {
      const cats = getMockData("categories", DEFAULT_CATEGORIES);
      const index = cats.findIndex(c => c.categoryId === category.categoryId);
      if (index > -1) {
        cats[index] = { ...cats[index], ...category };
      } else {
        cats.push({ ...category, categoryId: `cat-${Date.now()}` });
      }
      saveMockData("categories", cats);
      return true;
    },

    // --- Orders ---
    getOrders: async () => {
      return getMockData("orders", []);
    },
    createOrder: async (orderData) => {
      const orders = getMockData("orders", []);
      const products = getMockData("products", DEFAULT_PRODUCTS);

      // Decrement stock for purchased items
      orderData.items.forEach(item => {
        const prodIndex = products.findIndex(p => p.productId === item.productId);
        if (prodIndex > -1) {
          const product = products[prodIndex];
          if (item.variantId && product.variants) {
            const varIndex = product.variants.findIndex(v => v.variantId === item.variantId);
            if (varIndex > -1) {
              product.variants[varIndex].stockLevel = Math.max(0, product.variants[varIndex].stockLevel - item.quantity);
            }
          } else {
            product.stockLevel = Math.max(0, product.stockLevel - item.quantity);
          }

          // Update stock status based on stock level
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

      saveMockData("products", products);

      const newOrder = {
        ...orderData,
        orderId: `ord-${Date.now()}`,
        orderNumber: `CW-${10000 + orders.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      orders.push(newOrder);
      saveMockData("orders", orders);

      // Save customer record or update count
      const customers = getMockData("customers", []);
      const custIndex = customers.findIndex(c => c.phone === orderData.customerInfo.phone);
      if (custIndex > -1) {
        customers[custIndex].totalOrdersCount += 1;
        customers[custIndex].lifetimeValue += orderData.totalAmount;
        customers[custIndex].lastOrderDate = new Date();
      } else {
        customers.push({
          customerId: `cust-${Date.now()}`,
          name: orderData.customerInfo.name,
          phone: orderData.customerInfo.phone,
          email: orderData.customerInfo.email,
          addresses: [orderData.customerInfo.address],
          district: orderData.customerInfo.district,
          totalOrdersCount: 1,
          lifetimeValue: orderData.totalAmount,
          lastOrderDate: new Date()
        });
      }
      saveMockData("customers", customers);

      return newOrder;
    },
    updateOrderStatus: async (orderId, status, internalNote = "", riderInfo = "") => {
      const orders = getMockData("orders", []);
      const index = orders.findIndex(o => o.orderId === orderId);
      if (index > -1) {
        const order = orders[index];
        const oldStatus = order.orderStatus;
        order.orderStatus = status;
        order.updatedAt = new Date();
        if (internalNote) {
          order.internalNotes = (order.internalNotes || "") + `\n[${new Date().toLocaleDateString()}] ${internalNote}`;
        }
        if (status === "Dispatched" && riderInfo) {
          order.courierName = riderInfo;
        }

        // If cancelled, restore stock
        if (status === "Cancelled" && oldStatus !== "Cancelled") {
          const products = getMockData("products", DEFAULT_PRODUCTS);
          order.items.forEach(item => {
            const prodIndex = products.findIndex(p => p.productId === item.productId);
            if (prodIndex > -1) {
              const product = products[prodIndex];
              if (item.variantId && product.variants) {
                const varIndex = product.variants.findIndex(v => v.variantId === item.variantId);
                if (varIndex > -1) {
                  product.variants[varIndex].stockLevel += item.quantity;
                }
              } else {
                product.stockLevel += item.quantity;
              }
              product.stockStatus = "instock"; // simple restore
            }
          });
          saveMockData("products", products);
        }

        orders[index] = order;
        saveMockData("orders", orders);
        return true;
      }
      return false;
    },

    // --- Customers ---
    getCustomers: async () => {
      return getMockData("customers", []);
    },
    registerCustomer: async (customerData) => {
      const customers = getMockData("customers", []);
      // Normalize email to prevent mobile autocorrect/trailing space issues
      const normalizedEmail = customerData.email.trim().toLowerCase();

      // Check if email already exists
      if (customers.find(c => c.email.trim().toLowerCase() === normalizedEmail)) {
        throw new Error("Email already registered");
      }
      const newCustomer = {
        ...customerData,
        email: normalizedEmail,
        customerId: `cust-${Date.now()}`,
        addresses: [],
        totalOrdersCount: 0,
        lifetimeValue: 0,
        createdAt: new Date(),
        // Mocking a password hash by storing plain text for local demo
      };
      customers.push(newCustomer);
      saveMockData("customers", customers);
      
      // Auto-login
      if (typeof window !== "undefined") {
        localStorage.setItem("candy_world_logged_customer", JSON.stringify(newCustomer));
      }
      return newCustomer;
    },
    loginCustomer: async (email, password) => {
      const customers = getMockData("customers", []);
      const normalizedEmail = email.trim().toLowerCase();
      
      // Allow any password for testing by only matching the email
      const user = customers.find(c => c.email.trim().toLowerCase() === normalizedEmail);
      if (user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("candy_world_logged_customer", JSON.stringify(user));
        }
        return user;
      }
      throw new Error("Invalid email or password");
    },
    getCurrentCustomer: () => {
      if (typeof window === "undefined") return null;
      const user = localStorage.getItem("candy_world_logged_customer");
      return user ? JSON.parse(user) : null;
    },
    logoutCustomer: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("candy_world_logged_customer");
      }
    },
    updateCustomer: async (email, updatedFields) => {
      const customers = getMockData("customers", []);
      const index = customers.findIndex(c => c.email === email);
      if (index > -1) {
        const updatedUser = { ...customers[index], ...updatedFields };
        customers[index] = updatedUser;
        saveMockData("customers", customers);
        if (typeof window !== "undefined") {
          localStorage.setItem("candy_world_logged_customer", JSON.stringify(updatedUser));
        }
        return updatedUser;
      }
      throw new Error("User not found");
    },

    // --- Promotions ---
    getPromotions: async () => {
      return getMockData("promotions", DEFAULT_PROMOTIONS);
    },

    // --- Messages / Enquiries ---
    getMessages: async () => {
      return getMockData("messages", []);
    },
    saveMessage: async (msg) => {
      const messages = getMockData("messages", []);
      const index = messages.findIndex(m => m.id === msg.id);
      const newMsg = {
        id: msg.id || `msg-${Date.now()}`,
        name: msg.name,
        email: msg.email,
        phone: msg.phone || "",
        subject: msg.subject,
        message: msg.message,
        status: msg.status || "unread", // "unread", "read", "replied"
        createdAt: msg.createdAt || new Date(),
      };
      if (index > -1) {
        messages[index] = newMsg;
      } else {
        messages.push(newMsg);
      }
      saveMockData("messages", messages);
      return newMsg;
    },
    deleteMessage: async (id) => {
      const messages = getMockData("messages", []);
      const updated = messages.filter(m => m.id !== id);
      saveMockData("messages", updated);
      return true;
    },

    // --- System Settings ---
    getSettings: async () => {
      return getMockData("settings", DEFAULT_SETTINGS);
    },
    saveSettings: async (settings) => {
      const current = getMockData("settings", DEFAULT_SETTINGS);
      const updated = { ...current, ...settings };
      saveMockData("settings", updated);
      return updated;
    },

    // --- Admin Users & Auth Simulation ---
    getAdminUsers: async () => {
      return getMockData("adminUsers", DEFAULT_ADMIN_USERS);
    },
    loginAdmin: async (email, password) => {
      const admins = getMockData("adminUsers", DEFAULT_ADMIN_USERS);
      const user = admins.find(a => a.email === email);
      if (user && password === "admin123") { // default password for testing
        if (typeof window !== "undefined") {
          localStorage.setItem("candy_world_logged_admin", JSON.stringify(user));
        }
        return user;
      }
      throw new Error("Invalid credentials");
    },
    getCurrentAdminUser: () => {
      if (typeof window === "undefined") return null;
      const user = localStorage.getItem("candy_world_logged_admin");
      return user ? JSON.parse(user) : null;
    },
    logoutAdmin: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("candy_world_logged_admin");
      }
    },

    // --- Site Settings ---
    getSettings: async () => {
      return getMockData("settings", DEFAULT_SETTINGS);
    },
    saveSettings: async (settings) => {
      saveMockData("settings", settings);
      return true;
    },
  };
};

export { db, auth, storage };
