import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { cartApi } from '@/api/cart';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardAddToCartProps {
  productId: string;
  productStock: number;
  size?: 'sm' | 'lg' | 'default';
  className?: string;
  onAddSuccess?: () => void;
}

export const ProductCardAddToCart = ({
  productId,
  productStock,
  size = 'sm',
  className = '',
  onAddSuccess,
}: ProductCardAddToCartProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(false);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_DEBOUNCE_MS = 500; // Prevent requests within 500ms

  // Fetch cart to check if product is already in cart
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  // Find quantity of current product in cart
  const cartItem = cart?.data?.items?.find((item) => item.product._id === productId);
  const currentQuantity = cartItem?.quantity || 0;
  const cartItemId = cartItem?._id || '';

  // Add to cart mutation with retry logic
  const addToCartMutation = useMutation({
    mutationFn: (quantity: number) => cartApi.addToCart(productId, quantity),
    retry: 1, // Retry once on failure
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (currentQuantity === 0) {
        toast.success('Added to cart!');
      }
      onAddSuccess?.();
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to add to cart';
      
      // Handle rate limiting specifically
      if (message.includes('429') || message.includes('Too Many Requests')) {
        toast.error('Please wait a moment before trying again');
      } else {
        toast.error(message);
      }
    },
    onSettled: () => {
      setIsInitializing(false);
    },
  });

  // Update cart item quantity mutation with retry logic
  const updateQuantityMutation = useMutation({
    mutationFn: (newQuantity: number) => cartApi.updateCartItem(cartItemId, newQuantity),
    retry: 1, // Retry once on failure
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update quantity';
      
      // Handle rate limiting specifically
      if (message.includes('429') || message.includes('Too Many Requests')) {
        toast.error('Please wait a moment before adjusting quantity');
      } else {
        toast.error(message);
      }
    },
  });

  // Handle initial Add button click with debounce protection
  const handleAddToCart = async () => {
    // Debounce: prevent requests too close together
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_DEBOUNCE_MS) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    setIsInitializing(true);
    addToCartMutation.mutate(1);
  };

  // Handle increase quantity with debounce protection
  const handleIncrease = () => {
    // Debounce: prevent requests too close together
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_DEBOUNCE_MS) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (currentQuantity < productStock) {
      updateQuantityMutation.mutate(currentQuantity + 1);
    }
  };

  // Handle decrease quantity with debounce protection
  const handleDecrease = () => {
    // Debounce: prevent requests too close together
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_DEBOUNCE_MS) {
      return;
    }
    lastRequestTimeRef.current = now;

    if (currentQuantity > 1) {
      updateQuantityMutation.mutate(currentQuantity - 1);
    } else if (currentQuantity === 1) {
      // Remove from cart if quantity would be 0
      cartApi.removeCartItem(cartItemId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      });
    }
  };

  // Show loading state while cart is loading
  if (isAuthenticated && cartLoading) {
    return (
      <Button size={size} variant="outline" className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Show Add button if not in cart
  if (currentQuantity === 0) {
    return (
      <Button
        size={size}
        className={`btn-primary ${className}`}
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending || isInitializing || productStock === 0}
      >
        {addToCartMutation.isPending || isInitializing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add'
        )}
      </Button>
    );
  }

  // Show quantity controls if already in cart
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : 'lg'}
        className={`h-8 w-8 p-0 ${className}`}
        onClick={handleDecrease}
        disabled={updateQuantityMutation.isPending}
        title="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-6 text-center font-semibold text-sm">{currentQuantity}</span>
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : 'lg'}
        className={`h-8 w-8 p-0 ${className}`}
        onClick={handleIncrease}
        disabled={updateQuantityMutation.isPending || currentQuantity >= productStock}
        title="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
