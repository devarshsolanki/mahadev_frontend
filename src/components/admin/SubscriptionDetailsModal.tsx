import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionDetailsModalProps {
    subscription: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SubscriptionDetailsModal({
    subscription,
    open,
    onOpenChange,
}: SubscriptionDetailsModalProps) {
    if (!subscription) return null;

    const getProductImage = (item: any) => {
        if (item.product?.images && item.product.images.length > 0) {
            const img = item.product.images[0];
            return typeof img === 'string' ? img : img.url;
        }
        return item.product?.image || item.productSnapshot?.image;
    };

    const calculateDiscount = (mrp: number, price: number) => {
        if (!mrp || mrp <= price) return null;
        const discount = mrp - price;
        const percentage = ((discount / mrp) * 100).toFixed(2);
        return { amount: discount, percentage };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Subscription Details
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {subscription.subscriptionId}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </h3>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{subscription.user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{subscription.user?.phone || 'N/A'}</p>
                                </div>
                            </div>

                            {subscription.deliveryAddressDetails && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Delivery Address
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-medium capitalize">{subscription.deliveryAddressDetails.label}</span>
                                        <br />
                                        {subscription.deliveryAddressDetails.fullAddress}
                                        {subscription.deliveryAddressDetails.landmark && (
                                            <>, Near {subscription.deliveryAddressDetails.landmark}</>
                                        )}
                                        <br />
                                        {subscription.deliveryAddressDetails.city}, {subscription.deliveryAddressDetails.state} - {subscription.deliveryAddressDetails.pincode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Information
                        </h3>
                        <div className="space-y-3">
                            {subscription.items?.map((item: any, index: number) => {
                                const product = item.product || {};
                                const snapshot = item.productSnapshot || {};
                                const discount = calculateDiscount(product.mrp || 0, product.price || item.price);

                                return (
                                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="h-24 w-24 bg-background rounded overflow-hidden flex-shrink-0">
                                                {getProductImage(item) ? (
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={product.name || snapshot.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 space-y-2">
                                                <h4 className="font-semibold">{product.name || snapshot.name}</h4>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Price</p>
                                                        <p className="font-medium">₹{product.price || item.price}</p>
                                                    </div>
                                                    {product.mrp && product.mrp > (product.price || item.price) && (
                                                        <div>
                                                            <p className="text-muted-foreground">MRP</p>
                                                            <p className="font-medium line-through text-muted-foreground">₹{product.mrp}</p>
                                                        </div>
                                                    )}
                                                    {product.unit && (
                                                        <div>
                                                            <p className="text-muted-foreground">Unit</p>
                                                            <p className="font-medium">{product.unit}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-muted-foreground">Quantity</p>
                                                        <p className="font-medium">{item.quantity}</p>
                                                    </div>
                                                </div>

                                                {discount && (
                                                    <div className="pt-2 border-t">
                                                        <Badge variant="destructive" className="text-xs">
                                                            Save ₹{discount.amount} ({discount.percentage}% OFF)
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subscription Details */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Subscription Details
                        </h3>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mt-1">
                                        ACTIVE
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Frequency</p>
                                    <p className="font-medium capitalize">{subscription.frequency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-medium">
                                        {subscription.startDate ? format(new Date(subscription.startDate), 'MMM dd, yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Next Delivery</p>
                                    <p className="font-medium">
                                        {subscription.nextDeliveryDate ? format(new Date(subscription.nextDeliveryDate), 'MMM dd, yyyy') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {subscription.deliveryTime && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Delivery Time
                                    </p>
                                    <p className="font-medium">
                                        {subscription.deliveryTime.hour?.toString().padStart(2, '0')}:
                                        {subscription.deliveryTime.minute?.toString().padStart(2, '0')}
                                    </p>
                                </div>
                            )}

                            {subscription.frequency === 'weekly' && subscription.deliveryDays && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Delivery Days</p>
                                    <div className="flex gap-1 flex-wrap">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                            <Badge
                                                key={idx}
                                                variant={subscription.deliveryDays.includes(idx) ? 'default' : 'outline'}
                                                className="text-xs"
                                            >
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subscription.frequency === 'monthly' && subscription.deliveryDate && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
                                    <p className="font-medium">{subscription.deliveryDate} of every month</p>
                                </div>
                            )}

                            {subscription.customerNotes && (
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                                    <p className="text-sm italic">{subscription.customerNotes}</p>
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Total per delivery</p>
                                    <p className="text-lg font-bold text-primary">₹{subscription.total || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    {(subscription.totalOrders > 0 || subscription.successfulOrders > 0) && (
                        <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Statistics</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold">{subscription.totalOrders || 0}</p>
                                    <p className="text-xs text-muted-foreground">Total Orders</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{subscription.successfulOrders || 0}</p>
                                    <p className="text-xs text-muted-foreground">Successful</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">₹{subscription.totalSpent || 0}</p>
                                    <p className="text-xs text-muted-foreground">Total Spent</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
