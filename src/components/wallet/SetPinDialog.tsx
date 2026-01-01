import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface SetPinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    isChangingPin?: boolean;
    currentPinRequired?: boolean;
}

export const SetPinDialog = ({
    open,
    onOpenChange,
    onSuccess,
    isChangingPin = false,
    currentPinRequired = false
}: SetPinDialogProps) => {
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showOldPin, setShowOldPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (currentPinRequired && !oldPin) {
            toast.error('Please enter your current PIN');
            return;
        }

        if (!newPin) {
            toast.error('Please enter a new PIN');
            return;
        }

        if (newPin.length < 4 || newPin.length > 6) {
            toast.error('PIN must be 4-6 digits');
            return;
        }

        if (!/^\d+$/.test(newPin)) {
            toast.error('PIN must contain only numbers');
            return;
        }

        if (newPin !== confirmPin) {
            toast.error('PINs do not match');
            return;
        }

        setIsLoading(true);

        try {
            const { walletApi } = await import('@/api/wallet');

            if (currentPinRequired && oldPin) {
                await walletApi.setPIN(newPin, oldPin);
            } else {
                await walletApi.setPIN(newPin);
            }

            toast.success(isChangingPin ? 'PIN changed successfully' : 'PIN set successfully');
            onSuccess();
            handleClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to set PIN');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setShowOldPin(false);
        setShowNewPin(false);
        setShowConfirmPin(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {isChangingPin ? 'Change Wallet PIN' : 'Set Wallet PIN'}
                    </DialogTitle>
                    <DialogDescription>
                        {isChangingPin
                            ? 'Enter your current PIN and choose a new 4-6 digit PIN'
                            : 'Choose a secure 4-6 digit PIN to protect your wallet'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {currentPinRequired && (
                        <div className="space-y-2">
                            <Label htmlFor="oldPin">Current PIN</Label>
                            <div className="relative">
                                <Input
                                    id="oldPin"
                                    type={showOldPin ? 'text' : 'password'}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={oldPin}
                                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter current PIN"
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPin(!showOldPin)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showOldPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="newPin">New PIN</Label>
                        <div className="relative">
                            <Input
                                id="newPin"
                                type={showNewPin ? 'text' : 'password'}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 4-6 digit PIN"
                                className="pr-10"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPin(!showNewPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {newPin && (
                            <p className="text-xs text-muted-foreground">
                                {newPin.length < 4 ? `${4 - newPin.length} more digit${4 - newPin.length !== 1 ? 's' : ''} required` : '✓ Valid length'}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPin">Confirm PIN</Label>
                        <div className="relative">
                            <Input
                                id="confirmPin"
                                type={showConfirmPin ? 'text' : 'password'}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Re-enter PIN"
                                className="pr-10"
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPin(!showConfirmPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPin && (
                            <p className={`text-xs ${newPin === confirmPin ? 'text-green-600' : 'text-red-600'}`}>
                                {newPin === confirmPin ? '✓ PINs match' : '✗ PINs do not match'}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting...
                                </>
                            ) : (
                                isChangingPin ? 'Change PIN' : 'Set PIN'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
