# Wallet Integration for CreateSubscription.tsx

## Required Changes

### 1. Add Imports (at top of file, after existing imports)
```tsx
import { walletApi } from '@/api/wallet';
import { VerifyPinDialog } from '@/components/wallet/VerifyPinDialog';
```

### 2. Add State Variables (after existing useState declarations around line 40)
```tsx
const [isVerifyPinOpen, setIsVerifyPinOpen] = useState(false);
const [verifiedPin, setVerifiedPin] = useState('');
```

### 3. Add Wallet Data Fetch (after userData query around line 60)
```tsx
// Fetch wallet data
const { data: walletData } = useQuery({
  queryKey: ['wallet'],
  queryFn: walletApi.getWallet
});
```

### 4. Replace `handleCreateSubscription` function (around line 120)
Replace the existing function with:
```tsx
// Handle create subscription button click
const handleCreateSubscriptionClick = () => {
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

  // Check if wallet PIN is set
  if (!walletData?.data?.isPinSet) {
    toast.error('Please set a wallet PIN first');
    navigate('/wallet');
    return;
  }

  // Check wallet balance
  const walletBalance = walletData?.data?.balance || 0;
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  
  if (walletBalance < total) {
    toast.error(`Insufficient wallet balance. You need ₹${total.toFixed(2)} but have ₹${walletBalance.toFixed(2)}`);
    return;
  }

  // Open PIN verification dialog
  setIsVerifyPinOpen(true);
};

// Handle PIN verification success
const handlePinVerified = (pin: string) => {
  setVerifiedPin(pin);
  
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
    customerNotes: customerNotes || undefined,
    walletPIN: pin
  };

  createMutation.mutate(payload);
};
```

### 5. Update Button onClick (find the "Create Subscription" button around line 540)
Change:
```tsx
onClick={handleCreateSubscription}
```
To:
```tsx
onClick={handleCreateSubscriptionClick}
```

### 6. Add VerifyPinDialog Component (before closing </div></div> at end of file)
```tsx
{/* Verify PIN Dialog */}
<VerifyPinDialog
  open={isVerifyPinOpen}
  onOpenChange={setIsVerifyPinOpen}
  onSuccess={handlePinVerified}
  title="Verify PIN for Subscription"
  description="Enter your wallet PIN to confirm subscription payment"
/>
```

## Summary
These changes add:
- Wallet balance checking before subscription creation
- PIN verification requirement
- Proper error messages for insufficient balance or missing PIN
- PIN dialog integration
