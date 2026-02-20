import { apiClient, formatApiError } from './client';
import { ApiResponse, Product, Category } from './types';

export const productsApi = {
  getProducts: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
    // new backend-compatible fields
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/api/v1/products', {
        params,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getProductById: async (id: string) => {
    try {
      const { data} = await apiClient.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getFeaturedProducts: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/api/v1/products/featured');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  searchProducts: async (query: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>(`/api/v1/products/search?q=${query}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  createProduct: async (formData: FormData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Product>>('/api/v1/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  updateProduct: async (id: string, formData: FormData) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Product>>(`/api/v1/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};

export const categoriesApi = {
  getCategories: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getCategoryTree: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories/tree');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Category>>(`/api/v1/categories/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
  // Admin: create a new category
  createCategory: async (categoryData: Partial<Category>) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Category>>('/api/v1/categories', categoryData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Admin: update a category
  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, categoryData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Admin: delete a category
  deleteCategory: async (id: string) => {
    try {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/api/v1/categories/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
