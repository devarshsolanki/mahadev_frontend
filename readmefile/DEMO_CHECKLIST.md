# QuickCommerce Frontend - QA Demo Checklist

## Pre-requisites
- [ ] Backend running at `http://localhost:5000/api/v1`
- [ ] Database seeded with sample data
- [ ] Frontend running at `http://localhost:8080`
- [ ] `.env` file configured with `VITE_API_BASE`

## 1. Authentication Flow
- [ ] Navigate to `/auth`
- [ ] Enter phone number (e.g., `+919876543210`)
- [ ] Click "Send OTP"
- [ ] Check console for OTP (in development mode)
- [ ] Enter OTP and verify
- [ ] For new users: Enter name
- [ ] Verify login successful and redirected to home
- [ ] Verify user menu shows in navbar

## 2. Browse Products
- [ ] Navigate to `/products`
- [ ] Verify products load
- [ ] Test search functionality
- [ ] Test category filter
- [ ] Test sort options (name, price, discount)
- [ ] Click on a product card
- [ ] Verify product detail page loads
- [ ] Test quantity selector
- [ ] Click "Add to Cart"
- [ ] Verify item added to cart (badge in navbar)

## 3. Shopping Cart
- [ ] Navigate to `/cart`
- [ ] Verify cart items display correctly
- [ ] Test quantity increase/decrease
- [ ] Test item removal
- [ ] Apply coupon code (e.g., `WELCOME50` from backend)
- [ ] Verify discount applied
- [ ] Verify totals calculated correctly
- [ ] Click "Proceed to Checkout"

## 4. Wallet Operations
- [ ] Navigate to `/wallet`
- [ ] Verify balance displays
- [ ] Click "Add Money"
- [ ] Enter amount (e.g., 1000)
- [ ] Select payment method
- [ ] Verify money added
- [ ] Verify transaction appears in history
- [ ] Check transaction type (credit/debit)

## 5. Checkout & Order
- [ ] From cart, proceed to checkout
- [ ] Select delivery address (or add new one from profile)
- [ ] Select delivery slot (optional)
- [ ] Choose payment method:
  - [ ] Wallet (enter PIN if set)
  - [ ] Cash on Delivery
  - [ ] Card
  - [ ] UPI
- [ ] Click "Place Order"
- [ ] Verify order created successfully
- [ ] Verify redirected to orders page

## 6. Orders Management
- [ ] Navigate to `/orders`
- [ ] Verify orders list displays
- [ ] Check order status badges
- [ ] Click "View Details" on an order
- [ ] Verify order detail page shows:
  - [ ] Order items
  - [ ] Delivery address
  - [ ] Payment info
  - [ ] Order total
- [ ] For pending orders: Test "Cancel Order"
- [ ] Verify cancellation successful
- [ ] Verify refund processed (if paid via wallet)

## 7. Subscriptions
- [ ] Navigate to `/subscriptions`
- [ ] Click "Browse Products"
- [ ] Select a product
- [ ] Click "Subscribe" button
- [ ] Create subscription with:
  - [ ] Frequency (daily/weekly/monthly)
  - [ ] Delivery address
  - [ ] Start date
- [ ] Verify subscription created
- [ ] Test "Pause" subscription
- [ ] Test "Resume" subscription
- [ ] Test "Cancel" subscription
- [ ] Verify status changes correctly

## 8. Profile & Addresses
- [ ] Navigate to `/profile`
- [ ] Verify user info displays
- [ ] Click "Edit" profile
- [ ] Update name and email
- [ ] Save changes
- [ ] Verify updates saved
- [ ] Click "Add Address"
- [ ] Fill address form:
  - [ ] Label (Home/Office)
  - [ ] Address lines
  - [ ] City, State, Pincode
- [ ] Save address
- [ ] Verify address appears
- [ ] Test delete address

## 9. Categories
- [ ] Navigate to `/categories`
- [ ] Verify category tree displays
- [ ] Click on main category
- [ ] Verify products filtered by category
- [ ] Test subcategory navigation
- [ ] Verify 3-level hierarchy works

## 10. Admin Panel (Admin User Only)
- [ ] Login with admin credentials
- [ ] Navigate to `/admin/products`
- [ ] Click "Add Product"
- [ ] Fill product form:
  - [ ] Name, description
  - [ ] Price, MRP
  - [ ] Stock, unit
  - [ ] Category
  - [ ] Featured toggle
- [ ] Save product
- [ ] Verify product appears in grid
- [ ] Click "Edit" on a product
- [ ] Update product details
- [ ] Save changes
- [ ] Verify updates reflected

## 11. Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1280px)
- [ ] Verify mobile menu works
- [ ] Verify all forms are mobile-friendly
- [ ] Verify cart interactions work on mobile

## 12. Error Handling
- [ ] Test with invalid phone number
- [ ] Test with wrong OTP
- [ ] Test checkout with no address
- [ ] Test wallet payment with insufficient balance
- [ ] Test applying invalid coupon
- [ ] Verify error messages display correctly
- [ ] Verify toast notifications appear

## 13. Token Refresh
- [ ] Login and wait for token to expire (or force 401)
- [ ] Make an API call
- [ ] Verify token refresh happens automatically
- [ ] Verify request retried successfully
- [ ] Verify no interruption to user experience

## 14. Logout
- [ ] Click user menu
- [ ] Click "Logout"
- [ ] Verify logged out
- [ ] Verify redirected to home
- [ ] Verify protected routes redirect to auth

## Expected Results Summary

All flows should complete without errors. The application should:
- Handle authentication seamlessly
- Display real-time cart updates
- Process payments correctly
- Manage subscriptions properly
- Show proper error messages
- Work responsively across devices
- Auto-refresh tokens without user knowledge

## Known Limitations in Current Demo

- Image uploads not implemented (using placeholder images)
- Push notifications not connected
- Real payment gateway simulation only
- Email verification not implemented
- Product reviews not implemented
- Advanced search filters limited

## Test Data Suggestions

### Users
- Customer: `+919876543210`
- Admin: (check backend seed data)

### Coupon Codes (from backend)
- `WELCOME50` - 50 rupees flat discount
- `SAVE10` - 10% discount
- `FREEDEL` - Free delivery

### Products
- Use seeded products from backend
- Ensure products have stock > 0
- Mix of featured and regular products

## Success Criteria

✅ All authentication flows work  
✅ Product browsing and filtering functional  
✅ Cart operations work correctly  
✅ Wallet transactions process properly  
✅ Orders created and managed successfully  
✅ Subscriptions CRUD operations work  
✅ Profile and addresses management functional  
✅ Admin panel allows product management  
✅ No console errors  
✅ Responsive on all devices  
✅ Error handling provides clear feedback
