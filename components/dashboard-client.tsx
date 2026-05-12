'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Receipt,
  PiggyBank,
  ArrowRight,
  MoreHorizontal,
  Sparkles,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { TransferDialog } from '@/components/transfer-dialog';
import { ReceiptScannerDialog } from '@/components/receipt-scanner-dialog';
import { AIChatDialog } from '@/components/ai-chat-dialog';
import { BottomNav } from '@/components/bottom-nav';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const WeeklyExpenseChart = dynamic(() => import('@/components/charts/weekly-expense-chart'), {
  ssr: false,
  loading: () => <div className="h-[80px] w-full bg-white/5 animate-pulse rounded" />
});

interface DashboardClientProps {
  initialData: {
    wallets: any[];
    transactions: any[];
    weeklySpending: any[];
  };
  quickInsight?: string;
  user: {
    id: string;
    full_name: string;
  };
}

export function DashboardClient({ initialData, quickInsight, user }: DashboardClientProps) {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [greeting, setGreeting] = useState('Morning');
  const router = useRouter();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 17) setGreeting('Afternoon');
    else setGreeting('Evening');
  }, []);

  const totalBalance = initialData.wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <>
      <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1
            className="text-4xl sm:text-[42px] tracking-tight"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            <span className="font-semibold text-foreground">{greeting}</span> <span className="text-muted-foreground">{user.full_name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            here's your financial overview for this week.
          </p>
        </div>
        
        <div className="flex items-center gap-3 md:flex hidden">
           <Button 
             onClick={() => setIsChatDialogOpen(true)}
             variant="outline"
             className="bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-xs gap-2 h-10 px-5 rounded-full transition-all text-emerald-500"
           >
             <Sparkles className="w-4 h-4" /> Chat AI
           </Button>
           <Button 
             onClick={() => setIsScanDialogOpen(true)}
             variant="outline"
             className="bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2 h-10 px-5 rounded-full transition-all"
           >
             <Camera className="w-4 h-4" /> Scan Struk
           </Button>
           <Button 
             onClick={() => setIsAddDialogOpen(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10 px-5 rounded-full transition-all"
           >
             <Plus className="w-4 h-4" /> Add Transaction
           </Button>
        </div>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border/50 shadow-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PiggyBank className="w-12 h-12" />
          </div>
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-2">Total Balance</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground mb-1 break-all" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Rp {totalBalance.toLocaleString('id-ID')}
            </h2>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-normal">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
              </Badge>
              <span className="text-[10px] text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none overflow-hidden relative">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground mb-4">Weekly Expenses</p>
            <WeeklyExpenseChart data={initialData.weeklySpending} />
            <p className="text-lg font-medium text-rose-500 mt-2">
              Rp {Math.max(...initialData.weeklySpending.map(d => d.amount), 0).toLocaleString('id-ID')} <span className="text-xs text-muted-foreground font-normal">peak</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none overflow-hidden relative">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground mb-4">Quick Navigation</p>
            <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar snap-x">
              {initialData.wallets.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => router.push(`/dashboard/wallets/${w.id}`)}
                  className="flex flex-col items-start p-4 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all text-left min-w-[140px] md:min-w-0 snap-center bg-card"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <WalletIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase truncate w-full mb-1 font-semibold tracking-wider">{w.name}</span>
                  <span className="text-sm font-bold">Rp {w.balance.toLocaleString('id-ID')}</span>
                </button>
              ))}
              <button 
                onClick={() => router.push('/dashboard/wallets')}
                className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-border/50 hover:border-border transition-all text-[10px] text-muted-foreground min-w-[140px] md:min-w-0 snap-center"
              >
                View all wallets
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" /> Recent Transactions
            </h3>
            <Button onClick={() => router.push('/dashboard/transactions')} variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">View all</Button>
          </div>
          
          <div className="space-y-[1px] bg-border/10 rounded-lg overflow-hidden border border-border/50">
            {initialData.transactions.length > 0 ? initialData.transactions.map((t) => (
              <div key={t.id} className="bg-card p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.type === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.description || 'Untitled Transaction'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      {t.category?.name || 'Uncategorized'} • {format(new Date(t.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    t.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </p>
                  <button
                    aria-label={`More options for ${t.description || 'transaction'}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="bg-card p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No transactions found</p>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm" className="mt-4 border-border/20 text-xs h-8">Add your first transaction</Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* AI Insights */}
          <Card className="bg-card border-border/50 shadow-none border-l-emerald-500/50 border-l-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500/80">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{quickInsight || "Menganalisis pola transaksi Anda..."}"
              </p>
              <div className="mt-6 flex justify-between items-center">
                <button className="text-[10px] text-muted-foreground hover:text-foreground">View budget plan</button>
                <button className="text-[10px] text-muted-foreground hover:text-foreground">Dismiss</button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-semibold opacity-50">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsTransferDialogOpen(true)}
                className="bg-card border-border/50 text-xs h-20 flex-col gap-2 hover:bg-muted/50 transition-all"
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Transfer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.info('Savings feature coming soon!')}
                className="bg-card border-border/50 text-xs h-20 flex-col gap-2 hover:bg-muted/50 transition-all"
              >
                <PiggyBank className="w-4 h-4 text-muted-foreground" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.info('Investment tracking coming soon!')}
                className="bg-card border-border/50 text-xs h-20 flex-col gap-2 hover:bg-muted/50 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Invest
              </Button>
              <Button 
                variant="outline" 
                onClick={() => toast.info('Reminders feature coming soon!')}
                className="bg-card border-border/50 text-xs h-20 flex-col gap-2 hover:bg-muted/50 transition-all"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                Reminders
              </Button>
            </div>
          </div>
        </div>

      </div>

      <TransferDialog 
        open={isTransferDialogOpen} 
        onOpenChange={setIsTransferDialogOpen}
        onSuccess={() => router.refresh()}
      />

      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => router.refresh()} 
      />

      <AIChatDialog 
        open={isChatDialogOpen}
        onOpenChange={setIsChatDialogOpen}
        onSuccess={() => router.refresh()}
      />

      <ReceiptScannerDialog 
        open={isScanDialogOpen}
        onOpenChange={setIsScanDialogOpen}
        onSuccess={() => router.refresh()}
      />

    </div>
  </>
  );
}
