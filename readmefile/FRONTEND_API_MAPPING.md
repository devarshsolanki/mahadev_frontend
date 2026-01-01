# Frontend API Mapping

Backend Base URL: `http://localhost:5000/api/v1`

## Authentication Flows

| Frontend Route/Action | Backend Endpoint | Method | Payload Example | Response Used |
|----------------------|------------------|--------|-----------------|---------------|
| `/auth` - Send OTP | `/auth/send-otp` | POST | `{ phone: "+919876543210" }` | `message` |
| `/auth` - Verify OTP | `/auth/verify-otp` | POST | `{ phone: "+919876543210", otp: "123456", name?: "John" }` | `user`, `accessToken`, `refreshToken` |
| Auto token refresh | `/auth/refresh-token` | POST | `{ refreshToken }` | `accessToken`, `refreshToken` |
| Profile page | `/auth/profile` | GET | - | `user` object |
| Logout | `/auth/logout` | POST | - | Success message |

## Product Browsing

| Frontend Route/Action | Backend Endpoint | Method | Query Params | Response Used |
|----------------------|------------------|--------|--------------|---------------|
| `/products` | `/products` | GET | `category`, `search`, `minPrice`, `maxPrice`, `sort`, `page` | `products[]`, `pagination` |
| `/products/:id` | `/products/:id` | GET | - | `product` object |
| Home featured | `/products/featured` | GET | - | `products[]` |
| Categories | `/categories/tree` | GET | - | `categories[]` with hierarchy |

## Shopping Cart

| Frontend Route/Action | Backend Endpoint | Method | Payload | Response Used |
|----------------------|------------------|--------|---------|---------------|
| `/cart` - View cart | `/cart` | GET | - | `items[]`, `subtotal`, `total`, `appliedCoupon` |
| Add to cart button | `/cart/add` | POST | `{ productId, quantity }` | Updated cart |
| Update quantity | `/cart/items/:itemId` | PUT | `{ quantity }` | Updated cart |
| Remove item | `/cart/items/:itemId` | DELETE | - | Updated cart |
| Apply coupon | `/cart/coupon/apply` | POST | `{ couponCode }` | Cart with discount |
| Remove coupon | `/cart/coupon/remove` | DELETE | - | Updated cart |

## Wallet

| Frontend Route/Action | Backend Endpoint | Method | Payload | Response Used |
|----------------------|------------------|--------|---------|---------------|
| `/wallet` - View balance | `/wallet` | GET | - | `balance`, `hasPIN` |
| Add money dialog | `/wallet/add-money` | POST | `{ amount, paymentMethod }` | Transaction details |
| Transaction history | `/wallet/transactions` | GET | `page`, `limit` | `transactions[]` |
| Set PIN | `/wallet/set-pin` | POST | `{ pin }` | Success message |

## Orders & Checkout

| Frontend Route/Action | Backend Endpoint | Method | Payload | Response Used |
|----------------------|------------------|--------|---------|---------------|
| Checkout - Create order | `/checkout/create-order` | POST | `{ deliveryAddressId, paymentMethod, deliverySlot?, walletPIN? }` | Order object |
| Delivery slots | `/checkout/delivery-slots` | GET | - | Available slots array |
| Order list | `/orders/my-orders` | GET | - | `orders[]` |
| Order detail | `/orders/:orderId` | GET | - | Order object with full details |
| Track order | `/orders/:orderId/track` | GET | - | Tracking info |
| Cancel order | `/orders/:orderId/cancel` | POST | `{ reason? }` | Updated order + refund info |

## Subscriptions

| Frontend Route/Action | Backend Endpoint | Method | Payload | Response Used |
|----------------------|------------------|--------|---------|---------------|
| List subscriptions | `/subscriptions` | GET | - | `subscriptions[]` |
| Create subscription | `/subscriptions` | POST | `{ items[], frequency, deliveryAddressId, startDate, weeklySchedule?, monthlyDates? }` | Subscription object |
| View details | `/subscriptions/:id` | GET | - | Subscription with full details |
| Pause | `/subscriptions/:id/pause` | POST | `{ pausedUntil }` | Updated subscription |
| Resume | `/subscriptions/:id/resume` | POST | - | Updated subscription |
| Cancel | `/subscriptions/:id/cancel` | POST | - | Cancelled subscription |

## Admin (Scaffold)

| Frontend Route/Action | Backend Endpoint | Method | Payload | Response Used |
|----------------------|------------------|--------|---------|---------------|
| Product list | `/products` | GET | Admin view | All products |
| Create product | `/products` | POST | Product data | Created product |
| Update product | `/products/:id` | PUT | Product data | Updated product |
| Update stock | `/products/:id/stock` | PATCH | `{ stock }` | Updated product |

## Error Handling

All API calls use the axios interceptor pattern:
- Automatic retry on 401 with token refresh
- Centralized error formatting
- Toast notifications for user feedback
- Network error handling with fallback messages
