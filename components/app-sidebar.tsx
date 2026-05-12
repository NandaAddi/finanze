"use client"

import * as React from "react"
import {
  WalletIcon,
  LogOutIcon,
  Sun,
  Moon,
  SettingsIcon,
  ReceiptIcon,
  BarChartIcon,
  Home,
  Sparkles
} from "lucide-react"

import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useUser } from '@/components/user-provider'
import { useMounted } from '@/hooks/use-mounted'

interface AppSidebarProps {
  initialUser?: {
    name: string;
    email: string;
    avatar: string;
  };
}

const menuItems = [
  { title: "Dashboard",    url: "/dashboard",           icon: Home },
  { title: "Wallets",      url: "/dashboard/wallets",   icon: WalletIcon },
  { title: "Transactions", url: "/dashboard/transactions",icon: ReceiptIcon },
  { title: "Analytics",    url: "/dashboard/analytics", icon: BarChartIcon },
  { title: "AI Advisor",    url: "/dashboard/ai-advisor", icon: Sparkles },
  { title: "Settings",     url: "/dashboard/settings",  icon: SettingsIcon },
]

export function AppSidebar({ initialUser }: AppSidebarProps) {
  const { signOut: legacySignOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const userData = initialUser || {
    name: 'User',
    email: '',
    avatar: '',
  };

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border/30 shadow-none bg-sidebar">
      {/* ── Header ── */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-transparent">
        <Link href="/dashboard" className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
          {mounted ? (
            <Image
              src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
              width={24}
              height={24}
              alt="Logo"
              className="rounded-sm"
            />
          ) : (
            <div className="w-6 h-6 bg-white/5 animate-pulse rounded-sm" />
          )}
        </Link>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent className="flex flex-col items-center py-4 gap-4">
        {menuItems.map((item) => {
          const isActive = item.url === '/dashboard'
            ? pathname === item.url
            : pathname?.startsWith(item.url) || false;

          return (
            <Link key={item.title} href={item.url} title={item.title}>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="py-4 flex flex-col items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-8 h-8 rounded-full p-0 overflow-hidden hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8">
                {userData.avatar ? (
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                ) : (
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                    {userData.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="right" className="w-48 ml-2 rounded-xl shadow-lg border-border/50">
            <div className="flex flex-col px-2 py-1.5 mb-1">
              <span className="text-sm font-medium truncate">{userData.name}</span>
              <span className="text-xs text-muted-foreground truncate">{userData.email}</span>
            </div>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              className="text-xs gap-2 py-2 cursor-pointer"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {mounted && theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer" onClick={handleSignOut}>
              <LogOutIcon className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
