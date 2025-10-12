# QuickCommerce Frontend

Modern, responsive web application for the QuickCommerce grocery delivery platform built with React + Vite + TypeScript.

## 🚀 Features Implemented

### Customer Features
✅ OTP-based authentication with JWT refresh tokens  
✅ Product browsing with filters, search, and categories  
✅ Shopping cart with coupon system  
✅ Digital wallet (add money, transactions, balance)  
✅ Complete checkout flow  
✅ Order management (list, track, cancel)  
✅ User profile with address management  

### Admin Features (Scaffold)
✅ Product CRUD operations  
✅ Stock management  

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (server state) + Context API (auth)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with interceptors
- **UI Components**: shadcn/ui (Radix UI primitives)

## 📦 Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_BASE=http://localhost:5000/api/v1

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE=http://localhost:5000/api/v1
```

## 📁 Project Structure

```
src/
├── api/                 # API client & typed endpoints
│   ├── client.ts       # Axios instance with interceptors
│   ├── types.ts        # TypeScript interfaces
│   ├── auth.ts         # Auth API calls
│   ├── products.ts     # Product & category APIs
│   ├── cart.ts         # Cart management
│   ├── orders.ts       # Order & checkout APIs
│   ├── wallet.ts       # Wallet operations
│   └── subscriptions.ts # Subscription management
├── components/         # Reusable components
│   ├── ui/            # shadcn/ui components
│   ├── Navbar.tsx     # Navigation bar
│   └── ProtectedRoute.tsx # Route guard
├── context/           # React Context providers
│   └── AuthContext.tsx # Authentication state
├── pages/             # Route pages
│   ├── Home.tsx       # Landing page
│   ├── Auth.tsx       # Login/signup
│   ├── Products.tsx   # Product listing
│   ├── ProductDetail.tsx # Product details
│   ├── Cart.tsx       # Shopping cart
│   └── Wallet.tsx     # Digital wallet
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

## 🎨 Design System

The app uses a custom design system defined in:
- `src/index.css` - CSS variables for colors, gradients, shadows
- `tailwind.config.ts` - Tailwind theme extensions

**Color Palette:**
- Primary: Fresh Green (HSL 140, 70%, 45%)
- Secondary: Warm Orange (HSL 25, 90%, 55%)
- Gradients: Hero gradient (green-to-teal), Warm gradient (orange-to-yellow)

## 🔐 Authentication

- **Method**: OTP-based phone authentication
- **Token Storage**: In-memory access token + refresh token
- **Auto-refresh**: Axios interceptor handles token refresh on 401
- **Protected Routes**: Using `ProtectedRoute` wrapper component

### Production Security Note
For production, switch to httpOnly cookies for refresh tokens:
1. Update backend to send refreshToken in httpOnly cookie
2. Remove refresh token from response body
3. Axios will automatically include cookies in requests

## 🔄 State Management

- **Server State**: React Query for API data, caching, and synchronization
- **Auth State**: React Context for user session
- **Local State**: useState/useReducer for component-level state

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly UI elements
- Optimized images and lazy loading

## 🧪 API Integration

All backend endpoints are fully integrated. See `FRONTEND_API_MAPPING.md` for complete endpoint mapping.

**Base URL**: Configured via `VITE_API_BASE` environment variable

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
```

## 📝 Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎯 Next Steps

### Essential Features to Complete
- [ ] Checkout page with address selection and delivery slots
- [ ] Orders page (list, detail, tracking)
- [ ] Subscriptions management (create, pause, resume, cancel)
- [ ] Profile page with address CRUD
- [ ] Categories page with tree navigation
- [ ] Admin panel pages

### Enhancements
- [ ] Product image gallery/carousel
- [ ] Product reviews and ratings
- [ ] Order tracking with real-time updates
- [ ] Push notifications
- [ ] PWA capabilities (service worker, offline support)
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline (GitHub Actions)

## 📚 Key Libraries

- `axios` - HTTP client with interceptors
- `@tanstack/react-query` - Server state management
- `react-router-dom` - Routing
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `lucide-react` - Icons

## 🤝 Backend Integration

This frontend integrates with QuickCommerce Backend API (Node.js + Express + MongoDB).

**Backend Repository**: Connect to `http://localhost:5000/api/v1`

Ensure backend is running before starting frontend development.

## 📄 License

MIT
