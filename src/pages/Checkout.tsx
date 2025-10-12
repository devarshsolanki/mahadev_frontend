import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { checkoutApi } from '@/api/orders';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, MapPin, Wallet as WalletIcon, CreditCard, Banknote } from 'lucide-react';
import { walletApi } from '@/api/wallet';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'cod' | 'card' | 'upi'>('cod');
  const [walletPIN, setWalletPIN] = useState('');

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  });

  const { data: deliverySlots } = useQuery({
    queryKey: ['delivery-slots'],
    queryFn: checkoutApi.getDeliverySlots,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    enabled: paymentMethod === 'wallet',
  });

  const createOrderMutation = useMutation({
    mutationFn: checkoutApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Order placed successfully!');
      navigate('/orders');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (paymentMethod === 'wallet' && !walletPIN) {
      toast.error('Please enter your wallet PIN');
      return;
    }

    if (paymentMethod === 'wallet' && (wallet?.data?.balance || 0) < (cart?.data?.total || 0)) {
      toast.error('Insufficient wallet balance');
      return;
    }

    const slotData = selectedSlot ? JSON.parse(selectedSlot) : undefined;

    createOrderMutation.mutate({
      deliveryAddressId: selectedAddress,
      paymentMethod,
      deliverySlot: slotData,
      walletPIN: paymentMethod === 'wallet' ? walletPIN : undefined,
    });
  };

  const addresses = user?.data?.addresses || [];
  const cartData = cart?.data;

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart before checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>

            {addresses.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No addresses saved</p>
                <Button onClick={() => navigate('/profile')}>Add Address</Button>
              </div>
            ) : (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                <div className="space-y-3">
                  {addresses.map((address: any) => (
                    <div key={address._id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={address._id} id={address._id} />
                      <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{address.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                          {address.city}, {address.state} - {address.pincode}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </Card>

          {/* Delivery Slot */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Slot (Optional)</h2>

            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No preference</SelectItem>
                {deliverySlots?.data?.map((slot: any) => (
                  slot.slots.map((timeSlot: any) => (
                    timeSlot.available && (
                      <SelectItem
                        key={`${slot.date}-${timeSlot.time}`}
                        value={JSON.stringify({ date: slot.date, time: timeSlot.time })}
                      >
                        {slot.date} - {timeSlot.time}
                      </SelectItem>
                    )
                  ))
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex-1 cursor-pointer flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Wallet</div>
                      {wallet?.data && (
                        <div className="text-sm text-muted-foreground">
                          Balance: ₹{wallet.data.balance}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    <div className="font-medium">Cash on Delivery</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <div className="font-medium">Card</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <div className="font-medium">UPI</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === 'wallet' && (
              <div className="mt-4">
                <Label htmlFor="walletPIN">Wallet PIN</Label>
                <Input
                  id="walletPIN"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={walletPIN}
                  onChange={(e) => setWalletPIN(e.target.value)}
                  maxLength={4}
                  className="mt-2"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({cartData.items.length})</span>
                <span className="font-medium">₹{cartData.subtotal}</span>
              </div>

              {cartData.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{cartData.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">
                  {cartData.deliveryFee === 0 ? 'FREE' : `₹${cartData.deliveryFee}`}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{cartData.total}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full btn-primary"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending || !selectedAddress}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
