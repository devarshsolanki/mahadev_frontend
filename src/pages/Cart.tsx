import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Loader2 } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cart');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove item');
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      await cartApi.applyCoupon(couponCode);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await cartApi.removeCoupon();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Coupon removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove coupon');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const cartData = cart?.data;
  const items = cartData?.items || [];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.product.unit}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-primary">₹{item.price}</span>
                    {item.product.mrp > item.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.product.mrp}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateMutation.mutate({ itemId: item._id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateMutation.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateMutation.mutate({ itemId: item._id, quantity: item.quantity + 1 })}
                        disabled={item.quantity >= item.product.stock || updateMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(item._id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">₹{item.total}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cartData?.subtotal || 0}</span>
              </div>
              {(cartData?.discount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{cartData?.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">
                  {cartData?.deliveryFee === 0 ? 'FREE' : `₹${cartData?.deliveryFee}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{cartData?.total || 0}</span>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              {cartData?.appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{cartData.appliedCoupon.code}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Have a coupon?</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button onClick={handleApplyCoupon} disabled={applyingCoupon}>
                      {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="w-full btn-primary"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
