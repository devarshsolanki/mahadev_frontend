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
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
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

        {/* Split Layout: Products on Left, Details on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Products */}
            <Card className="p-4 shadow-md">
              <label className="block text-sm font-semibold mb-3">🔍 Search Products</label>
              <Input
                placeholder="Type to search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-base"
              />
            </Card>

            {/* Products Grid */}
            <Card className="p-4 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Available Products</h2>
                {products.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {products.length} product{products.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {productsLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-4">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-lg text-muted-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const isAdded = items.some(item => item.productId === product._id);
                    return (
                      <div
                        key={product._id}
                        className={`group relative border-2 rounded-xl p-3 transition-all duration-300 hover:shadow-lg ${isAdded
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 hover:border-primary/50 bg-white'
                          }`}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={
                                typeof product.images[0] === 'string'
                                  ? product.images[0]
                                  : (product.images[0] as any).url
                              }
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">
                              📦
                            </div>
                          )}

                          {/* Stock Badge */}
                          <div className="absolute top-2 right-2">
                            {product.stock > 0 ? (
                              <Badge className="bg-green-500 text-white border-0 shadow-lg text-xs">
                                In Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white border-0 shadow-lg text-xs">
                                Out
                              </Badge>
                            )}
                          </div>

                          {/* Added Indicator */}
                          {isAdded && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-primary text-white border-0 shadow-lg text-xs">
                                ✓ Added
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-primary">
                              ₹{product.price}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>

                          {/* Add Button */}
                          <Button
                            onClick={() => addItem(product._id)}
                            disabled={product.stock === 0 || isAdded}
                            className="w-full mt-3"
                            size="sm"
                          >
                            {isAdded ? (
                              <>✓ Added</>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: Details Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Selected Items */}
              <Card className="p-4 shadow-lg border-primary/20">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  🛒 Cart
                  {items.length > 0 && (
                    <Badge className="bg-primary text-white">{items.length}</Badge>
                  )}
                </h2>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">🛒</div>
                    <p className="text-sm">No items added yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
                        >
                          {/* Product Image Thumbnail */}
                          {item.product?.images && item.product.images.length > 0 && (
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={
                                  typeof item.product.images[0] === 'string'
                                    ? item.product.images[0]
                                    : (item.product.images[0] as any).url
                                }
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{item.product?.price || 0} × {item.quantity}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-6 w-6 p-0"
                              >
                                −
                              </Button>
                              <span className="w-8 text-center font-medium text-xs">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.productId)}
                                className="h-6 w-6 p-0 ml-auto hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total per delivery:</span>
                        <span className="text-xl font-bold text-primary">
                          ₹{items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </Card>

              {/* Schedule Configuration */}
              <Card className="p-4 shadow-lg">
                <h2 className="text-lg font-bold mb-3">📅 Schedule</h2>

                {/* Frequency */}
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-2">Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => {
                          setFrequency(freq);
                          if (freq === 'weekly' && deliveryDays.length === 0) {
                            setDeliveryDays([1, 3, 5]);
                          }
                        }}
                        className={`p-2 rounded text-xs font-medium capitalize transition-colors ${frequency === freq
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted-foreground/20'
                          }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="mb-4">
                  <label className="block text-xs font-medium mb-2">Delivery Time</label>
                  <div className="flex gap-2">
                    <select
                      value={deliveryTime.hour}
                      onChange={(e) => setDeliveryTime({ ...deliveryTime, hour: parseInt(e.target.value) })}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <select
                      value={deliveryTime.minute}
                      onChange={(e) => setDeliveryTime({ ...deliveryTime, minute: parseInt(e.target.value) })}
                      className="flex-1 p-2 border rounded text-sm"
                    >
                      {[0, 15, 30, 45].map((min) => (
                        <option key={min} value={min}>
                          :{min.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Weekly Days Selection */}
                {frequency === 'weekly' && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-2">Delivery Days</label>
                    <div className="grid grid-cols-4 gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => toggleDeliveryDay(day.value)}
                          className={`p-1 rounded text-xs font-medium transition-colors ${deliveryDays.includes(day.value)
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
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-2">Delivery Date</label>
                    <select
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(parseInt(e.target.value))}
                      className="w-full p-2 border rounded text-sm"
                    >
                      {Array.from({ length: 31 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {(i + 1).toString().padStart(2, '0')} of month
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Notes */}
                <div>
                  <label className="block text-xs font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Special instructions..."
                    className="w-full p-2 border rounded resize-none text-sm"
                    rows={2}
                  />
                </div>
              </Card>

              {/* Address Selection */}
              <Card className="p-4 shadow-lg">
                <h2 className="text-lg font-bold mb-3">📍 Delivery Address</h2>

                {addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No addresses found</p>
                    <Button size="sm" onClick={() => navigate('/profile')}>
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors block ${selectedAddressId === address._id
                          ? 'bg-primary/10 border-primary'
                          : 'border-muted hover:bg-muted/50'
                          }`}
                      >
                        <div className="flex items-start gap-2">
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
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {address.city}, {address.pincode}
                            </p>
                            {address.isDefault && (
                              <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Default</Badge>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              {/* Create Button */}
              <Button
                onClick={handleCreateSubscription}
                disabled={items.length === 0 || !selectedAddressId || createMutation.isPending}
                className="w-full h-12 text-base font-bold"
                size="lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Subscription'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/subscriptions')}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default CreateSubscription;
