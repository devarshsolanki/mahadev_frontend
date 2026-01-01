import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionDetailsModal } from '@/components/admin/SubscriptionDetailsModal';
import { Calendar, RefreshCw, Eye, Package, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function ActiveSubscriptions() {
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['admin-active-subscriptions'],
        queryFn: adminApi.getActiveSubscriptions,
    });

    const subscriptions = data?.data || [];

    const handleViewDetails = (subscription: any) => {
        setSelectedSubscription(subscription);
        setDetailsModalOpen(true);
    };

    const getProductImage = (item: any) => {
        if (item.product?.images && item.product.images.length > 0) {
            const img = item.product.images[0];
            return typeof img === 'string' ? img : img.url;
        }
        return item.product?.image || item.productSnapshot?.image;
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-32 w-full" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Active Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">
                        View all active customer subscriptions
                    </p>
                </div>
                <Button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{subscriptions.length}</p>
                            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {new Set(subscriptions.map((s: any) => s.user?._id)).size}
                            </p>
                            <p className="text-sm text-muted-foreground">Unique Customers</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                            <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {subscriptions.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Items</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Subscriptions List */}
            {subscriptions.length === 0 ? (
                <Card className="p-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Active Subscriptions</h2>
                    <p className="text-muted-foreground">
                        There are currently no active subscriptions in the system.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-4 font-semibold">Subscription ID</th>
                                            <th className="text-left p-4 font-semibold">Customer</th>
                                            <th className="text-left p-4 font-semibold">Phone</th>
                                            <th className="text-left p-4 font-semibold">Product</th>
                                            <th className="text-left p-4 font-semibold">Qty</th>
                                            <th className="text-left p-4 font-semibold">Frequency</th>
                                            <th className="text-left p-4 font-semibold">Next Delivery</th>
                                            <th className="text-left p-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map((subscription: any) => (
                                            <tr key={subscription._id} className="border-t hover:bg-muted/30">
                                                <td className="p-4">
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                        {subscription.subscriptionId}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{subscription.user?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{subscription.user?.phone || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {subscription.items?.[0] && (
                                                            <>
                                                                <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                                                    {getProductImage(subscription.items[0]) ? (
                                                                        <img
                                                                            src={getProductImage(subscription.items[0])}
                                                                            alt="Product"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm line-clamp-1">
                                                                        {subscription.items[0].product?.name || subscription.items[0].productSnapshot?.name}
                                                                    </p>
                                                                    {subscription.items.length > 1 && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            +{subscription.items.length - 1} more
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-medium">{subscription.items?.[0]?.quantity || 0}</span>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {subscription.frequency}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {subscription.nextDeliveryDate
                                                                ? format(new Date(subscription.nextDeliveryDate), 'MMM dd, yyyy')
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetails(subscription)}
                                                        className="gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {subscriptions.map((subscription: any) => (
                            <Card key={subscription._id} className="p-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                            {subscription.subscriptionId}
                                        </Badge>
                                        <Badge variant="outline" className="capitalize">
                                            {subscription.frequency}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{subscription.user?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">{subscription.user?.phone || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {subscription.items?.[0] && (
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                                            <div className="h-12 w-12 bg-background rounded overflow-hidden flex-shrink-0">
                                                {getProductImage(subscription.items[0]) ? (
                                                    <img
                                                        src={getProductImage(subscription.items[0])}
                                                        alt="Product"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {subscription.items[0].product?.name || subscription.items[0].productSnapshot?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {subscription.items[0].quantity}
                                                    {subscription.items.length > 1 && ` • +${subscription.items.length - 1} more`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Next:</span>
                                        <span className="font-medium">
                                            {subscription.nextDeliveryDate
                                                ? format(new Date(subscription.nextDeliveryDate), 'MMM dd, yyyy')
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetails(subscription)}
                                        className="w-full gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <SubscriptionDetailsModal
                subscription={selectedSubscription}
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
            />
        </div>
    );
}
