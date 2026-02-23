import { Button } from '@/components/ui/button';
import { Plus, Minus, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCartItem } from '@/hooks/useCartItem';

interface ProductCardAddToCartProps {
  productId: string;
  productStock: number;
  size?: 'sm' | 'lg' | 'default';
  className?: string;
  onAddSuccess?: () => void;
}

/**
 * Unified cart quantity control component used across the application
 * Displays "Add to Cart" button or quantity controls based on cart state
 * Provides instant UI feedback with optimistic updates
 */
export const ProductCardAddToCart = ({
  productId,
  productStock,
  size = 'sm',
  className = '',
  onAddSuccess,
}: ProductCardAddToCartProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Use the optimized cart management hook
  const {
    currentQuantity,
    cartLoading,
    isMutating,
    handleAddToCart: cartHandleAddToCart,
    handleIncrease,
    handleDecrease,
  } = useCartItem(productId, { onAddSuccess, debounceMs: 250 });

  // Wrapper for add to cart that checks authentication
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }
    cartHandleAddToCart();
  };

  // Show loading state while cart is being fetched
  if (isAuthenticated && cartLoading) {
    return (
      <Button size={size} variant="outline" className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Show "Add to Cart" button if product not in cart
  if (currentQuantity === 0) {
    const disabled = isMutating || productStock === 0;

    return (
      <Button
        size={size}
        className={`btn-primary ${className}`}
        onClick={handleAddToCart}
        disabled={disabled}
      >
        {isMutating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : productStock === 0 ? (
          'Unavailable'
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    );
  }

  // Show quantity controls if product already in cart
  return (
    <div className="flex items-center gap-8 bg-[#39b8396e] rounded-full">
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : 'lg'}
        className={`h-6 w-8 p-0 ${className}`}
        onClick={() => handleDecrease()}
        disabled={isMutating}
        title="Decrease quantity"
      >
        <Minus className="h-2 w-2" />
      </Button>
      <span className="w-8 text-center font-semibold text-lg">{currentQuantity}</span>
      <Button
        variant="outline"
        size={size === 'sm' ? 'sm' : 'lg'}
        className={`h-8 w-8 p-0 ${className}`}
        onClick={() => handleIncrease(productStock)}
        disabled={isMutating || currentQuantity >= productStock}
        title="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
