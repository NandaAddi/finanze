'use client';

import React, { useState, useRef } from 'react';
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
import { Camera, Upload, Loader2, Receipt, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeReceipt } from '@/app/actions/receipt';
import { getFinancialOverview, createTransaction, getCategories } from '@/app/actions/finance';
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import Image from 'next/image';

export function ReceiptScannerDialog({ open, onOpenChange, onSuccess }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  
  // Review Data
  const [reviewTransactions, setReviewTransactions] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOptions = async () => {
    if (!user?.id) return;
    const [overview, categoryData] = await Promise.all([
      getFinancialOverview(user.id),
      getCategories(user.id)
    ]);
    setWallets(overview.wallets as any[]);
    if (overview.wallets.length > 0) setSelectedWalletId((overview.wallets[0] as any).id);
    if (!categoryData || categoryData.length === 0) {
      toast.error('Tidak ada kategori. Tambahkan kategori terlebih dahulu di pengaturan.');
      return;
    }
    setCategories(categoryData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar melebihi ${MAX_SIZE_MB}MB. Coba kompres gambar terlebih dahulu.`);
      e.target.value = ''; // reset input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      processImage(base64String.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64: string) => {
    setStep('analyzing');
    setLoading(true);
    try {
      await fetchOptions();
      const result = await analyzeReceipt(base64);
      if (result.success && result.data) {
        setReviewTransactions(result.data.transactions);
        setStep('review');
      } else {
        throw new Error(result.error || 'Failed to analyze receipt');
      }
    } catch (error: any) {
      toast.error(error.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!user?.id || !selectedWalletId) return;
    if (categories.length === 0) {
      toast.error('Tidak ada kategori tersedia. Buat kategori terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        reviewTransactions.map((t) => {
          const cat = categories.find((c) => c.name === t.categoryName) || categories[0];
          return createTransaction({
            amount: t.amount,
            type: t.type,
            description: t.description,
            wallet_id: selectedWalletId,
            category_id: cat?.id || categories[0]?.id,
            userId: user!.id,
          });
        })
      );

      const saved = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed > 0 && saved === 0) {
        toast.error(`Gagal menyimpan semua ${failed} transaksi. Periksa koneksi Anda.`);
      } else if (failed > 0) {
        toast.warning(`${saved} transaksi tersimpan, ${failed} gagal disimpan.`);
        onSuccess();
        onOpenChange(false);
        resetScanner();
      } else {
        toast.success(`Semua ${saved} transaksi berhasil disimpan!`);
        onSuccess();
        onOpenChange(false);
        resetScanner();
      }
    } catch (error: any) {
      toast.error('Terjadi kesalahan tak terduga: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setStep('upload');
    setImagePreview(null);
    setReviewTransactions([]);
  };

  const addTransaction = () => {
    setReviewTransactions([...reviewTransactions, { amount: 0, description: '', categoryName: 'Others', type: 'EXPENSE' }]);
  };

  const removeTransaction = (index: number) => {
    setReviewTransactions(reviewTransactions.filter((_, i) => i !== index));
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    const updated = [...reviewTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setReviewTransactions(updated);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if(!o) resetScanner(); }}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-auto max-w-none sm:rounded-2xl rounded-none bg-card border-border/50 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            AI Receipt Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Upload Struk Belanja</p>
                  <p className="text-xs text-muted-foreground mt-1">Ambil foto atau pilih file gambar</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                  capture="environment"
                />
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  AI akan mendeteksi nominal, kategori, dan memecah item secara otomatis. Anda bisa meninjau hasilnya sebelum disimpan.
                </p>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Receipt className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-lg">Menganalisis Struk...</p>
                <p className="text-sm text-muted-foreground mt-1">Alibaba AI sedang membaca rincian belanja Anda</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Detail Transaksi</Label>
                  <Button variant="ghost" size="sm" onClick={addTransaction} className="h-7 text-[10px] gap-1">
                    <Plus className="w-3 h-3" /> Tambah Item
                  </Button>
                </div>

                {reviewTransactions.map((t, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted border border-border/50 space-y-3 relative group">
                    <button 
                      onClick={() => removeTransaction(i)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Deskripsi</Label>
                        <Input 
                          value={t.description} 
                          onChange={(e) => updateTransaction(i, 'description', e.target.value)}
                          className="h-8 text-xs bg-transparent border-border/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Nominal (Rp)</Label>
                        <Input 
                          type="number"
                          value={t.amount} 
                          onChange={(e) => updateTransaction(i, 'amount', parseFloat(e.target.value))}
                          className="h-8 text-xs bg-transparent border-border/50 font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase">Kategori</Label>
                      <Select 
                        value={t.categoryName} 
                        onValueChange={(val) => updateTransaction(i, 'categoryName', val)}
                      >
                        <SelectTrigger className="h-8 text-xs bg-transparent border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border/50">
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.name} className="text-xs">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/10 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pilih Dompet Pembayaran</Label>
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border/50">
                      <SelectValue placeholder="Pilih dompet..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border/50">
                      {wallets.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name} (Rp {w.balance.toLocaleString('id-ID')})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border/50">
          {step === 'review' ? (
            <div className="flex w-full gap-3">
              <Button 
                variant="outline" 
                onClick={resetScanner} 
                className="flex-1 rounded-full border-border/20 h-11 text-xs"
                disabled={loading}
              >
                Coba Ulang
              </Button>
              <Button 
                onClick={handleSaveAll} 
                className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-11 font-semibold gap-2 transition-all"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Simpan Semua Transaksi
              </Button>
            </div>
          ) : (
             <Button 
               variant="ghost" 
               onClick={() => onOpenChange(false)} 
               className="w-full text-muted-foreground text-xs"
             >
               Batalkan
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
