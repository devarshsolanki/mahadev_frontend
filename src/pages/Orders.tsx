import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '@/api/orders';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getMyOrders,
  });

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
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const ordersList = orders?.data || [];

  if (ordersList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {ordersList.map((order: any) => (
          <Card key={order._id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Items:</span>
                  <span className="ml-2 font-medium">{order.items.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-medium text-primary">₹{order.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="ml-2 font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              {order.deliverySlot && (
                <p className="text-sm text-muted-foreground mt-2">
                  Delivery: {order.deliverySlot.date} - {order.deliverySlot.time}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
