# ⚡ Nexus Store — Full-Stack E-Commerce Application

A production-ready MERN stack e-commerce platform with product management, shopping cart, order tracking, and role-based admin panel.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Axios    |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Styling    | CSS Modules + Custom Design System  |

## Project Structure

```
nexus-store/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login / Register
│   │   ├── productController.js   # CRUD for products
│   │   └── orderController.js     # Order management
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + admin guard
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Product.js             # Product schema
│   │   └── Order.js               # Order schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── seed.js                    # Database seeder
│   ├── server.js                  # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # User auth state
│   │   │   └── CartContext.jsx    # Cart state
│   │   ├── hooks/
│   │   │   └── useApi.js          # Axios hook with auth headers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       └── AdminOrders.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── .env.example
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

### 2. Clone & Install

```bash
# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 3. Environment Variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/nexusstore
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates sample products, an admin user, and a regular user:

| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@nexus.dev     | admin123  |
| User  | user@nexus.dev      | user123   |

### 5. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## API Reference

### Auth
| Method | Endpoint            | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | /api/auth/register  | Public  | Create account     |
| POST   | /api/auth/login     | Public  | Login, get JWT     |
| GET    | /api/auth/me        | Private | Get current user   |

### Products
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | /api/products         | Public  | List all products    |
| GET    | /api/products/:id     | Public  | Single product       |
| POST   | /api/products         | Admin   | Create product       |
| PUT    | /api/products/:id     | Admin   | Update product       |
| DELETE | /api/products/:id     | Admin   | Delete product       |

### Orders
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/orders           | Private | Place new order      |
| GET    | /api/orders/mine      | Private | My orders            |
| GET    | /api/orders           | Admin   | All orders           |
| PUT    | /api/orders/:id       | Admin   | Update order status  |

## Deployment

### Backend → Railway / Render
1. Push to GitHub
2. Connect repo, set env vars (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`)
3. Build command: `npm install`, Start: `npm start`

### Frontend → Vercel / Netlify
1. Set `VITE_API_URL=https://your-backend.railway.app` in environment vars
2. Build command: `npm run build`, Publish: `dist/`

### MongoDB → Atlas
1. Create free cluster at mongodb.com/atlas
2. Whitelist `0.0.0.0/0` for all IPs
3. Use the connection string as `MONGO_URI`
