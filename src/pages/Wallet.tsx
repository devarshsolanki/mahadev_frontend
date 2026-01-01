import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, Lock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { SetPinDialog } from '@/components/wallet/SetPinDialog';
import { VerifyPinDialog } from '@/components/wallet/VerifyPinDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Wallet = () => {
  const queryClient = useQueryClient();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isSetPinOpen, setIsSetPinOpen] = useState(false);
  const [isVerifyPinOpen, setIsVerifyPinOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [pendingAmount, setPendingAmount] = useState(0);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => walletApi.getTransactions(),
  });

  const addMoneyMutation = useMutation({
    mutationFn: (amount: number) => walletApi.addMoney(amount, 'card'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Money added successfully!');
      setIsAddMoneyOpen(false);
      setAmount('');
      setPendingAmount(0);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add money');
    },
  });

  const handleAddMoneyClick = () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (numAmount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }
    if (numAmount > 50000) {
      toast.error('Maximum amount is ₹50,000');
      return;
    }

    // Check if PIN is set
    if (!walletData?.isPinSet) {
      toast.error('Please set a wallet PIN first');
      setIsAddMoneyOpen(false);
      setIsSetPinOpen(true);
      return;
    }

    // Store amount and open PIN verification
    setPendingAmount(numAmount);
    setIsAddMoneyOpen(false);
    setIsVerifyPinOpen(true);
  };

  const handlePinVerified = () => {
    // Add money after PIN verification
    if (pendingAmount > 0) {
      addMoneyMutation.mutate(pendingAmount);
    }
  };

  const handlePinSetSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  };

  const quickAmounts = [100, 500, 1000, 2000];

  if (walletLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const walletData = wallet?.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Wallet</h1>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsSetPinOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              {walletData?.isPinSet ? 'Change PIN' : 'Set PIN'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Balance */}
        <Card className="md:col-span-2 p-8 gradient-hero text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/80 mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold">₹{walletData?.balance?.toFixed(2) || '0.00'}</h2>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <WalletIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsAddMoneyOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Money
            </Button>

            {!walletData?.isPinSet && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsSetPinOpen(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Lock className="mr-2 h-5 w-5" />
                Set PIN
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions?.data?.length || 0}</p>
            </div>
          </div>

          <div className="space-y-2">
            {walletData?.isPinSet ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Lock className="mr-1 h-3 w-3" />
                PIN Secured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <Lock className="mr-1 h-3 w-3" />
                Set PIN for security
              </Badge>
            )}
          </div>

          {walletData?.totalCredited !== undefined && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Credited</span>
                <span className="font-medium text-green-600">+₹{walletData.totalCredited.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Debited</span>
                <span className="font-medium text-red-600">-₹{walletData.totalDebited.toFixed(2)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Transaction History</h2>

        {transactionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !transactions?.data || transactions.data.length === 0 ? (
          <div className="text-center py-12">
            <WalletIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.data.map((transaction: any) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'credit'
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                      }`}
                  >
                    {transaction.type === 'credit' ? (
                      <ArrowDownRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {transaction.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transaction.category.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: ₹{transaction.balanceAfter.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Enter amount between ₹10 and ₹50,000
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                max="50000"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  onClick={() => setAmount(amt.toString())}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>

            <Button
              className="w-full btn-primary"
              onClick={handleAddMoneyClick}
              disabled={!amount || addMoneyMutation.isPending}
            >
              {addMoneyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set/Change PIN Dialog */}
      <SetPinDialog
        open={isSetPinOpen}
        onOpenChange={setIsSetPinOpen}
        onSuccess={handlePinSetSuccess}
        isChangingPin={walletData?.isPinSet}
        currentPinRequired={walletData?.isPinSet}
      />

      {/* Verify PIN Dialog */}
      <VerifyPinDialog
        open={isVerifyPinOpen}
        onOpenChange={setIsVerifyPinOpen}
        onSuccess={handlePinVerified}
        title="Verify PIN to Add Money"
        description="Enter your wallet PIN to continue adding money"
      />
    </div>
  );
};

export default Wallet;
