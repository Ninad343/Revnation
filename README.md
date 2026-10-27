# RevNation 🏁
### The Premier Automobile Parts, Modification & Performance Marketplace (MERN Stack)

RevNation is a full-stack, production-style MERN web application built specifically for automobile enthusiasts, performance workshops, track drivers, and verified aftermarket parts sellers.

---

## 🌟 Key Product Features

### 1. 🏎️ "My Garage" Vehicle Compatibility Engine
- Drivers can save multiple vehicles (Make, Model, Year, Trim, Fuel Type) in their profile.
- **Active Vehicle Switcher**: Select an active vehicle from the navigation bar at any time.
- **Dynamic Fitment Badges**: Parts display **"✓ Guaranteed Fit for your 2022 BMW 330i"** or **"Compatibility not confirmed"** based on engineering database checks.
- **Chassis Filter**: 1-click filter that only displays verified compatible parts for the driver's active ride.

### 2. 🛡️ Strict Role-Based Access Control (RBAC)
- **Roles**: `USER`, `SELLER`, `ADMIN`.
- New registrations strictly receive the `USER` role.
- Normal users **CANNOT** list products or access seller/admin endpoints.
- Backend authorization middleware strictly blocks unauthorized API calls with `403 Forbidden`.

### 3. 🏪 Seller Onboarding & Administrator Approval Workflow
- Normal users can apply via the **"Become a Seller"** portal (submitting business name, GSTIN, facility address, and categories).
- The application enters `PENDING` review status.
- **Administrator Review**: Administrators review the business credentials in the Admin Control Center.
- Upon Admin approval, the user's role is programmatically upgraded to `SELLER`, unlocking:
  - Seller Dashboard with revenue, low-stock warnings, and order fulfillment tracking.
  - Full Product CRUD (name, part number, technical specifications builder, vehicle compatibility matrix, performance badges, warranty).
  - Rapid Inventory Stock Manager (inline quantity updates).
  - Order Fulfillment (AWB tracking numbers and status progression).

