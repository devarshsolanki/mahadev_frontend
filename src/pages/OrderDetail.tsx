import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Package, MapPin, CreditCard, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelMutation.mutate(id!);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (!order?.data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </Card>
      </div>
    );
  }

  const orderData = order.data;
  const canCancel = ['pending', 'confirmed'].includes(orderData.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order #{orderData.orderNumber}</h1>
                <p className="text-muted-foreground">
                  Placed on {format(new Date(orderData.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <Badge className={getStatusColor(orderData.status)}>
                {getStatusLabel(orderData.status)}
              </Badge>
            </div>

            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>

            <div className="space-y-4">
              {orderData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Qty: {item.quantity}</span>
                      <span className="text-sm">×</span>
                      <span className="text-sm font-medium">₹{item.price}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">₹{item.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-1">{orderData.deliveryAddress.label}</p>
              <p className="text-sm text-muted-foreground">
                {orderData.deliveryAddress.addressLine1}
                {orderData.deliveryAddress.addressLine2 && `, ${orderData.deliveryAddress.addressLine2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} - {orderData.deliveryAddress.pincode}
              </p>
            </div>

            {orderData.deliverySlot && (
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Delivery Slot: </span>
                <span className="font-medium">
                  {orderData.deliverySlot.date} - {orderData.deliverySlot.time}
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{orderData.subtotal}</span>
              </div>

              {orderData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{orderData.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">
                  {orderData.deliveryFee === 0 ? 'FREE' : `₹${orderData.deliveryFee}`}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{orderData.total}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium capitalize">{orderData.paymentMethod}</p>
                  <p className="text-muted-foreground">
                    Status: <Badge variant="outline" className="ml-1">{orderData.paymentStatus}</Badge>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
