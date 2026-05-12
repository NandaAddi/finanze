'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
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
import { MessageSquare, Send, Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { parseAndCreateTransactions } from '@/app/actions/ai-chat';
import { getWallets } from '@/app/actions/finance';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AIChatDialog({ open, onOpenChange, onSuccess }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', content: string, data?: any}[]>([]);

  const fetchWallets = async () => {
    if (!user?.id) return;
    const data = await getWallets(user.id);
    setWallets(data);
    if (data.length > 0 && !selectedWalletId) setSelectedWalletId(data[0].id);
  };

  React.useEffect(() => {
    let isMounted = true;

    if (open && user?.id) {
      (async () => {
        try {
          const data = await getWallets(user.id!);
          if (isMounted) {
            setWallets(data);
            if (data.length > 0 && !selectedWalletId) setSelectedWalletId(data[0].id);
          }
        } catch (err) {
          console.error('Failed to fetch wallets:', err);
        }
      })();
    }

    return () => { isMounted = false; };
  }, [open, user?.id]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id || !selectedWalletId) return;

    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await parseAndCreateTransactions(userMsg, selectedWalletId, user.id);
      
      if (result.success) {
        setHistory(prev => [...prev, { 
          role: 'ai', 
          content: `Berhasil menambahkan ${result.count} transaksi!`,
          data: result.data
        }]);
        toast.success(`Berhasil menambahkan ${result.count} transaksi`);
        onSuccess();
      } else {
        throw new Error(result.error || 'Gagal memproses permintaan');
      }
    } catch (error: any) {
      setHistory(prev => [...prev, { role: 'ai', content: `Maaf, terjadi kesalahan: ${error.message}` }]);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-[600px] max-w-none sm:rounded-2xl rounded-none bg-card border-border/50 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 bg-muted/30 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Finanze AI Chat
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tulis transaksi Anda secara natural. Contoh: "makan bakso 15rb"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-grid-slate-200/50 dark:bg-grid-white/[0.02]">
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Belum ada percakapan</p>
                <p className="text-xs">Coba ketik: "gajian 5 juta"</p>
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[85%] space-y-2 animate-in fade-in slide-in-from-bottom-2",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm shadow-lg",
                msg.role === 'user' 
                  ? "bg-emerald-600 text-white rounded-tr-none" 
                  : "bg-muted border border-border/50 rounded-tl-none"
              )}>
                {msg.content}
              </div>
              
              {msg.data && (
                <div className="w-full space-y-2 mt-2">
                  {msg.data.map((item: any, idx: number) => (
                    <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-[11px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-emerald-400">{item.description}</span>
                        <span className="text-muted-foreground">{item.categoryName}</span>
                      </div>
                      <span className="font-bold text-emerald-500">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 mr-auto bg-muted border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-xs text-muted-foreground">Sedang berpikir...</span>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t border-border/50 space-y-4">
          <div className="flex flex-col gap-2">
             <Label className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">Simpan ke Dompet</Label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger className="h-9 bg-muted/50 border-border/50 text-xs">
                  <SelectValue placeholder="Pilih dompet..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  {wallets.map(w => (
                    <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik transaksi di sini..."
              className="pr-12 h-12 bg-muted/50 border-border/50 rounded-xl focus-visible:ring-emerald-500/50"
              disabled={loading}
            />
            <Button 
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
