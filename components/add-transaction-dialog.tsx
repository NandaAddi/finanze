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
import { getCategories, createTransaction, getFinancialOverview, seedDefaultCategories, updateTransaction } from '@/app/actions/finance';
import { Loader2, Plus, Receipt } from 'lucide-react';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  transactionToEdit?: any;
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess, transactionToEdit }: AddTransactionDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const isFetchingRef = React.useRef(false);

  useEffect(() => {
    if (open && user?.id) {
      if (!isFetchingRef.current) {
        isFetchingRef.current = true;
        fetchOptions().finally(() => { isFetchingRef.current = false; });
      }
      if (transactionToEdit) {
        setAmount(transactionToEdit.amount.toString());
        setDescription(transactionToEdit.description || '');
        setType(transactionToEdit.type);
        setWalletId(transactionToEdit.wallet_id);
        setCategoryId(transactionToEdit.category_id);
      } else {
        resetForm();
      }
    }
  }, [open, user?.id, transactionToEdit]);

  const fetchOptions = async () => {
    if (!user?.id) return;
    try {
      const [{ wallets: walletData }, categoryData] = await Promise.all([
        getFinancialOverview(user.id),
        getCategories(user.id)
      ]);
      
      setWallets(walletData as any || []);
      if (walletData && walletData.length > 0) setWalletId(walletData[0].id);

      // If no categories, seed them
      if ((!categoryData || categoryData.length === 0) && walletData && walletData.length > 0) {
        const seeded = await seedDefaultCategories(user.id, walletData[0].id);
        setCategories(seeded || []);
        if (seeded && seeded.length > 0) setCategoryId(seeded[0].id);
      } else {
        setCategories(categoryData || []);
        if (categoryData && categoryData.length > 0) setCategoryId(categoryData[0].id);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Masukkan nominal yang valid dan lebih dari 0');
      return;
    }
    if (!walletId || !categoryId || !user?.id) {
      toast.error('Lengkapi semua kolom yang diperlukan');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (transactionToEdit) {
        result = await updateTransaction({
          id: transactionToEdit.id,
          amount: parsedAmount,
          type,
          description,
          wallet_id: walletId,
          category_id: categoryId,
          userId: user.id,
        });
      } else {
        result = await createTransaction({
          amount: parsedAmount,
          type,
          description,
          wallet_id: walletId,
          category_id: categoryId,
          userId: user.id,
        });
      }

      if (!result.success) throw new Error(result.error);

      toast.success(transactionToEdit ? 'Transaction updated' : 'Transaction added');
      onSuccess?.();
      onOpenChange(false);
      if (!transactionToEdit) resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setType('EXPENSE');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-full h-[100dvh] sm:h-auto max-w-none sm:rounded-2xl rounded-none bg-card border-border/50 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex bg-muted p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                  type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                  type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Income
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount (Rp)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this for?"
                className="bg-transparent border-border/50 focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Wallet</Label>
                <Select value={walletId} onValueChange={setWalletId}>
                  <SelectTrigger className="bg-transparent border-border/50 h-10">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-transparent border-border/50 h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50">
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className={`w-full h-11 rounded-full font-semibold transition-all ${
                type === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> {transactionToEdit ? 'Update Transaction' : 'Save Transaction'}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
