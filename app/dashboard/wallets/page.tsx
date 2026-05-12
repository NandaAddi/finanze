'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { Plus, Wallet as WalletIcon, Calendar, Search, Filter, MoreHorizontal, LayoutGrid, List as ListIcon, Loader2, ArrowUpRight } from 'lucide-react';
import { getWallets, deleteWallet } from '@/app/actions/finance';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Edit3, Trash2 } from 'lucide-react';

interface Wallet {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  balance: number;
  currency: string;
  created_at: string;
  user_id: string;
}

export default function WalletsPage() {
  const { user } = useUser();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      loadWallets();
    }
  }, [user?.id]);

  const loadWallets = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getWallets(user.id);
      setWallets(data as any || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWallet = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete this wallet and all its transactions?')) return;

    try {
      const result = await deleteWallet(id, user.id);
      if (!result.success) throw new Error(result.error);
      toast.success('Wallet deleted');
      loadWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete wallet');
    }
  };

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-4xl sm:text-[42px] tracking-tight"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            <span className="font-semibold text-foreground">Wallets</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your accounts, bank, and digital wallets.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button
            onClick={() => router.push('/dashboard/wallets/new')}
            size="sm"
            className="h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 md:px-5 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline text-xs font-semibold">New Wallet</span>
          </Button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between hidden md:flex">
         <div className="relative w-full sm:max-w-xs">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
           <Input 
             placeholder="Search wallets..." 
             className="pl-8 h-9 bg-card border-border/50 text-[13px] focus-visible:ring-0"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
         </div>
         <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground">
             <Filter className="w-3.5 h-3.5 mr-2" /> Filter
           </Button>
           <div className="h-4 w-[1px] bg-border/30 mx-1" />
           <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-accent/50 text-foreground">
             <LayoutGrid className="w-3.5 h-3.5" />
           </Button>
           <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground">
             <ListIcon className="w-3.5 h-3.5" />
           </Button>
         </div>
       </div>

      {/* ── Wallets Grid ── */}
      {filteredWallets.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <WalletIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-medium text-foreground text-lg mb-2">
            {searchQuery ? 'No matching wallets' : 'No wallets found'}
          </h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
            {searchQuery ? `We couldn't find any wallets matching "${searchQuery}"` : 'Add your bank account, cash, or e-wallet to start tracking.'}
          </p>
          {!searchQuery ? (
            <Button 
              size="sm" 
              className="h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6"
              onClick={() => router.push('/dashboard/wallets/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Wallet
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredWallets.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => router.push(`/dashboard/wallets/${wallet.id}`)}
              className="bg-card p-4 md:p-6 rounded-2xl border border-border/50 flex flex-row md:flex-col justify-between items-center md:items-stretch group cursor-pointer hover:border-border transition-all relative overflow-hidden bg-card"
            >
              <div className="flex items-center gap-4 md:block">
                <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <WalletIcon className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                </div>
                
                <div className="md:mt-6">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground mb-0.5 transition-colors">{wallet.name}</h3>
                  <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 leading-relaxed md:mb-4">
                    {wallet.description || 'No description provided.'}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-foreground tracking-tight md:hidden" style={{ fontFamily: 'var(--font-lora), serif' }}>
                    Rp {wallet.balance.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="hidden md:block">
                 <p className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-lora), serif' }}>
                  Rp {wallet.balance.toLocaleString('id-ID')}
                </p>
              </div>
              
              <div className="hidden md:flex mt-8 pt-4 border-t border-border/10 items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(wallet.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-all flex items-center gap-1">
                  Details <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              {/* Mobile Arrow */}
              <div className="md:hidden text-muted-foreground">
                <ArrowUpRight className="w-4 h-4 opacity-30" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
