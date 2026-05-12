'use client';

import React, { useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { Home, Wallet, Plus, Receipt, Sparkles, MessageSquare, Camera, X, PenLine, BarChart3, Sun, Moon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface BottomNavProps {
  onPlusClick: () => void;
  onChatClick: () => void;
  onScanClick: () => void;
}

export function BottomNav({ onPlusClick, onChatClick, onScanClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Receipt, label: 'History', href: '/dashboard/transactions' },
    { icon: Plus, label: 'Add', isPlus: true },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Wallet, label: 'Wallets', href: '/dashboard/wallets' },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Chat AI', onClick: onChatClick, color: 'bg-muted/80' },
    { icon: Camera, label: 'Scan', onClick: onScanClick, color: 'bg-muted/80' },
    { 
      icon: !mounted ? Sparkles : (theme === 'dark' ? Sun : Moon), 
      label: 'Theme', 
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'), 
      color: 'bg-muted/80' 
    },
    { icon: Sparkles, label: 'AI Advisor', onClick: () => router.push('/dashboard/ai-advisor'), color: 'bg-muted/80' },
    { icon: PenLine, label: 'Manual', onClick: onPlusClick, color: 'bg-muted/80' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] block md:hidden w-full">
      {/* Backdrop for Quick Actions */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Action Buttons (The Hub) */}
      <div className={cn(
        "absolute bottom-28 left-0 right-0 flex justify-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none px-4",
        isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-75"
      )}>
        {quickActions.map((action, i) => (
          <div 
            key={i} 
            className="flex flex-col items-center gap-3 pointer-events-auto flex-1 max-w-[70px]"
            style={{ 
              transitionDelay: isOpen ? `${i * 60}ms` : '0ms',
            }}
          >
            <button
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-card/90 backdrop-blur-2xl border border-border/50 text-foreground shadow-2xl active:scale-90 transition-all hover:border-emerald-500/30 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
              <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </button>
            <span className="text-[8px] font-bold text-muted-foreground/80 uppercase tracking-widest text-center leading-tight">
              {action.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-3xl border-t border-border/50 flex items-center justify-around px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {navItems.map((item, i) => {
          if (item.isPlus) {
            return (
              <div key={i} className="relative -mt-10">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    "w-16 h-16 rounded-[22px] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(16,185,129,0.25)] active:scale-95 transition-all duration-500 relative overflow-hidden group",
                    isOpen 
                      ? "bg-card border border-border/50 rotate-[135deg]" 
                      : "bg-emerald-500 rotate-0"
                  )}
                >
                  <Plus className={cn(
                    "w-8 h-8 transition-transform duration-500",
                    isOpen ? "text-rose-500" : "text-white"
                  )} />
                </button>
              </div>
            );
          }

          const isActive = pathname === item.href && !isOpen;
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all px-4 py-3 rounded-2xl min-w-[70px] active:bg-white/5",
                isActive ? "text-emerald-500" : "text-muted-foreground opacity-40"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[9px] font-semibold tracking-tight transition-all", isActive ? "opacity-100" : "opacity-0")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
