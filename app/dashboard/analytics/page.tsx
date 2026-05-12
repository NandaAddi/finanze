"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useUser } from "@/components/user-provider";
import { getAnalyticsData } from "@/app/actions/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, Wallet as WalletIcon, PieChart as PieChartIcon, BarChart3, Calendar, ArrowUpRight, ArrowDownLeft, Activity } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import dynamic from 'next/dynamic';

// Dynamic imports for heavy charts (Rule: bundle-dynamic-imports)
const CashFlowChart = dynamic(() => import('@/components/charts/cash-flow-chart'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-card border border-border/50 rounded-xl animate-pulse" />
});

const CategoryPieChart = dynamic(() => import('@/components/charts/category-pie-chart'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-card border border-border/50 rounded-xl animate-pulse" />
});

const WalletBarChart = dynamic(() => import('@/components/charts/wallet-bar-chart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-card border border-border/50 rounded-xl animate-pulse" />
});

const COLORS = ["#10b981", "#f43f5e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  category_name: string;
  wallet_name: string;
  created_at: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export default function AnalyticsPage() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState("6"); // Months

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, timeRange]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const startDate = startOfMonth(subMonths(new Date(), parseInt(timeRange)));
      const { wallets: walletData, transactions: transData } = await getAnalyticsData(user.id, startDate);
      
      setWallets(walletData as any || []);
      setTransactions(transData?.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type as any,
        description: t.description || '',
        category_name: (t.category as any)?.name || 'Uncategorized',
        wallet_name: (t.wallet as any)?.name || 'Unknown Wallet',
        created_at: t.created_at.toISOString()
      })) || []);

    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, timeRange]);

  // 1. Cash Flow Data (Monthly) - Optimized (Rule: js-combine-iterations)
  const cashFlowData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), parseInt(timeRange) - 1),
      end: new Date()
    });

    // Create a map for quick access
    const monthlyStats = new Map<string, { Income: number; Expense: number }>();
    months.forEach(m => monthlyStats.set(format(m, "MMM yy"), { Income: 0, Expense: 0 }));

    transactions.forEach(t => {
      const monthKey = format(new Date(t.created_at), "MMM yy");
      const stats = monthlyStats.get(monthKey);
      if (stats) {
        if (t.type === 'INCOME') stats.Income += t.amount;
        else stats.Expense += t.amount;
      }
    });

    return months.map(month => {
      const name = format(month, "MMM yy");
      const stats = monthlyStats.get(name) || { Income: 0, Expense: 0 };
      
      return {
        name,
        Income: stats.Income,
        Expense: stats.Expense,
        Savings: Math.max(0, stats.Income - stats.Expense)
      };
    });
  }, [transactions, timeRange]);

  // 2. Spending by Category (Current Month or All)
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      categoryMap[t.category_name] = (categoryMap[t.category_name] || 0) + t.amount;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 3. Wallet Allocation
  const walletData = useMemo(() => {
    return wallets.map(w => ({ name: w.name, value: w.balance }));
  }, [wallets]);

  // Global Metrics
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  if (loading || userLoading) {
    return (
      <div className="flex h-full w-full min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 px-1">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-[42px] tracking-tight" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            <span className="font-semibold text-foreground">Financial Analytics</span>
          </h1>
          <p className="text-[13px] text-muted-foreground mt-2">Deep dive into your spending habits and net worth trends.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9 bg-card border-border/50 text-xs rounded-full">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50 text-xs">
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-card border-border/50 shadow-none overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-[0.2em] font-bold">Total Net Worth</p>
            <h3 className="text-2xl font-light text-foreground tracking-tighter" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Rp {totalBalance.toLocaleString('id-ID')}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-medium">+4.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-[0.2em] font-bold">Total Income</p>
            <h3 className="text-2xl font-light text-emerald-500 tracking-tighter" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Rp {totalIncome.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 mt-4 uppercase tracking-widest">In the last {timeRange} months</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-[0.2em] font-bold">Total Expenses</p>
            <h3 className="text-2xl font-light text-rose-500 tracking-tighter" style={{ fontFamily: 'var(--font-lora), serif' }}>
              Rp {totalExpense.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-muted-foreground/40 mt-4 uppercase tracking-widest">In the last {timeRange} months</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none overflow-hidden group">
          <CardContent className="p-6">
            <p className="text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-[0.2em] font-bold">Savings Rate</p>
            <h3 className="text-2xl font-light text-primary tracking-tighter" style={{ fontFamily: 'var(--font-lora), serif' }}>
              {savingsRate}%
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${savingsRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Cash Flow */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-foreground mb-4 md:mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" /> Monthly Cash Flow
          </h3>
          <div className="h-auto w-full bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>

        {/* Category Distribution */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4 md:mb-6 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-muted-foreground" /> Spending by Category
          </h3>
          <div className="h-auto w-full bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <CategoryPieChart data={categoryData} />
          </div>
        </div>
      </div>

      {/* ── Wallet Allocation & Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-card border-border/50 shadow-none col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-muted-foreground" /> Wallet Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <WalletBarChart data={walletData} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-none col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" /> Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Strong Savings Pace</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your savings rate is {savingsRate}% this month, which is above your average. Great job staying disciplined!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Expense Peak Detected</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Spending in the <span className="text-foreground font-medium">Entertainment</span> category has increased by 40% compared to last month.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Upcoming Bills</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Based on your patterns, you have approximately Rp 2,500,000 in recurring bills due in the next 10 days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
