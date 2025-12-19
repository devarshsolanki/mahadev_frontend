import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { subscriptionsApi } from '@/api/subscriptions';
import { productsApi } from '@/api/products';
import { authApi } from '@/api/auth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';

interface SubscriptionItem {
  productId: string;
  quantity: number;
  product?: any;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const CreateSubscription = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState<'products' | 'schedule' | 'address'>('products');
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [deliveryTime, setDeliveryTime] = useState({ hour: 8, minute: 0 });
  const [deliveryDays, setDeliveryDays] = useState<number[]>([1, 3, 5]); // Default: Mon, Wed, Fri
  const [deliveryDate, setDeliveryDate] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-for-subscription', searchQuery],
    queryFn: () =>
      productsApi.getProducts({
        search: searchQuery || undefined,
        inStock: true,
        limit: 50
      })
  });

  // Fetch user profile for addresses
  const { data: userData } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile
  });

  // Create subscription mutation
  const createMutation = useMutation({
    mutationFn: subscriptionsApi.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription created successfully!');
      navigate('/subscriptions');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create subscription');
    }
  });

  const products = productsData?.data || [];
  const addresses = userData?.data?.addresses || [];

  // Add item to subscription
  const addItem = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existingItem = items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ productId, quantity: 1, product });
    }

    setItems([...items]);
    toast.success(`${product.name} added to subscription`);
  };

  // Remove item from subscription
  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      setItems([...items]);
    }
  };

  // Toggle delivery day for weekly
  const toggleDeliveryDay = (day: number) => {
    if (deliveryDays.includes(day)) {
      setDeliveryDays(deliveryDays.filter(d => d !== day));
    } else {
      setDeliveryDays([...deliveryDays, day].sort());
    }
  };

  // Handle form submission
  const handleCreateSubscription = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item');
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
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      frequency,
      deliveryTime,
      deliveryDays: frequency === 'weekly' ? deliveryDays : undefined,
      deliveryDate: frequency === 'monthly' ? deliveryDate : undefined,
      deliveryAddressId: selectedAddressId,
      paymentMethod: 'wallet' as const,
      customerNotes: customerNotes || undefined
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/subscriptions')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subscriptions
          </button>
          <h1 className="text-3xl font-bold">Create Subscription</h1>
          <p className="text-muted-foreground mt-2">Set up automatic deliveries for your favorite products</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          {['products', 'schedule', 'address'].map((s, idx) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step === s
                    ? 'bg-primary'
                    : ['products', 'schedule'].includes(s) && step === 'address'
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
              <p className="text-sm font-medium mt-2 capitalize">{s}</p>
            </div>
          ))}
        </div>

        {/* Step 1: Products Selection */}
        {step === 'products' && (
          <div className="space-y-6">
            {/* Search Products */}
            <Card className="p-6">
              <label className="block text-sm font-medium mb-2">Search Products</label>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Card>

            {/* Products Grid */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Available Products</h2>

              {productsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      <div className="aspect-square mb-3 bg-muted rounded overflow-hidden">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">₹{product.price}</span>
                        {product.stock > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Out
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => addItem(product._id)}
                        size="sm"
                        className="w-full"
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Selected Items */}
            {items.length > 0 && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h2 className="text-lg font-semibold mb-4">Selected Items ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-muted-foreground">₹{item.product?.price || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/subscriptions')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('schedule')}
                disabled={items.length === 0}
                className="flex-1"
              >
                Next: Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule Configuration */}
        {step === 'schedule' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Delivery Schedule</h2>

              {/* Frequency */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => {
                        setFrequency(freq);
                        if (freq === 'weekly' && deliveryDays.length === 0) {
                          setDeliveryDays([1, 3, 5]);
                        }
                      }}
                      className={`p-3 rounded border font-medium capitalize transition-colors ${
                        frequency === freq
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-muted hover:border-muted-foreground'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Preferred Delivery Time</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Hour</label>
                    <select
                      value={deliveryTime.hour}
                      onChange={(e) => setDeliveryTime({ ...deliveryTime, hour: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Minute</label>
                    <select
                      value={deliveryTime.minute}
                      onChange={(e) => setDeliveryTime({ ...deliveryTime, minute: parseInt(e.target.value) })}
                      className="w-full p-2 border rounded"
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

              {/* Weekly Days Selection */}
              {frequency === 'weekly' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Delivery Days</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDeliveryDay(day.value)}
                        className={`p-2 rounded font-medium text-sm transition-colors ${
                          deliveryDays.includes(day.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted-foreground/20'
                        }`}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Date Selection */}
              {frequency === 'monthly' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Delivery Date</label>
                  <select
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                  >
                    {Array.from({ length: 31 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {(i + 1).toString().padStart(2, '0')} of every month
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Customer Notes (Optional)</label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Add any special instructions..."
                  className="w-full p-2 border rounded resize-none"
                  rows={3}
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('products')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('address')}
                className="flex-1"
              >
                Next: Address
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Address Selection */}
        {step === 'address' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Select Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No addresses found</p>
                  <Button onClick={() => navigate('/profile')}>
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address._id
                          ? 'bg-primary/5 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium capitalize">{address.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{address.fullAddress}</p>
                          {address.landmark && (
                            <p className="text-sm text-muted-foreground">Near: {address.landmark}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.isDefault && (
                            <Badge className="mt-2 bg-green-100 text-green-800">Default</Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </Card>

            {/* Order Summary */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="font-medium capitalize">{frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">
                    {deliveryTime.hour.toString().padStart(2, '0')}:
                    {deliveryTime.minute.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('schedule')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateSubscription}
                disabled={!selectedAddressId || createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Subscription'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSubscription;
