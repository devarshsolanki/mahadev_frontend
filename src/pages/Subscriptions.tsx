import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { subscriptionsApi } from '@/api/subscriptions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Calendar, Plus, Pause, Play, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Subscriptions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getSubscriptions,
  });

  const pauseMutation = useMutation({
    mutationFn: ({ id, pausedUntil }: { id: string; pausedUntil: string }) =>
      subscriptionsApi.pauseSubscription(id, pausedUntil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription paused');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to pause subscription');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.resumeSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription resumed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resume subscription');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  const handlePause = (id: string) => {
    const pausedUntil = new Date();
    pausedUntil.setDate(pausedUntil.getDate() + 7);
    pauseMutation.mutate({ id, pausedUntil: pausedUntil.toISOString() });
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      cancelMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || colors.active;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const subscriptionsList = subscriptions?.data || [];

  if (subscriptionsList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No subscriptions yet</h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to your favorite products and never run out!
          </p>
          <Button onClick={() => navigate('/products')}>
            <Plus className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Subscriptions</h1>
        <Button onClick={() => navigate('/products')}>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>

      <div className="space-y-4">
        {subscriptionsList.map((subscription: any) => (
          <Card key={subscription._id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {subscription.frequency}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Delivery:</span>
                    <span className="font-medium">
                      {format(new Date(subscription.nextDeliveryDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Items: </span>
                    <span className="font-medium">{subscription.items.length}</span>
                  </div>

                  <div className="text-lg font-bold text-primary">
                    ₹{subscription.totalAmount} per delivery
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {subscription.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePause(subscription._id)}
                    disabled={pauseMutation.isPending}
                  >
                    {pauseMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Pause className="mr-2 h-4 w-4" />
                    )}
                    Pause
                  </Button>
                )}

                {subscription.status === 'paused' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resumeMutation.mutate(subscription._id)}
                    disabled={resumeMutation.isPending}
                  >
                    {resumeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    Resume
                  </Button>
                )}

                {subscription.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(subscription._id)}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscription.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="font-medium flex-1">
                      {typeof item.product === 'string' ? 'Product' : item.product.name}
                    </div>
                    <div className="text-muted-foreground">× {item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
