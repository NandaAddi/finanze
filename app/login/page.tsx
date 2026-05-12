'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Lock, Mail, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useMounted } from '@/hooks/use-mounted';

const features = [
  { icon: '✦', text: 'Mengatur arus kas pribadi secara presisi' },
  { icon: '✦', text: 'Stabilitas finansial untuk masa depan' },
  { icon: '✦', text: 'Analisis cerdas untuk aset produktif' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const mounted = useMounted();
  const router = useRouter();
  const { theme } = useTheme();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Selamat datang kembali! ✨');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020604] selection:bg-emerald-500/30 overflow-hidden">
      {/* LEFT PANEL — Branding (Desktop) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-[#020604]"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-lighten"
        >
          <source src="/loginteaser.webm" type="video/webm" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#020604] via-transparent to-[#020604]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />

        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image 
                src="/logo-dark.png" 
                alt="Finanze Logo" 
                width={40} 
                height={40} 
                className="rounded-xl shadow-lg shadow-emerald-500/10"
              />
            </motion.div>
            <span className="text-lg font-bold text-white tracking-[0.2em] uppercase">Finanze</span>
          </div>
        </motion.div>

        {/* Main Branding Content */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-6xl font-bold text-white leading-[1.1] tracking-tight" 
              style={{ fontFamily: 'var(--font-lora), serif' }}
            >
              Master Your{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Financial Destiny.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-xl text-white/60 leading-relaxed max-w-lg font-light"
            >
              The minimalist workspace for modern individuals to track assets, analyze spending, and build generational wealth.
            </motion.p>
          </div>

          <div className="grid gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + (i * 0.1), duration: 0.5 }}
                className="flex items-center gap-5 group cursor-default"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  {f.icon}
                </div>
                <span className="text-base text-white/80 font-medium tracking-wide group-hover:text-white transition-colors">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Status */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] text-white/50 uppercase tracking-[0.15em] font-bold">Systems Nominal</span>
          </div>
          <span className="text-[10px] text-white/20 uppercase tracking-widest">v1.0.4 Premium</span>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#020604]">
        
        {/* Mobile Background (Hidden on Desktop) */}
        <div className="lg:hidden absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="/loginteaser.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        {/* Animated Decorative Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" 
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          
          {/* Form Container with glass effect on mobile */}
          <motion.div 
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-1 sm:p-0 bg-white/5 dark:bg-white/[0.02] sm:bg-transparent rounded-[32px] backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none overflow-hidden"
          >
            <div className="p-8 sm:p-0 space-y-10">
              
              {/* Logo (mobile only) + Header */}
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="lg:hidden flex items-center gap-3 mb-8"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Image 
                      src={mounted && theme === 'light' ? '/logo-light.png' : '/logo-dark.png'} 
                      alt="Finanze Logo" 
                      width={44} 
                      height={44} 
                      priority
                      className="rounded-xl shadow-xl shadow-emerald-500/20"
                    />
                  </motion.div>
                  <span className="text-xl font-bold tracking-[0.15em] uppercase text-foreground">Finanze</span>
                </motion.div>
                
                <div className="space-y-2">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl font-bold tracking-tight text-foreground"
                  >
                    Sign in
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-base text-muted-foreground font-medium"
                  >
                    Access your personal financial cloud.
                  </motion.p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2.5"
                >
                  <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Account Identifier</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. nanda@finanze.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-muted/20 dark:bg-white/[0.03] border-border/40 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl text-base placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2.5"
                >
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Access Token</Label>
                    <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors">Forgot Access?</button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 bg-muted/20 dark:bg-white/[0.03] border-border/40 transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl text-base placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    asChild
                    className="w-full h-14 font-bold text-base gap-3 bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl shadow-xl shadow-foreground/10 active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative group cursor-pointer"
                    disabled={loading}
                  >
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                      {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Authenticating...</>
                      ) : (
                        <>Establish Connection <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" /></>
                      )}
                    </motion.button>
                  </Button>
                </motion.div>
              </form>

              {/* Footer Links */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="pt-8 flex flex-col items-center gap-6 border-t border-border/10"
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-30">
                  Secured & Encrypted Environment
                </p>
                <div className="flex gap-8">
                  <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Privacy</button>
                  <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Terms</button>
                  <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Support</button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}