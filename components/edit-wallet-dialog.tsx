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
import { useUser } from '@/components/user-provider';
import { toast } from 'sonner';
import { updateWallet } from '@/app/actions/finance';
import { Loader2, WalletIcon, Save } from 'lucide-react';

interface EditWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: {
    id: string;
    name: string;
    description: string | null;
    currency: string;
  };
  onSuccess: () => void;
}

export function EditWalletDialog({ open, onOpenChange, wallet, onSuccess }: EditWalletDialogProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(wallet.name);
  const [description, setDescription] = useState(wallet.description || '');
  const [currency, setCurrency] = useState(wallet.currency);

  useEffect(() => {
    if (open) {
      setName(wallet.name);
      setDescription(wallet.description || '');
      setCurrency(wallet.currency);
    }
  }, [open, wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user?.id) {
      toast.error('Wallet name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await updateWallet({
        id: wallet.id,
        name,
        description,
        currency,
        userId: user.id,
      });

      if (!result.success) throw new Error(result.error);

      toast.success('Wallet updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
            Edit Wallet
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Wallet Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Bank Account"
                className="bg-transparent border-border/50 focus:border-primary/50 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details..."
                className="bg-transparent border-border/50 focus:border-primary/50 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="IDR, USD, etc."
                className="bg-transparent border-border/50 focus:border-primary/50 h-11"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-full font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
