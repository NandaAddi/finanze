'use client';

import React from 'react';
import { TrendingUp, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/components/user-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useMounted } from '@/hooks/use-mounted';

export function TopNav() {
  const { user } = useUser();
  const mounted = useMounted();

  return (
    <div className="fixed top-0 left-0 right-0 z-[50] block md:hidden w-full">
      <div className="h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.03] flex items-center justify-between px-6">
        {/* Logo & Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          {mounted ? (
            <Image 
              src="/logo-dark.png" 
              alt="Finanze Logo" 
              width={32} 
              height={32} 
              className="rounded-xl shadow-lg shadow-emerald-500/5"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
          )}
          <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-lora), serif' }}>
            Finanze
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 active:scale-90 transition-all">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050505]" />
          </button>
          
          <Link href="/dashboard/settings">
            <Avatar className="w-10 h-10 border border-white/10 shadow-xl active:scale-90 transition-all">
              {mounted && <AvatarImage src={user?.avatar_url} />}
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                {mounted ? (user?.full_name?.[0]?.toUpperCase() || 'U') : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </div>
  );
}
