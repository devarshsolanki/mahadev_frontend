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
      const { data } = await apiClient.get<ApiResponse<{ products: Product[]; pagination: any }>>('/products', {
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

  createProduct: async (productData: Partial<Product>) => {
    try {
      const { data } = await apiClient.post<ApiResponse<Product>>('/products', productData);
      return { success: true, data: data.data };
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>) => {
    try {
      const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, productData);
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
};
