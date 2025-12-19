import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import { cartApi } from '@/api/cart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    setAddingToCart(true);
    try {
      await cartApi.addToCart(product!.data._id, quantity);
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </Card>
      </div>
    );
  }

  const productData = product.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
            {productData.images?.[0] ? (
              <img
                src={
                  Array.isArray(productData.images) && productData.images.length
                    ? (typeof productData.images[0] === 'string' ? productData.images[0] : (productData.images[0] as any).url)
                    : undefined
                }
                alt={productData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
            {productData.discount > 0 && (
              <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-md font-semibold shadow-lg">
                {productData.discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{productData.name}</h1>
            <Badge variant="secondary" className="mb-4">
              {productData.category?.name}
            </Badge>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold text-primary">
                ₹{productData.price}
                {productData.unit && (
                  <span className="text-lg text-muted-foreground ml-3">/ {productData.unit}</span>
                )}
              </span>
              {productData.mrp > productData.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{productData.mrp}
                  </span>
                  <Badge variant="destructive">Save ₹{productData.mrp - productData.price}</Badge>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{productData.description}</p>
          </div>

          {/* Stock Status */}
          <div>
            {productData.stock > 0 ? (
              <Badge variant="outline" className="text-primary">
                In Stock ({productData.stock} available)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Quantity Selector */}
          {productData.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(productData.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 btn-primary"
                  disabled={addingToCart}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to subscribe');
                      navigate('/auth');
                      return;
                    }
                    setSubscriptionDialogOpen(true);
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Dialog */}
      {productData && (
        <SubscriptionDialog
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
          product={productData}
          initialQuantity={quantity}
        />
      )}
    </div>
  );
};

export default ProductDetail;
