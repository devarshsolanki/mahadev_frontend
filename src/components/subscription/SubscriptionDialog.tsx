import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions';
import { authApi } from '@/api/auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, MapPin, Package, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
    _id: string;
    name: string;
    price: number;
    mrp?: number;
    unit?: string;
    stock: number;
    images?: any[];
    image?: string;
}

interface SubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    initialQuantity?: number;
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', fullLabel: 'Sunday' },
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

export function SubscriptionDialog({
    open,
    onOpenChange,
    product,
    initialQuantity = 1,
}: SubscriptionDialogProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form state
    const [quantity, setQuantity] = useState(initialQuantity);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [deliveryTime, setDeliveryTime] = useState({ hour: 8, minute: 0 });
    const [deliveryDays, setDeliveryDays] = useState<number[]>([1, 3, 5]); // Default: Mon, Wed, Fri
    const [deliveryDate, setDeliveryDate] = useState(1);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');

    // Fetch user profile for addresses
    const { data: userData, isLoading: loadingAddresses } = useQuery({
        queryKey: ['profile'],
        queryFn: authApi.getProfile,
        enabled: open, // Only fetch when dialog is open
    });

    const addresses = userData?.data?.addresses || [];

    // Set default address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find((addr: any) => addr.isDefault);
            setSelectedAddressId(defaultAddress?._id || addresses[0]._id);
        }
    }, [addresses, selectedAddressId]);

    // Create subscription mutation
    const createMutation = useMutation({
        mutationFn: subscriptionsApi.createSubscription,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            toast.success('Subscription created successfully!', {
                description: `Next delivery: ${new Date(data.data.nextDeliveryDate).toLocaleDateString()}`,
            });
            onOpenChange(false);
            // Navigate to subscriptions page after a brief delay
            setTimeout(() => navigate('/subscriptions'), 500);
        },
        onError: (error: any) => {
            toast.error('Failed to create subscription', {
                description: error.message || 'Please try again',
            });
        },
    });

    // Toggle delivery day for weekly subscriptions
    const toggleDeliveryDay = (day: number) => {
        if (deliveryDays.includes(day)) {
            // Don't allow removing the last day
            if (deliveryDays.length === 1) {
                toast.error('At least one delivery day is required');
                return;
            }
            setDeliveryDays(deliveryDays.filter((d) => d !== day));
        } else {
            setDeliveryDays([...deliveryDays, day].sort());
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validation
        if (quantity < 1) {
            toast.error('Quantity must be at least 1');
            return;
        }

        if (quantity > product.stock) {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
        }

        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        if (frequency === 'weekly' && deliveryDays.length === 0) {
            toast.error('Please select at least one delivery day');
            return;
        }

        const payload = {
            items: [
                {
                    productId: product._id,
                    quantity,
                },
            ],
            frequency,
            deliveryTime,
            deliveryDays: frequency === 'weekly' ? deliveryDays : undefined,
            deliveryDate: frequency === 'monthly' ? deliveryDate : undefined,
            deliveryAddressId: selectedAddressId,
            paymentMethod: 'wallet' as const,
            customerNotes: customerNotes || undefined,
        };

        createMutation.mutate(payload);
    };

    // Calculate estimated cost
    const estimatedCost = product.price * quantity;
    const deliveryFee = estimatedCost >= 500 ? 0 : 40;
    const total = estimatedCost + deliveryFee;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Subscription</DialogTitle>
                    <DialogDescription>
                        Set up automatic deliveries for {product.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Product Preview */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="h-16 w-16 bg-background rounded overflow-hidden flex-shrink-0">
                            {(product.images?.[0] || product.image) ? (
                                <img
                                    src={
                                        typeof product.images?.[0] === 'string'
                                            ? product.images[0]
                                            : (product.images?.[0] as any)?.url || product.image
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                ₹{product.price}
                                {product.unit && <span> / {product.unit}</span>}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                                {product.stock} in stock
                            </Badge>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Quantity
                        </Label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 text-center"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={quantity >= product.stock}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Max: {product.stock}
                            </span>
                        </div>
                    </div>

                    {/* Frequency Selector */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Delivery Frequency
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                                <button
                                    key={freq}
                                    onClick={() => setFrequency(freq)}
                                    className={`p-3 rounded-lg border-2 font-medium capitalize transition-colors ${frequency === freq
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-muted hover:border-muted-foreground'
                                        }`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weekly - Day Selection */}
                    {frequency === 'weekly' && (
                        <div className="space-y-2">
                            <Label>Delivery Days</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {DAYS_OF_WEEK.map((day) => (
                                    <button
                                        key={day.value}
                                        onClick={() => toggleDeliveryDay(day.value)}
                                        className={`p-2 rounded-lg font-medium text-sm transition-colors ${deliveryDays.includes(day.value)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted-foreground/20'
                                            }`}
                                        title={day.fullLabel}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Selected: {deliveryDays.map((d) => DAYS_OF_WEEK[d].label).join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Monthly - Date Selection */}
                    {frequency === 'monthly' && (
                        <div className="space-y-2">
                            <Label>Delivery Date</Label>
                            <select
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(parseInt(e.target.value))}
                                className="w-full p-2 border rounded-lg bg-background"
                            >
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                                    <option key={date} value={date}>
                                        {date}{date === 1 ? 'st' : date === 2 ? 'nd' : date === 3 ? 'rd' : 'th'} of every month
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Delivery Time */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Preferred Delivery Time
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs text-muted-foreground">Hour</Label>
                                <select
                                    value={deliveryTime.hour}
                                    onChange={(e) =>
                                        setDeliveryTime({ ...deliveryTime, hour: parseInt(e.target.value) })
                                    }
                                    className="w-full p-2 border rounded-lg bg-background"
                                >
                                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                        <option key={hour} value={hour}>
                                            {hour.toString().padStart(2, '0')}:00
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Minute</Label>
                                <select
                                    value={deliveryTime.minute}
                                    onChange={(e) =>
                                        setDeliveryTime({ ...deliveryTime, minute: parseInt(e.target.value) })
                                    }
                                    className="w-full p-2 border rounded-lg bg-background"
                                >
                                    {[0, 15, 30, 45].map((min) => (
                                        <option key={min} value={min}>
                                            :{min.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Delivery Address
                        </Label>
                        {loadingAddresses ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="p-4 text-center border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-3">No addresses found</p>
                                <Button size="sm" onClick={() => navigate('/profile')}>
                                    Add Address
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {addresses.map((address: any) => (
                                    <label
                                        key={address._id}
                                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === address._id
                                                ? 'bg-primary/5 border-primary'
                                                : 'hover:bg-muted/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address._id}
                                            checked={selectedAddressId === address._id}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm capitalize">{address.label}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {address.fullAddress}, {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            {address.isDefault && (
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Notes */}
                    <div className="space-y-2">
                        <Label>Customer Notes (Optional)</Label>
                        <textarea
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="Add any special delivery instructions..."
                            className="w-full p-2 border rounded-lg bg-background resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                        <h4 className="font-semibold text-sm">Subscription Summary</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Frequency:</span>
                                <span className="font-medium capitalize">{frequency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">{quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">
                                    {deliveryTime.hour.toString().padStart(2, '0')}:
                                    {deliveryTime.minute.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>₹{estimatedCost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee:</span>
                                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base pt-1">
                                    <span>Total per delivery:</span>
                                    <span className="text-primary">₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={createMutation.isPending || !selectedAddressId}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Subscription'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
