import { apiClient, formatApiError } from './client';
import { ApiResponse } from './types';

export interface ReviewUser {
  _id: string;
  name: string;
  profilePicture?: string | null;
}

export interface Review {
  _id: string;
  productId: string;
  userId: ReviewUser;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  _id: string;
  name: string;
  averageRating: number;
  totalReviews: number;
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ReviewsResponse {
  product: ReviewSummary;
  reviews: Review[];
  pagination: ReviewPagination;
}

export const reviewsApi = {
  /** GET /api/v1/reviews/:productId?page=N  — public */
  getProductReviews: async (productId: string, page = 1): Promise<ReviewsResponse> => {
    try {
      const { data } = await apiClient.get<ApiResponse<ReviewsResponse>>(
        `/api/v1/reviews/${productId}`,
        { params: { page } }
      );
      return data.data;
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  /** POST /api/v1/reviews/:productId  — auth required */
  submitReview: async (
    productId: string,
    payload: { rating: number; comment?: string }
  ): Promise<Review> => {
    try {
      const { data } = await apiClient.post<ApiResponse<Review>>(
        `/api/v1/reviews/${productId}`,
        payload
      );
      return data.data;
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },

  /** DELETE /api/v1/reviews/:productId  — auth required */
  deleteReview: async (productId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/reviews/${productId}`);
    } catch (error) {
      throw new Error(formatApiError(error));
    }
  },
};
