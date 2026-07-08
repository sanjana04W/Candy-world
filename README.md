# Candy World 🍭 

A modern and responsive multi-category e-commerce platform built for **Candy World**, a retail business in Sri Lanka specializing in imported candies, chocolates, cosmetics, gourmet foods, and snacks.

The platform transforms the existing manual ordering process through TikTok, WhatsApp, and physical stores into a complete digital shopping experience with online ordering, inventory management, and an admin dashboard.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Built With](https://img.shields.io/badge/Built%20With-Next.js%20%7C%20Firebase-orange)

---

# 📖 About the Project

Candy World is a full-stack e-commerce platform developed to digitize the business operations of Candy World, a retail store located in Colombo, Sri Lanka.

Previously, customers had to contact the business via TikTok or WhatsApp to place orders manually. This project introduces a professional online shopping platform where customers can browse products, add items to the cart, place orders, and receive deliveries through Cash on Delivery (COD).

The system also provides a secure Admin Dashboard that enables administrators to manage products, categories, inventory, customer orders, promotions, and customer information from one centralized platform.

---

# ✨ Features

## 🛍 Customer Features

- Browse all available products
- Search products instantly
- Filter products by category
- Product detail pages
- Shopping cart
- Secure Cash on Delivery (COD) checkout
- Order confirmation page
- Customer registration & login
- User profile management
- Responsive mobile-first design
- Contact form
- Promotional offers page

---

## 🔐 Admin Features

- Secure Admin Login
- Dashboard Overview
- Product Management (CRUD)
- Category Management
- Inventory Management
- Order Management
- Customer Management
- Promotion Management
- Firebase Authentication
- Stock Monitoring

---

# 🍬 Product Categories

- 🍭 Candy
- 🍫 Chocolate
- 💄 Cosmetics
- 🥫 Gourmet Foods
- 🎁 Offers & Sale

---

# 📂 Project Structure

```text
Candy-World/
│
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   └── login/
│   │
│   ├── cart/
│   ├── checkout/
│   │   └── confirmation/
│   ├── contact/
│   ├── login/
│   ├── profile/
│   ├── register/
│   ├── shop/
│   ├── layout.js
│   └── page.js
│
├── components/
│
├── lib/
│
├── firebase/
│
├── services/
│
├── hooks/
│
├── utils/
│
├── public/
│
├── styles/
│
├── .env.local
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.mjs
└── README.md
```

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js | React Framework |
| React.js | Frontend Development |
| Firebase | Backend Platform |
| Firestore | Cloud Database |
| Firebase Authentication | User Authentication |
| Firebase Storage | Image Storage |
| Tailwind CSS | Styling |
| EmailJS | Email Notifications |
| Lucide React | Icons |
| Google Maps | Store Location |
| Vercel | Deployment |

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

- Node.js (18+)
- npm
- Git
- Firebase Account

---

## Clone Repository

```bash
git clone https://github.com/yourusername/candy-world.git

cd candy-world
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a **.env.local** file in the project root.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

NEXT_PUBLIC_EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=YOUR_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

---

## Run Development Server

```bash
npm run dev
```

Open your browser

```
http://localhost:3000
```

---

## Build for Production

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

# 📱 System Workflow

```text
Customer
    │
    ▼
Visit Website
    │
    ▼
Browse Products
    │
    ▼
Search / Filter Products
    │
    ▼
View Product Details
    │
    ▼
Add to Cart
    │
    ▼
Checkout (Cash on Delivery)
    │
    ▼
Order Confirmation
    │
    ▼
Admin Receives Order
    │
    ▼
Inventory Updated
    │
    ▼
Order Processing
```

---

# 🗂 Firebase Collections

| Collection | Description |
|------------|-------------|
| products | Product catalog |
| categories | Product categories |
| orders | Customer orders |
| customers | Customer information |
| promotions | Promotional campaigns |
| adminUsers | Admin accounts |

---

# 👥 User Roles

## Customer

- Browse Products
- Search Products
- Filter Categories
- Register/Login
- Manage Profile
- Add Items to Cart
- Checkout
- Place Orders
- Contact Store

---

## Administrator

- Secure Login
- Dashboard Overview
- Manage Products
- Manage Categories
- Manage Inventory
- Manage Orders
- Manage Promotions
- Manage Customers
- Stock Monitoring

---

# 🎯 Target Audience

- Candy Lovers
- Chocolate Enthusiasts
- Cosmetic Buyers
- Gourmet Food Lovers
- Gift Buyers
- Families
- Teenagers & Young Adults
- Online Shoppers across Sri Lanka

---

# 📈 Business Benefits

- Eliminates manual WhatsApp ordering
- Centralized inventory management
- Faster order processing
- Improved customer experience
- Better product visibility
- Supports islandwide delivery
- Mobile-friendly shopping experience

---

# 🔮 Future Enhancements

- Online Payment Gateway
- Delivery Tracking
- Wishlist
- Loyalty Rewards
- Coupon System
- AI Product Recommendation
- Order History
- Customer Reviews
- Multi-language Support

---

# 💖 Brand Vision

> **"Sweeten your life with candies, chocolates, cosmetics, and gourmet delights."**

Candy World aims to provide customers across Sri Lanka with a seamless online shopping experience while delivering premium imported products through a reliable and modern e-commerce platform.

---

# 📄 License

This project was developed for educational and portfolio purposes.

All branding, logos, product images, and business content belong to **Candy World**.

---

# 👩‍💻 Developed By

### **Wenuri Sanjana**

Software Engineering Undergraduate


---
