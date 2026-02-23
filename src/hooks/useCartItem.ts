import { useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface UseCartItemOptions {
  onAddSuccess?: () => void;
  debounceMs?: number;
}

interface CartItem {
  _id: string;
  quantity: number;
  product: { _id: string };
}

interface CartData {
  data?: {
    items: CartItem[];
    total?: number;
    [key: string]: any;
  };
}

/**
 * Custom hook for managing a single product's cart state with optimistic updates
 * Provides consistent cart behavior across the application with minimal API calls
 */
export const useCartItem = (
  productId: string,
  options: UseCartItemOptions = {}
) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { onAddSuccess, debounceMs = 250 } = options;

  // Track last operation time for debounce
  const lastOperationTimeRef = useRef<number>(0);
  const pendingOperationRef = useRef<boolean>(false);

  // Fetch full cart once per session (stale time 1 min)
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // Keep fresh for 1 minute
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Find the cart item for this product
  const cartItem = cart?.data?.items?.find((item) => item.product._id === productId);
  const currentQuantity = cartItem?.quantity || 0;
  const cartItemId = cartItem?._id || '';

  /**
   * Add to cart mutation with optimistic update
   * Shows instant feedback before server responds
   */
  const addToCartMutation = useMutation({
    mutationFn: (quantity: number) => cartApi.addToCart(productId, quantity),
    onMutate: async (addedQuantity) => {
      // Cancel any ongoing cart queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Get previous cart data for rollback
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update the cache
      queryClient.setQueryData(['cart'], (old: CartData) => {
        if (!old?.data?.items) return old;

        const newItems = [...old.data.items];
        const existingIndex = newItems.findIndex(
          (item) => item.product._id === productId
        );

        if (existingIndex === -1) {
          // Product not in cart - add with temporary ID
          newItems.push({
            _id: `temp_${Date.now()}`,
            quantity: addedQuantity,
            product: { _id: productId },
          });
        } else {
          // Product already in cart - increment quantity
          newItems[existingIndex].quantity += addedQuantity;
        }

        return {
          ...old,
          data: {
            ...old.data,
            items: newItems,
          },
        };
      });

      return { previousCart };
    },
    onError: (error: any, _, context: any) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }

      const message = error.message || 'Failed to add to cart';
      if (message.includes('429')) {
        toast.error('Please wait a moment before trying again');
      } else {
        toast.error(message);
      }
    },
    onSuccess: () => {
      // Always refetch to ensure cart is consistent after add
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
      onAddSuccess?.();
    },
    retry: 1,
  });

  /**
   * Update cart item quantity with optimistic update
   * Handles both increases and decreases
   */
  const updateQuantityMutation = useMutation({
    mutationFn: (newQuantity: number) =>
      newQuantity > 0
        ? cartApi.updateCartItem(cartItemId, newQuantity)
        : cartApi.removeCartItem(cartItemId),
    onMutate: async (newQuantity) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update cache
      queryClient.setQueryData(['cart'], (old: CartData) => {
        if (!old?.data?.items) return old;

        const newItems = [...old.data.items];
        const index = newItems.findIndex((item) => item._id === cartItemId);

        if (index >= 0) {
          if (newQuantity > 0) {
            newItems[index].quantity = newQuantity;
          } else {
            // Remove item if quantity is 0
            newItems.splice(index, 1);
          }
        }

        return {
          ...old,
          data: {
            ...old.data,
            items: newItems,
          },
        };
      });

      return { previousCart };
    },
    onError: (error: any, _, context: any) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }

      const message = error.message || 'Failed to update quantity';
      if (message.includes('429')) {
        toast.error('Please wait a moment before adjusting quantity');
      } else {
        toast.error(message);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    retry: 1,
  });

  /**
   * Smart debounced request handler
   * Prevents rapid-fire duplicate requests while allowing responsive UI
   */
  const makeRequest = useCallback(
    (operation: () => void) => {
      const now = Date.now();
      const timeSinceLastOp = now - lastOperationTimeRef.current;

      // Block if we already have a pending operation AND we're within debounce window
      if (pendingOperationRef.current && timeSinceLastOp < debounceMs) {
        return; // Silently ignore rapid repeated clicks
      }

      // Allow the operation
      lastOperationTimeRef.current = now;
      pendingOperationRef.current = true;

      operation();
    },
    [debounceMs]
  );

  /**
   * Handle add to cart button click
   */
  const handleAddToCart = useCallback(() => {
    makeRequest(() => {
      addToCartMutation.mutate(1);
    });
  }, [makeRequest, addToCartMutation]);

  /**
   * Handle increase quantity button click
   */
  const handleIncrease = useCallback(
    (productStock: number) => {
      if (currentQuantity < productStock) {
        makeRequest(() => {
          updateQuantityMutation.mutate(currentQuantity + 1);
        });
      }
    },
    [currentQuantity, makeRequest, updateQuantityMutation]
  );

  /**
   * Handle decrease quantity button click
   */
  const handleDecrease = useCallback(() => {
    makeRequest(() => {
      const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 0;
      updateQuantityMutation.mutate(newQuantity);
    });
  }, [currentQuantity, makeRequest, updateQuantityMutation]);

  // Clear pending operation flag when mutations complete
  const isMutating = addToCartMutation.isPending || updateQuantityMutation.isPending;
  if (!isMutating && pendingOperationRef.current) {
    pendingOperationRef.current = false;
  }

  return {
    // State
    currentQuantity,
    cartLoading,
    isMutating,

    // Handlers
    handleAddToCart,
    handleIncrease,
    handleDecrease,

    // Optional: expose mutations for advanced usage
    addToCartMutation,
    updateQuantityMutation,
  };
};
