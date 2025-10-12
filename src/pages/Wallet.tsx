import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Wallet = () => {
  const queryClient = useQueryClient();
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [amount, setAmount] = useState('');

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
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add money');
    },
  });

  const handleAddMoney = () => {
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
    addMoneyMutation.mutate(numAmount);
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
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

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

          <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Money
              </Button>
            </DialogTrigger>
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
                  onClick={handleAddMoney}
                  disabled={addMoneyMutation.isPending}
                >
                  {addMoneyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Money'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions?.data?.transactions?.length || 0}</p>
            </div>
          </div>
          {walletData?.hasPIN ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              PIN Set
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Set PIN for security
            </Badge>
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
        ) : transactions?.data?.transactions?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-3">
            {transactions?.data?.transactions?.map((transaction: any) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit'
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
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Balance: ₹{transaction.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Wallet;
