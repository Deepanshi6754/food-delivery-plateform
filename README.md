# 🍔 FoodDelight — Gourmet Food Delivery Platform

A full-stack, state-of-the-art Food Delivery Web Application featuring real-time GPS-style order tracking via **Socket.io**, multi-role authentication & portals (Customer, Restaurant Owner, Delivery Rider, System Admin), dynamic cart management, coupon discounts, customer ratings, and responsive obsidian luxury dark UI.

---

## 🚀 Key Features

### 👤 Customer Experience
- **Gourmet Hotspots & Menus**: Search restaurants by name, cuisine, or dish keyword; filter by cuisine category chips (Burgers, Pizza, Sushi, Indian, Healthy, etc.) and sort by Top Rated or Lowest Delivery Fee.
- **Dietary Badges & Menu Controls**: Pure Veg vs Non-Veg indicators, detailed ingredient descriptions, and dynamic item counters.
- **Smart Cart & Coupons**: Bill breakdown with taxes, free delivery thresholds (> ₹499), and coupon code support (`WELCOME50`, `FLAT20`, `FEAST100`).
- **Live Order Tracking**: 6-stage interactive timeline stepper (*Order Placed ➔ Confirmed ➔ In Kitchen ➔ Ready ➔ On The Way ➔ Delivered*), animated map with driver marker, rider details, and real-time Socket.io updates.
- **Customer Reviews**: Rate restaurants (1-5 stars) and write verified reviews with instant recalculation of average ratings.

### 🍳 Restaurant Owner Portal (`/owner`)
- **Live Kitchen Queue**: Real-time incoming customer orders with status progression (`Confirm` ➔ `Cook` ➔ `Mark Ready` ➔ `Dispatch Rider`).
- **Dish & Menu Management**: Add new menu items with custom categories, price, pure veg checkbox, description, and high-res food image URLs.

### 🛵 Delivery Rider Hub (`/delivery`)
- **Online/Offline Switch**: Real-time rider availability status with visual glowing indicator.
- **Trip Dashboard**: Daily earnings counter, completed deliveries count, and customer rating.
- **Delivery Workflow**: One-tap order pickup and delivery completion with live customer map integration.

### ⚡ System Admin Portal (`/admin`)
- **Platform Analytics**: Aggregate gross merchandise value (GMV), total orders placed, registered users, and active kitchen partners.
- **Global Overview**: Live platform order logs and restaurant partner directory.
- **1-Click Database Re-Seed**: Instantly reset or populate sample restaurants, foods, coupons, and demo accounts.

---

## 🔑 Demo Accounts (1-Click Login Ready)

The application includes pre-configured demo credentials accessible via the 1-click buttons on `/login`:

| Role | Email | Password | Access / Portal |
|---|---|---|---|
| **Customer** | `customer@food.com` | `password123` | Browsing, Cart, Orders, Reviews |
| **Restaurant Owner** | `owner@food.com` | `password123` | Kitchen Portal (`/owner`) |
| **Delivery Rider** | `delivery@food.com` | `password123` | Rider Hub (`/delivery`) |
| **Admin** | `admin@food.com` | `password123` | Platform Admin (`/admin`) |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Redux Toolkit, React Router 6, Socket.io-client, Axios, Vanilla CSS design system (Obsidian Luxury Dark, glassmorphism, responsive grid).
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, Socket.io Server, JWT Auth, Helmet, Morgan, CORS.
- **Payment & Gateway**: Integrated Razorpay order creation and resilient webhook signature verification.

---

## 🏁 Quick Start & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017/foodDelivery`

### 2. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Development Servers
In two separate terminal windows:

**Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```

Open your browser at: `http://localhost:5173`
