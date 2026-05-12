'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { Loader2, Wallet as WalletIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createWallet, seedDefaultCategories, getCategories } from '@/app/actions/finance';

export default function NewWalletPage() {
  const { user } = useUser();
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [currency, setCurrency] = useState('IDR');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    setCreating(true);

    try {
      const result = await createWallet({
        name: walletName,
        description: walletDescription || undefined,
        balance: parseFloat(initialBalance) || 0,
        currency: currency,
        userId: user!.id,
      });

      if (!result.success) throw new Error(result.error);

      // Seed default categories if this is the first wallet
      const existingCategories = await getCategories(user!.id);
      if (!existingCategories || existingCategories.length === 0) {
        await seedDefaultCategories(user!.id, result.data.id);
      }
      
      toast.success('Wallet created successfully!');
      router.push(`/dashboard/wallets`);
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-12">
      <Link 
        href="/dashboard/wallets" 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Wallets
      </Link>

      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-lora), serif' }}>
          Create New Wallet
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Add a bank account, e-wallet, or cash storage.
        </p>
      </div>

      <Card className="bg-card border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <WalletIcon className="w-5 h-5 text-emerald-500" /> Wallet Details
          </CardTitle>
          <CardDescription>
            Enter the basic information for your new financial account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-widest">Wallet Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Personal Bank, Cash, Savings"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="bg-transparent border-border/50 h-12 text-base focus:border-primary/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="balance" className="text-xs text-muted-foreground uppercase tracking-widest">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="bg-transparent border-border/50 h-12 text-base focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs text-muted-foreground uppercase tracking-widest">Currency</Label>
                <Input
                  id="currency"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent border-border/50 h-12 text-base focus:border-primary/50"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Notes about this wallet"
                value={walletDescription}
                onChange={(e) => setWalletDescription(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-primary/50 min-h-[80px] rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-6">
              <Button 
                type="submit" 
                disabled={creating} 
                className="w-full md:flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20 order-1 md:order-2"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Wallet'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full md:w-auto h-12 rounded-2xl px-8 text-muted-foreground hover:text-foreground order-2 md:order-1"
                asChild
              >
                <Link href="/dashboard/wallets">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}