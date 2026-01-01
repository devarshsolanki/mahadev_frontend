import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { walletApi } from '@/api/wallet';

interface VerifyPinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (pin: string) => void;
    title?: string;
    description?: string;
}

export const VerifyPinDialog = ({
    open,
    onOpenChange,
    onSuccess,
    title = 'Verify Wallet PIN',
    description = 'Enter your wallet PIN to continue'
}: VerifyPinDialogProps) => {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!pin) {
            setError('Please enter your PIN');
            return;
        }

        if (pin.length < 4 || pin.length > 6) {
            setError('PIN must be 4-6 digits');
            return;
        }

        setIsVerifying(true);

        try {
            await walletApi.verifyPIN(pin);
            toast.success('PIN verified successfully');
            onSuccess(pin);
            handleClose();
        } catch (error: any) {
            const errorMessage = error.message || 'Invalid PIN';
            setError(errorMessage);
            toast.error(errorMessage);
            setPin(''); // Clear PIN on error
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClose = () => {
        setPin('');
        setShowPin(false);
        setError('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pin">Wallet PIN</Label>
                        <div className="relative">
                            <Input
                                id="pin"
                                type={showPin ? 'text' : 'password'}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value.replace(/\D/g, ''));
                                    setError('');
                                }}
                                placeholder="Enter your PIN"
                                className={`pr-10 ${error ? 'border-red-500' : ''}`}
                                disabled={isVerifying}
                                autoFocus
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isVerifying}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isVerifying || !pin}
                            className="flex-1"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify PIN'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
