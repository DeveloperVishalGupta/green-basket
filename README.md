# Green Basket - E-Commerce Platform

A modern e-commerce grocery platform built with Next.js 16, React 19, Ant Design 5, and Tailwind CSS v4 for the frontend, and Node.js, Express, and MongoDB for the backend.

## 📁 Project Structure

```
apna-bazaar/
├── web/                      # Frontend (Next.js 16, App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, register, OTP, password reset
│   │   │   ├── (shop)/       # Products, categories, cart, checkout, orders
│   │   │   ├── (profile)/    # Profile, addresses, wishlist, notifications
│   │   │   ├── (admin)/      # Admin dashboard
│   │   │   └── (vendor)/     # Vendor dashboard
│   │   ├── components/       # UI, layout, admin, checkout, home, product components
│   │   ├── services/         # API client modules (incl. services/admin)
│   │   ├── lib/               # Utilities and configuration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # State management (Zustand)
│   │   └── utils/             # Helper functions
│   ├── public/                # Static assets
│   └── package.json
│
└── server/                   # Backend (Express + MongoDB)
    ├── src/
    │   ├── config/            # Env, database, and Swagger configuration
    │   ├── models/             # Mongoose models (User, Product, Category, Cart,
    │   │                        #   Order, Wishlist, Notification, WhatsappEvent)
    │   ├── controllers/        # Request handlers
    │   ├── routes/              # API routes
    │   ├── middleware/          # Express middleware (auth, error handling, etc.)
    │   ├── services/            # Business logic / integrations
    │   ├── validators/          # Request validation (Joi/express-validator)
    │   ├── swagger/             # API documentation
    │   └── utils/                # Utility functions
    ├── scripts/                # createAdmin, seedData, updateSalesCount
    └── package.json
```

## ✨ Features

- Modern, responsive UI built with Ant Design 5 and Tailwind CSS v4
- Product catalog with categories and filtering
- Shopping cart and wishlist
- User authentication (register, login, OTP verification, forgot/reset password)
- Address management and checkout flow
- Order management and shipment tracking
- Razorpay payment integration
- Admin dashboard for managing products, categories, and orders
- Vendor dashboard
- Notifications (in-app, email via AWS SES, WhatsApp webhook events)
- Interactive API documentation via Swagger

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v22 or higher recommended for the server, v20+ for the frontend)
- **npm**
- **MongoDB** (local or MongoDB Atlas account)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd apna-bazaar
```

### 2. Frontend Setup

```bash
cd web
npm install --legacy-peer-deps

# Create an env file and set the variables listed below
```

### 3. Backend Setup

```bash
cd server
npm install

# Create an env file and set the variables listed below
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Frontend (from `web/`):**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Backend (from `server/`):**
```bash
npm run dev
```
Backend runs on [http://localhost:5000](http://localhost:5000), with API docs at `/api-docs`.

### Production Build

**Frontend:**
```bash
cd web
npm run build
npm start
```

**Backend:**
```bash
cd server
npm start
```

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework (App Router)
- **React 19** - UI library
- **Ant Design 5/6** - Primary UI component library
- **Tailwind CSS v4** - Utility-first CSS for layouts
- **Zustand** - State management
- **TanStack Query** - Server state / data fetching
- **Axios** - HTTP client
- **Chart.js** - Charts (admin/vendor dashboards)

### Backend
- **Node.js / Express** - Runtime and web framework
- **MongoDB / Mongoose** - Database and ODM
- **JWT / bcryptjs** - Authentication
- **Joi / express-validator** - Request validation
- **Cloudinary** - Image storage
- **Razorpay** - Payments
- **AWS SES / Nodemailer** - Transactional email
- **Swagger (swagger-jsdoc + swagger-ui-express)** - API documentation
- **Helmet / CORS / Morgan** - Security and logging

## 🔌 API Overview

All backend routes are mounted under `/api`:

| Route | Purpose |
|---|---|
| `/api/auth` | Register, login, OTP, forgot/reset password |
| `/api/users` | User profile and account management |
| `/api/products` | Product catalog |
| `/api/categories` | Product categories |
| `/api/cart` | Shopping cart |
| `/api/wishlist` | Wishlist |
| `/api/orders` | Order management |
| `/api/payment` | Razorpay payment integration |
| `/api/shipment` | Shipment tracking |
| `/api/admin` | Admin operations |
| `/api/notifications` | In-app/email notifications |
| `/api/webhooks/whatsapp` | WhatsApp event webhooks |

Full interactive documentation is available at `http://localhost:5000/api-docs` when the server is running.

## 📝 Available Scripts

### Frontend (`web/`)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

### Backend (`server/`)
```bash
npm run dev            # Start with nodemon
npm start               # Start production server
npm run create-admin    # Create an admin user (scripts/createAdmin.js)
npm run seed             # Seed the database (scripts/seedData.js)
npm run update-sales     # Recalculate product sales counts
```

## 🔒 Environment Variables

Neither app ships a committed `.env.example`; create the files below yourself (both are already git-ignored).

### Frontend (`web/.env` or `web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/green-basket
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email (AWS SES / SMTP via Nodemailer)
SMTP_HOST=
SMTP_PORT=
```

> Check `server/src/config/` and the individual services in `server/src/services/` for the full list of variables required by each integration.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally: `mongod`
- Or use a MongoDB Atlas connection string

### CORS Errors
- Check `CLIENT_URL` in `server/.env`
- Verify CORS configuration in `server/src/index.js`

### Tailwind Not Working
- Restart the dev server
- Check `web/postcss.config.mjs` configuration
- Verify `@import "tailwindcss"` is present in the global stylesheet

## 📞 Support

For questions or issues, contact the development team at Arka Services.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by Arka Services**
