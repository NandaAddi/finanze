'use client';

import React, { useState } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { TopNav } from '@/components/top-nav';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { AIChatDialog } from '@/components/ai-chat-dialog';
import { ReceiptScannerDialog } from '@/components/receipt-scanner-dialog';
import { useRouter } from 'next/navigation';

export function GlobalUI() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const router = useRouter();

  const isAnyDialogOpen = isAddDialogOpen || isChatDialogOpen || isScanDialogOpen;

  return (
    <>
      {!isAnyDialogOpen && (
        <>
          <TopNav />
          <BottomNav 
            onPlusClick={() => setIsAddDialogOpen(true)}
            onChatClick={() => setIsChatDialogOpen(true)}
            onScanClick={() => setIsScanDialogOpen(true)}
          />
        </>
      )}
      
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
    </>
  );
}
