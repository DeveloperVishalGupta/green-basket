# Apna Bazaar - E-Commerce Platform

A modern e-commerce fashion platform built with Next.js 16, React 19, and Tailwind CSS v4 for the frontend, and Node.js, Express, and MongoDB for the backend.
## 📁 Project Structure

```
iqra-fashion/
├── web/              # Frontend (Next.js 16)
│   ├── src/
│   │   ├── app/      # Next.js App Router pages
│   │   ├── components/  # React components
│   │   ├── lib/      # Utilities and API client
│   │   ├── hooks/    # Custom React hooks
│   │   └── store/    # State management (Zustand)
│   ├── public/       # Static assets
│   └── package.json
│
└── server/           # Backend (Express + MongoDB)
    ├── src/
    │   ├── config/      # Configuration files
    │   ├── models/      # Mongoose models
    │   ├── controllers/ # API controllers
    │   ├── routes/      # API routes
    │   ├── middleware/  # Express middleware
    │   └── utils/       # Utility functions
    └── package.json
```
## � Features

- ✨ Modern, responsive UI with Tailwind CSS v4
- 🛍️ Product catalog with categories and filtering
- 🛒 Shopping cart functionality
- 👤 User authentication and profiles
- 📦 Order management
- 🎨 Clean, maintainable codebase
- � Mobile-first responsive design

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v20 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iqra-fashion
```

### 2. Frontend Setup

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Backend Setup

```bash
# Navigate to server directory from root
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/iqra-fashion
# JWT_SECRET=your-secret-key-here
# CLIENT_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Development Mode

**Terminal 1 - Frontend (from root):**
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Backend (from root):**
```bash
cd server
npm run dev
```
Backend runs on [http://localhost:5000](http://localhost:5000)

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

## 📁 Project Structure

```
iqra-fashion/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── layout/      # Layout components (Header, Footer)
│   ├── lib/             # Utilities and configurations
│   ├── hooks/           # Custom React hooks
│   └── store/           # State management (Zustand)
├── public/              # Static assets
├── server/              # Backend API
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   └── middleware/  # Express middleware
│   └── package.json
└── package.json
```

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Ant Design 5** - **Primary UI component library**
- **Tailwind CSS v4** - Utility-first CSS for layouts
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

## � Documentation

For detailed development guidelines, coding standards, and best practices, see **[AGENTS.md](./AGENTS.md)**.

## � Key Features to Implement

- [ ] User authentication (login/register)
- [ ] Product listing and details
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Order management
- [ ] Admin dashboard
- [ ] Product search and filtering
- [ ] Payment integration
- [ ] Email notifications

## 🤝 Contributing

1. Read the [AGENTS.md](./AGENTS.md) for coding standards
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 Available Scripts

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

### Backend

```bash
npm run dev      # Start with nodemon
npm start        # Start production server
```

## 🔒 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Backend (server/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/iqra-fashion
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas connection string

### CORS Errors
- Check `CLIENT_URL` in backend `.env`
- Verify CORS configuration in `server/src/index.js`

### Tailwind Not Working
- Restart dev server
- Check `postcss.config.mjs` configuration
- Verify `@import "tailwindcss"` in `globals.css`

## 📞 Support

For questions or issues, contact the development team at Arka Services.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by Arka Services**
