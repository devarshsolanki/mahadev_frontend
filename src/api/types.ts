// Common API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth Types
export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'customer' | 'admin';
  addresses?: Address[];
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  category: Category;
  images: string[];
  stock: number;
  unit: string;
  isFeatured: boolean;
  isActive: boolean;
  variants?: ProductVariant[];
  slug: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  stock: number;
  unit: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | null;
  level: number;
  isActive: boolean;
  children?: Category[];
}

// Cart Types
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'wallet' | 'cod' | 'card' | 'upi' | 'netbanking';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: Address;
  deliverySlot?: {
    date: string;
    time: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

// Wallet Types
export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  currency: string;
  isActive: boolean;
  hasPIN: boolean;
}

export interface Transaction {
  _id: string;
  wallet: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: any;
  createdAt: string;
}

// Subscription Types
export interface Subscription {
  _id: string;
  user: User;
  items: SubscriptionItem[];
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDeliveryDate: string;
  deliveryAddress: Address;
  status: 'active' | 'paused' | 'cancelled';
  pausedUntil?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  product: string | Product;
  quantity: number;
  price: number;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'flat' | 'free_delivery' | 'bogo';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// Delivery Slot
export interface DeliverySlot {
  date: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
