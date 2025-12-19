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
    page?: number;
    limit?: number;
  }) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/products', {
        params,
      });
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getProductById: async (id: string) => {
    try {
      const { data} = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getFeaturedProducts: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/products/featured');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  searchProducts: async (query: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Product[]>>(`/products/search?q=${query}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  createProduct: async (formData: FormData) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Product>>('/products', formData, {
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
      const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, formData, {
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
      const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getCategoryTree: async () => {
    try {
      const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories/tree');
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  getCategoryById: async (id: string) => {
    try {
      const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
  // Admin: create a new category
  createCategory: async (categoryData: Partial<Category>) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Category>>('/categories', categoryData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Admin: update a category
  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  // Admin: delete a category
  deleteCategory: async (id: string) => {
    try {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