### 4. 🛒 Complete E-Commerce Pipeline
- **Shopping Cart**: Real-time stock validation, persistent per authenticated user, subtotal computation, automated free shipping thresholds.
- **Checkout**: 3-step checkout with address selection, order review, and safe development test payment sandbox mode.
- **Atomic Stock Management**: MongoDB decrement on order placement; automatic stock restoration if an eligible order is cancelled.
- **Order Tracking**: Visual step progression (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED`).
- **Verified Purchase Reviews**: Only customers who ordered and received confirmed orders for a part can submit 1–5 star reviews with automatic rating distribution recalculation.
- **Wishlist**: Persistent saved parts list with single-click "Move to Cart".

---

## 🧱 Architecture & Tech Stack

```
revnation/
│
├── client/                     # Frontend (React 19 + Vite 8 + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProductCard, VehicleSelectorModal, Route Guards
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, ToastContext, NotificationContext
│   │   ├── layouts/            # RootLayout, SellerLayout, AdminLayout
│   │   ├── pages/              # Home, Catalog, Details, Cart, Checkout, Garage, Profile, BecomeSeller
│   │   │   ├── admin/          # Dashboard, Sellers, Users, Products, Orders, Categories, Reviews, AuditLogs
│   │   │   └── seller/         # Dashboard, Products, AddEditProduct, Orders, Inventory, Profile
│   │   ├── services/           # Axios API client with automatic JWT interceptor
│   │   └── index.css           # Automotive styling & custom scrollbars
│   └── package.json
│
├── server/                     # Backend (Node.js + Express.js + Mongoose + JWT)
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Auth, Product, Category, Cart, Order, Wishlist, Review, Seller, Admin
│   ├── middleware/             # JWT auth & RBAC authorization, centralized error handling
│   ├── models/                 # User, Product, Category, Cart, Order, Review, SellerApplication, AuditLog, Notification
│   ├── routes/                 # Express REST API routes
│   ├── seed/                   # High-fidelity automotive seed dataset
│   ├── tests/                  # Comprehensive 25-step automated workflow & RBAC test suite
│   ├── server.js               # Main Express application entrypoint
│   └── package.json
│
├── README.md
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Install Dependencies
Run the following from the `revnation` root directory:
```bash
npm run install:all
```
*(Alternatively, run `npm install` inside both `server/` and `client/` directories)*

### 3. Seed Database
Seed the database with pre-configured automotive categories, products, test users, sellers, and admin accounts:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Verify that all 25 critical integration workflows and RBAC security gates pass:
```bash
npm run test:server
```

### 5. Start Development Servers
In terminal 1 (Backend API on port 5000):
```bash
npm run server
```

In terminal 2 (Frontend Client on port 5173):
```bash
npm run client
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Preloaded Test Credentials

For development and evaluation, the database seeder sets up the following accounts:

| Persona | Email | Password | Role / Access Details |
|---|---|---|---|
| **Super Admin** | `admin@revnation.com` | `Admin@12345` | Full access to `/admin` control center, seller approvals, and audit logs |
| **Verified Seller** | `apex@revnation.com` | `Seller@12345` | Apex Performance Engineering — Full access to `/seller` portal |
| **Verified Seller** | `bavarian@revnation.com` | `Seller@12345` | Bavarian Customs — Full access to `/seller` portal |
| **Buyer / Customer** | `gearhead@revnation.com` | `User@12345` | Preloaded with 2022 BMW 330i in **My Garage** & past verified orders |
| **Prospective Seller** | `velocity@revnation.com` | `User@12345` | Application currently in `PENDING` queue for Admin approval |

> **Tip**: On the `/login` page, you can use the **1-Click Quick Test Credentials** buttons to instantly populate credentials for any role!

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Endpoint / Route | Public | USER | SELLER | ADMIN |
|---|---|---|---|---|
| Browse Products (`GET /api/products`) | ✅ | ✅ | ✅ | ✅ |
| Vehicle Fitment Check | ✅ | ✅ | ✅ | ✅ |
| Manage Garage (`/api/auth/vehicles`) | ❌ | ✅ | ✅ | ✅ |
| Manage Cart & Checkout (`/api/cart`, `/api/orders`) | ❌ | ✅ | ✅ | ✅ |
| Apply to Become Seller (`POST /api/sellers/apply`) | ❌ | ✅ | ❌ | ❌ |
| Seller Dashboard & Inventory (`/api/sellers/*`) | ❌ | ❌ (403) | ✅ | ✅ |
| Create/Edit Products (`POST/PUT /api/products`) | ❌ | ❌ (403) | ✅ | ✅ |
| Approve/Reject Sellers (`PUT /api/admin/sellers/*`) | ❌ | ❌ (403) | ❌ (403) | ✅ |
| User Suspension & Audit Logs (`/api/admin/*`) | ❌ | ❌ (403) | ❌ (403) | ✅ |

---

## 🧪 Verified Acceptance Testing Workflow

The project passes an automated 25-point verification suite (`npm run test:server`) ensuring:
1. **User Registration & Login**: JWT issuance and standard `USER` role assignment.
2. **Garage Vehicles**: Adding and setting active vehicle.
3. **Vehicle Compatibility Search**: Filtering products matching active vehicle specs.
4. **Wishlist**: Toggling saved items.
5. **Cart Validation**: Real-time stock boundaries preventing over-purchasing.
6. **Checkout & Stock Reservation**: Atomic stock decrements in MongoDB.
7. **Seller Application**: Submission of business registration credentials.
8. **RBAC Rejection**: Normal user blocked with `403 Forbidden` from `/sellers/dashboard`, `/admin/users`, and product creation.
9. **Admin Seller Approval**: Admin reviews application, approves, and automatically upgrades user role to `SELLER`.
10. **Seller Product Management**: Newly approved seller lists products and modifies inventory stock.
11. **Marketplace Appearance**: Newly created seller products immediately appear in the marketplace.

---

## 🔒 Security Practices Implemented
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **JWT Protection**: Tokens signed with expiration and validated via Bearer header.
- **Security Headers**: `helmet` enabled to mitigate XSS and injection.
- **CORS Configuration**: Restricts origins and allows credentials.
- **Rate Limiting**: `express-rate-limit` prevents brute-force abuse on `/api`.
- **Input Sanitization**: Mongoose schemas and input validation sanitize request bodies.
- **Safe Payment Architecture**: Dedicated development sandbox mode prevents storing raw card details.

---

## 📄 License
ISC License — Built for the RevNation Automotive Platform.
