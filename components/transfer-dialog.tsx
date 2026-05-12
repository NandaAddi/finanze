'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { getWallets, transferFunds } from '@/app/actions/finance';
import { Loader2, ArrowRightLeft } from 'lucide-react';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransferDialog({ open, onOpenChange, onSuccess }: TransferDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');

  useEffect(() => {
    if (open && user?.id) {
      fetchWallets();
    }
  }, [open, user?.id]);

  const fetchWallets = async () => {
    if (!user?.id) return;
    try {
      const data = await getWallets(user.id);
      setWallets(data || []);
      if (data && data.length > 0) {
        setFromWalletId(data[0].id);
        if (data.length > 1) setToWalletId(data[1].id);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !fromWalletId || !toWalletId || !user?.id) {
      toast.error('Please fill all required fields');
      return;
    }

    if (fromWalletId === toWalletId) {
      toast.error('Cannot transfer to the same wallet');
      return;
    }

    setLoading(true);
    try {
      const result = await transferFunds({
        fromWalletId,
        toWalletId,
        amount: parseFloat(amount),
        description,
        userId: user.id,
      });

      if (!result.success) throw new Error(result.error);

      toast.success('Funds transferred successfully');
      onSuccess?.();
      onOpenChange(false);
      setAmount('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            Transfer Funds
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent border-border/20 focus:border-primary/50 text-xl font-medium h-12"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">From Wallet</Label>
                <Select value={fromWalletId} onValueChange={setFromWalletId}>
                  <SelectTrigger className="bg-transparent border-border/50 h-10">
                    <SelectValue placeholder="Source wallet" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <ArrowRightLeft className="w-3 h-3 text-muted-foreground rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">To Wallet</Label>
                <Select value={toWalletId} onValueChange={setToWalletId}>
                  <SelectTrigger className="bg-transparent border-border/50 h-10">
                    <SelectValue placeholder="Destination wallet" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">Note (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this transfer for?"
                className="bg-transparent border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
