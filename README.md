# QuickCommerce Frontend

Modern, responsive web application for the QuickCommerce grocery delivery platform built with React + Vite + TypeScript.

## 🚀 Features Implemented

### Customer Features ✅
- OTP-based authentication with JWT refresh tokens
- Product browsing with filters, search, and 3-level categories
- Shopping cart with coupon system (4 coupon types)
- Digital wallet (add money, transactions, balance tracking)
- Complete checkout flow with address & delivery slot selection
- Order management (list, detail, track, cancel with auto-refund)
- Subscription management (create, pause, resume, cancel)
- User profile with address CRUD operations

### Admin Features ✅
- Product CRUD operations with image preview
- Stock management
- Category assignment
- Featured products toggle

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (server state) + Context API (auth)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with interceptors (auto token refresh)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Date Handling**: date-fns

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

The app will be available at `http://localhost:8080`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE=http://localhost:5000/api/v1
```

## 📁 Project Structure

```
src/
├── api/                    # API client & typed endpoints
│   ├── client.ts          # Axios with auto token refresh
│   ├── types.ts           # TypeScript interfaces
│   ├── auth.ts            # Authentication APIs
│   ├── products.ts        # Products & categories
│   ├── cart.ts            # Cart operations
│   ├── orders.ts          # Orders & checkout
│   ├── wallet.ts          # Wallet management
│   └── subscriptions.ts   # Subscription APIs
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Navbar.tsx         # Navigation with cart badge
│   └── ProtectedRoute.tsx # Auth guard
├── context/
│   └── AuthContext.tsx    # Auth state management
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Auth.tsx           # OTP login/signup
│   ├── Products.tsx       # Product listing with filters
│   ├── ProductDetail.tsx  # Single product view
│   ├── Cart.tsx           # Shopping cart
│   ├── Checkout.tsx       # Complete checkout flow
│   ├── Orders.tsx         # Order list
│   ├── OrderDetail.tsx    # Single order with tracking
│   ├── Subscriptions.tsx  # Subscription management
│   ├── Wallet.tsx         # Wallet & transactions
│   ├── Profile.tsx        # User profile & addresses
│   ├── Categories.tsx     # Category tree navigation
│   └── admin/
│       └── AdminProducts.tsx # Product management
├── App.tsx                # Root with routing
└── main.tsx              # Entry point
```

## 🎨 Design System

**Color Palette:**
- Primary: Fresh Green (HSL 140, 70%, 45%) - Fresh produce vibes
- Secondary: Warm Orange (HSL 25, 90%, 55%) - Appetizing accents
- Gradients: Hero (green-to-teal), Warm (orange-to-yellow)
- Shadows: Subtle elevations with primary color glow effects

**Typography:**
- Font: Inter (Google Fonts)
- Semantic heading sizes with proper hierarchy

**Components:**
- All styled using design tokens from `src/index.css`
- Consistent spacing, shadows, and transitions
- Mobile-first responsive approach

## 🔐 Authentication

**Flow:**
1. User enters phone number
2. OTP sent via SMS (backend)
3. User verifies OTP
4. New users provide name
5. JWT tokens stored in memory
6. Refresh token handles auto-renewal

**Security:**
- Access token in memory (not localStorage)
- Auto-refresh on 401 errors
- Retry failed requests after refresh
- Protected routes with role-based access

**Production Note:** Switch to httpOnly cookies for refresh tokens in production.

## 🔄 State Management

- **Server State**: React Query with intelligent caching
- **Auth State**: React Context for user session
- **Local State**: useState for component-level data

## 📱 Responsive Design

- Mobile-first approach (375px base)
- Breakpoints: sm(640), md(768), lg(1024), xl(1280)
- Touch-friendly tap targets
- Collapsible mobile navigation

## 🧪 Testing Checklist

See `DEMO_CHECKLIST.md` for complete QA walkthrough covering:
- Authentication flow
- Product browsing
- Cart operations
- Checkout process
- Order management
- Wallet transactions
- Subscriptions
- Admin operations

## 🚢 Deployment

### Build for Production
```bash
npm run build
# Output in dist/
```

### Docker
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

### Environment Setup
- Set `VITE_API_BASE` to production backend URL
- Configure CORS on backend for frontend domain
- Use httpOnly cookies for refresh tokens

## 📚 API Integration

Complete integration with all 61+ backend endpoints. See `FRONTEND_API_MAPPING.md` for:
- Endpoint mappings
- Request/response examples
- Payload structures
- Error handling patterns

## 🎯 Key Features Detail

### Cart System
- Real-time updates
- Quantity management
- 4 coupon types support
- Stock validation before checkout

### Wallet System
- Add money (₹10 - ₹50,000)
- Transaction history
- PIN protection
- Auto-refunds on cancellation

### Subscription System
- Daily/Weekly/Monthly frequencies
- Pause with resume date
- Cancel anytime
- Auto-processing by backend cron

### Order Tracking
- Status updates
- Cancel with refund
- Delivery slot selection
- Multiple payment methods

## 🔧 Development Scripts

```bash
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📖 Documentation Files

- `README.md` - This file
- `FRONTEND_API_MAPPING.md` - Complete API endpoint reference
- `DEMO_CHECKLIST.md` - QA testing guide
- `.env.example` - Environment template

## 🤝 Backend Integration

Requires QuickCommerce Backend API running at configured base URL.

**Backend features used:**
- OTP authentication
- JWT tokens with refresh
- Product catalog with 3-level categories
- Cart with coupon validation
- Order lifecycle management
- Wallet with PIN security
- Subscription auto-processing

## 🐛 Known Limitations

- Image uploads use placeholder URLs
- Payment gateway is simulated
- Push notifications UI only (no service worker)
- Real-time order tracking not implemented
- Product reviews/ratings not built
- Advanced analytics dashboard pending

## 📝 License

MIT

---

**Ready to use!** Start the backend, run `npm run dev`, and access at http://localhost:8080

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
