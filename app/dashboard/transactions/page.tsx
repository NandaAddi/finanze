'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import {
  Plus, Trash2, MoreVertical,
  Loader2, Filter, Search, ArrowUpRight, ArrowDownLeft, Calendar,
  Receipt, Wallet as WalletIcon, ChevronDown
} from 'lucide-react';
import { getTransactions, deleteTransactionAction } from '@/app/actions/finance';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  wallet_name: string;
  wallet_id: string;
  category_name: string;
  category_id: string;
  created_at: string;
}

export default function TransactionsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id, filterType]);

  const loadTransactions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getTransactions(user.id, filterType);

      setTransactions(data?.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type as any,
        description: t.description || '',
        category_name: (t.category as any)?.name || 'Uncategorized',
        category_id: t.category_id,
        wallet_name: (t.wallet as any)?.name || 'Unknown Wallet',
        wallet_id: t.wallet_id,
        created_at: t.created_at.toISOString()
      })) || []);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    try {
      const result = await deleteTransactionAction(id, user.id);
      if (!result.success) throw new Error(result.error);
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsAddDialogOpen(true);
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-24">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-[42px] tracking-tight" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            <span className="font-semibold text-foreground">Transactions</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            A complete history of your income and expenses.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="h-10 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 transition-all hidden md:flex"
        >
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8 h-10 bg-card border-border/50 text-sm focus-visible:ring-0 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-card border border-border/50 rounded-xl p-1 flex-1 sm:flex-none">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 h-8 px-4 text-[10px] md:text-[11px] rounded-lg transition-all ${filterType === 'ALL' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setFilterType('ALL')}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 h-8 px-4 text-[10px] md:text-[11px] rounded-lg transition-all ${filterType === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'}`}
              onClick={() => setFilterType('INCOME')}
            >
              Income
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 h-8 px-4 text-[10px] md:text-[11px] rounded-lg transition-all ${filterType === 'EXPENSE' ? 'bg-rose-500/10 text-rose-500' : 'text-muted-foreground'}`}
              onClick={() => setFilterType('EXPENSE')}
            >
              Expense
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 border border-border/20 rounded-xl md:hidden">
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* ── List ── */}
      <div 
        className="space-y-[1px] bg-border/20 rounded-xl overflow-hidden border border-border/50"
        style={{ contentVisibility: 'auto' }}
      >
        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
          <div key={t.id} className="bg-card p-4 md:p-5 flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${
                t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {t.type === 'INCOME' ? <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" /> : <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate max-w-[120px] md:max-w-none">{t.description || 'Untitled'}</p>
                <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 md:gap-2">
                  <Badge variant="outline" className="text-[8px] md:text-[9px] h-3.5 md:h-4 font-normal bg-muted border-border/50 uppercase tracking-tighter px-1 md:px-2">{t.category_name}</Badge>
                  <span className="flex items-center gap-1 hidden md:flex"><WalletIcon className="w-2.5 h-2.5" /> {t.wallet_name}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="truncate">{format(new Date(t.created_at), 'MMM dd')} <span className="hidden md:inline">, {format(new Date(t.created_at), 'HH:mm')}</span></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <div className="text-right">
                <p className={`text-xs md:text-base font-bold tracking-tight ${
                  t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 md:h-8 md:w-8 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5 md:w-4 md:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border/50">
                  <DropdownMenuItem 
                    className="text-xs cursor-pointer"
                    onClick={() => handleEdit(t)}
                  >
                    Edit Transaction
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <DropdownMenuItem 
                    className="text-xs text-rose-500 focus:bg-rose-500/10 cursor-pointer"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )) : (
          <div className="bg-card p-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-foreground font-medium mb-2">No transactions found</h3>
            <p className="text-sm text-muted-foreground mb-8">Try adjusting your filters or search query.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline" 
              className="border-border/30 h-9 rounded-full text-xs"
            >
              Add First Transaction
            </Button>
          </div>
        )}
      </div>

      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setSelectedTransaction(null);
        }}
        onSuccess={loadTransactions}
        transactionToEdit={selectedTransaction}
      />
    </div>
  );
}
