import { ApiResponse, Order, Product, Category } from './types';
import { apiClient } from './client';

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<Order>;
  totalCustomers?: number;
  lowStockProducts?: Array<Product>;
}

export interface OrderUpdatePayload {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  cancelReason?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface CategoryCreatePayload {
  name: string;
  description?: string;
  parentCategory?: string;
  image?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CategoryUpdatePayload extends CategoryCreatePayload {
  id: string;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  mrp?: number;
  stock?: number;
  unit?: string;
  category?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: string[];
  variants?: Array<{
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stock: number;
    weight?: {
      value: number;
      unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs';
    };
  }>;
}

export interface HomeSliderConfig {
  _id?: string;
  categoryId: string;
  order: number;
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/dashboard');
    return response.data;
  },

  // Orders
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await apiClient.get('/orders/admin/all', { params });
    return response.data;
  },

  updateOrder: async (orderId: string, payload: OrderUpdatePayload) => {
    const response = await apiClient.put(`/orders/admin/${orderId}/status`, payload);
    return response.data;
  },

  // Categories
  createCategory: async (payload: CategoryCreatePayload) => {
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },

  updateCategory: async (id: string, payload: Partial<CategoryCreatePayload>) => {
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Products
  createProduct: async (formData: FormData) => {
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateProduct: async (id: string, payload: ProductUpdatePayload) => {
    let requestPayload: any;
    
    if (payload instanceof FormData) {
      requestPayload = payload;
    } else {
      requestPayload = payload;
    }

    const response = await apiClient.put(`/products/${id}`, requestPayload, {
      headers: payload instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
    });
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateProducts: async (updates: Array<{ id: string } & ProductUpdatePayload>) => {
    const response = await apiClient.patch('/products/bulk', { updates });
    return response.data;
  },

  bulkDeleteProducts: async (ids: string[]) => {
    const response = await apiClient.post('/products/bulk-delete', { ids });
    return response.data;
  },

  // Analytics and Reports
  getOrderStats: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    const response = await apiClient.get('/admin/analytics/orders', { params });
    return response.data;
  },

  getProductStats: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) => {
    const response = await apiClient.get('/admin/analytics/products', { params });
    return response.data;
  },

  exportOrders: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    format?: 'csv' | 'excel';
  }) => {
    const response = await apiClient.get('/admin/exports/orders', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Home Slider Settings
  getHomeSliderSettings: async () => {
    const response = await apiClient.get('/admin/home-sliders');
    return response.data;
  },

  updateHomeSliderSettings: async (sliders: Array<{ categoryId: string; order: number }>) => {
    const response = await apiClient.post('/admin/home-sliders', { sliders });
    return response.data;
  },

  // Category order counts (number of orders that include products from a category)
  getCategoryOrderCounts: async () => {
    const response = await apiClient.get('/admin/stats/category-order-counts');
    return response.data;
  },
};