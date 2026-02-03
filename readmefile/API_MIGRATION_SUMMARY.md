# API Base URL Migration Summary

## Overview
Successfully migrated the frontend application from using a base URL with `/api/v1` suffix to a base URL without it. All endpoints have been updated to include the `/api/v1` prefix explicitly.

## Changes Made

### 1. Environment Configuration
**File:** `.env`

**Before:**
```
VITE_API_BASE=http://localhost:5000/api/v1
```

**After:**
```
VITE_API_BASE=http://localhost:5000
```

### 2. API Client Setup
**File:** `src/api/client.ts`

**Changes:**
- Updated default API_BASE_URL from `http://localhost:5000/api/v1` to `http://localhost:5000`
- Updated the token refresh endpoint to explicitly use `/api/v1/auth/refresh-token`

**Before:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
// ...
await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
```

**After:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
// ...
await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, { refreshToken });
```

### 3. Updated API Endpoints

#### Authentication API (`src/api/auth.ts`)
- `/auth/send-otp` → `/api/v1/auth/send-otp`
- `/auth/verify-otp` → `/api/v1/auth/verify-otp`
- `/auth/resend-otp` → `/api/v1/auth/resend-otp`
- `/auth/profile` → `/api/v1/auth/profile` (GET & PUT)
- `/auth/logout` → `/api/v1/auth/logout`

#### Cart API (`src/api/cart.ts`)
- `/cart` → `/api/v1/cart` (GET)
- `/cart/add` → `/api/v1/cart/add` (POST)
- `/cart/items/{itemId}` → `/api/v1/cart/items/{itemId}` (PUT & DELETE)
- `/cart/clear` → `/api/v1/cart/clear` (DELETE)
- `/cart/coupon/apply` → `/api/v1/cart/coupon/apply` (POST)
- `/cart/coupon/remove` → `/api/v1/cart/coupon/remove` (DELETE)
- `/cart/validate` → `/api/v1/cart/validate` (GET)

#### Products API (`src/api/products.ts`)
- `/products` → `/api/v1/products` (GET, POST)
- `/products/{id}` → `/api/v1/products/{id}` (GET, PUT)
- `/products/featured` → `/api/v1/products/featured` (GET)
- `/products/search` → `/api/v1/products/search` (GET)

#### Categories API (`src/api/products.ts`)
- `/categories` → `/api/v1/categories` (GET, POST)
- `/categories/tree` → `/api/v1/categories/tree` (GET)
- `/categories/{id}` → `/api/v1/categories/{id}` (GET, PUT, DELETE)

#### Orders API (`src/api/orders.ts`)
- `/orders/my-orders` → `/api/v1/orders/my-orders` (GET)
- `/orders/{orderId}` → `/api/v1/orders/{orderId}` (GET)
- `/orders/{orderId}/track` → `/api/v1/orders/{orderId}/track` (GET)
- `/orders/{orderId}/cancel` → `/api/v1/orders/{orderId}/cancel` (POST)

#### Checkout API (`src/api/orders.ts`)
- `/checkout/create-order` → `/api/v1/checkout/create-order` (POST)
- `/checkout/delivery-slots` → `/api/v1/checkout/delivery-slots` (GET)
- `/checkout/verify-payment` → `/api/v1/checkout/verify-payment` (POST)
- `/checkout/delivery-fee` → `/api/v1/checkout/delivery-fee` (GET)

#### Wallet API (`src/api/wallet.ts`)
- `/wallet` → `/api/v1/wallet` (GET)
- `/wallet/add-money` → `/api/v1/wallet/add-money` (POST)
- `/wallet/transactions` → `/api/v1/wallet/transactions` (GET)
- `/wallet/transactions/{id}` → `/api/v1/wallet/transactions/{id}` (GET)
- `/wallet/set-pin` → `/api/v1/wallet/set-pin` (POST)
- `/wallet/verify-pin` → `/api/v1/wallet/verify-pin` (POST)
- `/wallet/statistics` → `/api/v1/wallet/statistics` (GET)

#### Subscriptions API (`src/api/subscriptions.ts`)
- `/subscriptions` → `/api/v1/subscriptions` (GET, POST)
- `/subscriptions/{subscriptionId}` → `/api/v1/subscriptions/{subscriptionId}` (GET, PUT)
- `/subscriptions/{subscriptionId}/pause` → `/api/v1/subscriptions/{subscriptionId}/pause` (POST)
- `/subscriptions/{subscriptionId}/resume` → `/api/v1/subscriptions/{subscriptionId}/resume` (POST)
- `/subscriptions/{subscriptionId}/cancel` → `/api/v1/subscriptions/{subscriptionId}/cancel` (POST)
- `/subscriptions/statistics` → `/api/v1/subscriptions/statistics` (GET)

#### Admin API (`src/api/admin.ts`)
- `/admin/dashboard` → `/api/v1/admin/dashboard` (GET)
- `/orders/admin/all` → `/api/v1/orders/admin/all` (GET)
- `/orders/admin/{orderId}/status` → `/api/v1/orders/admin/{orderId}/status` (PUT)
- `/categories` → `/api/v1/categories` (POST, PUT, DELETE)
- `/products` → `/api/v1/products` (POST, PUT, DELETE)
- `/products/bulk` → `/api/v1/products/bulk` (PATCH)
- `/products/bulk-delete` → `/api/v1/products/bulk-delete` (POST)
- `/admin/analytics/orders` → `/api/v1/admin/analytics/orders` (GET)
- `/admin/analytics/products` → `/api/v1/admin/analytics/products` (GET)
- `/admin/exports/orders` → `/api/v1/admin/exports/orders` (GET)
- `/admin/home-sliders` → `/api/v1/admin/home-sliders` (GET, POST)
- `/admin/stats/category-order-counts` → `/api/v1/admin/stats/category-order-counts` (GET)
- `/admin/subscriptions/active` → `/api/v1/admin/subscriptions/active` (GET)

## Files Modified

1. ✅ `.env` - Updated VITE_API_BASE
2. ✅ `src/api/client.ts` - Updated API_BASE_URL and refresh token endpoint
3. ✅ `src/api/auth.ts` - Updated all authentication endpoints
4. ✅ `src/api/cart.ts` - Updated all cart endpoints
5. ✅ `src/api/products.ts` - Updated all products and categories endpoints
6. ✅ `src/api/orders.ts` - Updated all orders and checkout endpoints
7. ✅ `src/api/wallet.ts` - Updated all wallet endpoints
8. ✅ `src/api/subscriptions.ts` - Updated all subscription endpoints
9. ✅ `src/api/admin.ts` - Updated all admin endpoints

## Verification Results

✅ **All endpoints verified** - No endpoints remain with the old structure (without `/api/v1`)
✅ **No duplicate segments** - All endpoints use single `/api/v1` prefix
✅ **Consistent pattern** - All endpoints follow the new structure format

## Production Deployment Notes

- The frontend will now work with a backend server running on a clean base URL (e.g., `http://api.example.com` or `http://localhost:5000`)
- The `/api/v1` prefix will be properly added to all requests
- Token refresh mechanism now includes the full path with `/api/v1`
- All development and production deployments will use the same endpoint structure

## Testing Recommendations

1. Test all CRUD operations for products, categories, orders
2. Test authentication flow (OTP send, verify, refresh tokens)
3. Test cart operations (add, update, remove, apply coupon)
4. Test wallet operations (add money, verify PIN)
5. Test subscriptions (create, update, pause, resume, cancel)
6. Test admin endpoints (if you have admin access)
7. Verify no 404 errors appear in network requests

---
**Migration Date:** February 3, 2026
**Status:** ✅ Complete
