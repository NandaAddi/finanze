"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  User,
  Search,
  Receipt,
  Plus,
  Loader2,
  Zap,
  Wallet as WalletIcon,
  TrendingUp,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { getFinancialOverview, searchFinancials } from "@/app/actions/finance"
import { useUser } from "@/components/user-provider"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<{
    wallets: any[]
    transactions: any[]
  }>({
    wallets: [],
    transactions: [],
  })

  const { user } = useUser()
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  const fetchResults = React.useCallback(async (q: string) => {
    if (!q.trim() || !user?.id) {
      setResults({ wallets: [], transactions: [] })
      return
    }

    setLoading(true)
    try {
      const { wallets: walletData, transactions: transData } = await searchFinancials(q, user.id);

      setResults({
        wallets: walletData as any || [],
        transactions: transData as any || [],
      })
    } catch (err) {
      console.error("Search failed:", err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, fetchResults])

  const onSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="relative w-full max-w-xl group cursor-pointer"
      >
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="w-full bg-transparent border-none pl-7 py-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-between">
          <span>Search wallets or transactions...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="p-2 border-b border-white/5">
          <CommandInput 
            placeholder="Search wallets, transactions, or amounts..." 
            value={query}
            onValueChange={setQuery}
            className="border-none focus:ring-0 text-base py-4"
          />
        </div>
        <CommandList className="max-h-[450px] scrollbar-hide">
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs uppercase tracking-widest">Scanning ledger...</span>
              </div>
            ) : (
              "No financial records found."
            )}
          </CommandEmpty>

          {results.wallets.length > 0 && (
            <CommandGroup heading="Wallets" className="px-2 py-3">
              {results.wallets.map((w) => (
                <CommandItem key={w.id} onSelect={() => onSelect(`/dashboard/wallets`)} className="rounded-lg gap-3 py-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500"><WalletIcon className="h-4 w-4" /></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{w.name}</span>
                    <span className="text-[10px] text-muted-foreground">Balance: Rp {w.balance.toLocaleString('id-ID')}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.transactions.length > 0 && (
            <CommandGroup heading="Transactions" className="px-2 py-3">
              {results.transactions.map((t) => (
                <CommandItem key={t.id} onSelect={() => onSelect(`/dashboard/transactions`)} className="rounded-lg gap-3 py-3">
                  <div className={`p-1.5 rounded-md ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{t.description || 'Untitled Transaction'}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator className="bg-white/5" />
          
          <CommandGroup heading="Navigation" className="px-2 py-3">
            <CommandItem onSelect={() => onSelect("/dashboard")} className="rounded-lg gap-3 py-3">
              <div className="p-1.5 bg-white/5 rounded-md"><Zap className="h-4 w-4 text-amber-400/60" /></div>
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/dashboard/analytics")} className="rounded-lg gap-3 py-3">
              <div className="p-1.5 bg-white/5 rounded-md"><TrendingUp className="h-4 w-4 text-blue-400/60" /></div>
              <span>View Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => onSelect("/dashboard/settings")} className="rounded-lg gap-3 py-3">
              <div className="p-1.5 bg-white/5 rounded-md"><Settings className="h-4 w-4 text-muted-foreground/60" /></div>
              <span>System Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Quick Actions" className="px-2 py-3">
            <CommandItem onSelect={() => onSelect("/dashboard/wallets/new")} className="rounded-lg gap-3 py-3">
              <Plus className="h-4 w-4" />
              <span>Create New Wallet</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest px-4">
           <div className="flex gap-3">
              <span><span className="bg-white/5 px-1 rounded mr-1">↵</span> select</span>
              <span><span className="bg-white/5 px-1 rounded mr-1">↑↓</span> navigate</span>
           </div>
           <span>Finance Manager v1.0</span>
        </div>
      </CommandDialog>
    </>
  )
}
