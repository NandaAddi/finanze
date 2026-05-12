'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  MoreHorizontal,
  Receipt,
  Loader2,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { getWalletDetails, deleteWallet } from '@/app/actions/finance';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { EditWalletDialog } from '@/components/edit-wallet-dialog';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  category_name: string;
  created_at: string;
}

interface Wallet {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  currency: string;
  created_at: string;
}

export default function WalletDetailPage() {
  const { user } = useUser();
  const { id: walletId } = useParams();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.id && walletId) {
      loadWalletData();
    }
  }, [user?.id, walletId]);

  const loadWalletData = async () => {
    if (!user?.id || !walletId) return;
    setLoading(true);
    try {
      const { wallet: walletData, transactions: transData } = await getWalletDetails(walletId as string, user.id);

      if (!walletData) {
        setWallet(null);
        return;
      }
      
      setWallet(walletData as any);
      setTransactions(transData?.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type as any,
        description: t.description || '',
        category_name: (t.category as any)?.name || 'Uncategorized',
        created_at: t.created_at.toISOString()
      })) || []);

    } catch (error) {
      console.error('Error loading wallet details:', error);
      toast.error('Failed to load wallet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !wallet) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Wallet not found</h2>
        <Button onClick={() => router.push('/dashboard/wallets')}>Back to Wallets</Button>
      </div>
    );
  }
  const handleDelete = async () => {
    if (!user?.id || !walletId) return;
    setLoading(true);
    try {
      const result = await deleteWallet(walletId as string, user.id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Wallet deleted successfully');
      router.push('/dashboard/wallets');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete wallet');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-24">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/50" 
          onClick={() => router.push('/dashboard/wallets')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
             <h1 className="text-2xl md:text-3xl font-semibold tracking-tight truncate max-w-[200px] md:max-w-none" style={{ fontFamily: 'var(--font-lora), serif' }}>
               {wallet.name}
             </h1>
             <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] px-2 py-0 h-5">Active</Badge>
          </div>
          {wallet.description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">{wallet.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
           <Button 
             onClick={() => setIsEditDialogOpen(true)}
             variant="outline" 
             size="icon" 
             className="h-9 w-9 rounded-full bg-muted border-border/50 md:hidden"
           >
             <Edit3 className="h-4 w-4" />
           </Button>
           <Button 
             onClick={() => setIsEditDialogOpen(true)}
             variant="outline" 
             size="sm" 
             className="h-9 px-4 rounded-full bg-muted border-border/50 text-[11px] gap-2 hidden md:flex"
           >
             <Edit3 className="h-3.5 w-3.5" /> Edit
           </Button>
           <AlertDialog>
             <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-rose-500/10 border-rose-500/20 text-rose-500 md:hidden">
                  <Trash2 className="h-4 w-4" />
                </Button>
             </AlertDialogTrigger>
             <AlertDialogTrigger asChild>
               <Button variant="outline" size="sm" className="h-9 px-4 rounded-full bg-rose-500/10 border-rose-500/20 text-rose-500 text-[11px] gap-2 hover:bg-rose-500 hover:text-white transition-all hidden md:flex">
                 <Trash2 className="h-3.5 w-3.5" /> Delete
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent className="bg-card border-border/50">
               <AlertDialogHeader>
                 <AlertDialogTitle className="flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-rose-500" /> Are you absolutely sure?
                 </AlertDialogTitle>
                 <AlertDialogDescription className="text-muted-foreground">
                   This action cannot be undone. This will permanently delete the <strong>{wallet.name}</strong> wallet and all its associated transactions.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel className="bg-transparent border-border/50 rounded-full hover:bg-muted/50">Cancel</AlertDialogCancel>
                 <AlertDialogAction 
                   onClick={handleDelete}
                   className="bg-rose-600 hover:bg-rose-700 text-white rounded-full"
                 >
                   Delete Wallet
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
        </div>
      </div>
      
      {wallet && (
        <EditWalletDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          wallet={wallet}
          onSuccess={loadWalletData}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="md:col-span-1">
          <Card className="bg-card border-border/50 shadow-none overflow-hidden relative group">
            <CardContent className="p-6 md:p-8">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-4 flex items-center gap-2 uppercase tracking-widest font-bold opacity-40">Current Balance</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-lora), serif' }}>
                Rp {wallet.balance.toLocaleString('id-ID')}
              </h2>
              <div className="mt-8 pt-6 border-t border-border/10 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{wallet.currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(wallet.created_at), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" /> Transaction History
            </h3>
          </div>

          <div className="space-y-[1px] bg-border/10 rounded-xl overflow-hidden border border-border/50">
            {transactions.length > 0 ? transactions.map((t) => (
              <div key={t.id} className="bg-card p-4 md:p-5 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">{t.description || 'Untitled'}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-2">
                      <span className="truncate max-w-[80px]">{t.category_name}</span> • {format(new Date(t.created_at), 'MMM dd')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs md:text-sm font-bold ${
                    t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )) : (
              <div className="bg-card p-16 text-center">
                <Receipt className="w-8 h-8 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No transactions found for this wallet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}