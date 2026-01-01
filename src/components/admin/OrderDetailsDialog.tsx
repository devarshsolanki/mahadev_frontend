import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, User, CreditCard, Calendar, Package } from 'lucide-react';

interface OrderDetailsDialogProps {
    order: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog = ({ order, open, onOpenChange }: OrderDetailsDialogProps) => {
    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center justify-between text-2xl">
                        <span>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-full max-h-[calc(90vh-80px)] px-6 pb-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" /> Customer Details
                            </h3>
                            <div className="rounded-lg border p-4 space-y-2 text-sm">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="col-span-2 font-medium">{order.user?.name || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="col-span-2 font-medium">{order.user?.phone || 'N/A'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="col-span-2 font-medium">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Delivery Address
                            </h3>
                            <div className="rounded-lg border p-4 space-y-2 text-sm">
                                <div className="font-medium">{order.deliveryAddress?.label}</div>
                                <div className="text-muted-foreground">
                                    {order.deliveryAddress?.fullAddress}
                                </div>
                                <div className="text-muted-foreground">
                                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                                </div>
                                {order.deliveryAddress?.landmark && (
                                    <div className="text-muted-foreground text-xs mt-1">
                                        Landmark: {order.deliveryAddress.landmark}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Payment Information
                            </h3>
                            <div className="rounded-lg border p-4 space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`font-medium capitalize ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                {order.paymentDetails?.transactionId && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-muted-foreground">Transaction ID:</span>
                                        <span className="font-medium text-xs">{order.paymentDetails.transactionId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4" /> Order Summary
                            </h3>
                            <div className="rounded-lg border p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>₹{order.subtotal || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee:</span>
                                    <span>₹{order.deliveryFee || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax:</span>
                                    <span>₹{order.tax || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount:</span>
                                    <span className="text-green-600">-₹{order.discount || 0}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Order Items ({order.items?.length || 0})</h3>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Product</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Qty</th>
                                        <th className="px-4 py-3 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items?.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded border bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product?.images?.[0] || '/placeholder.png'}
                                                            alt={item.product?.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="font-medium line-clamp-2">
                                                        {item.product?.name || 'Product Unavailable'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">₹{item.price}</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ₹{item.price * item.quantity}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsDialog;
