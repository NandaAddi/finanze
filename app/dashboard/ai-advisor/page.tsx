'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BrainCircuit, TrendingDown, Target, RefreshCw, Loader2 } from 'lucide-react';
import { generateFinancialInsights } from '@/app/actions/ai-advisor';
import ReactMarkdown from 'react-markdown';

export default function AIAdvisorPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateFinancialInsights();
      if (result.success) {
        setInsights(result.insights);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('AI Insight generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 md:mb-6 border border-emerald-500/20">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4" style={{ fontFamily: 'var(--font-lora), serif' }}>
          AI Financial Advisor
        </h1>
        <p className="text-muted-foreground max-w-lg leading-relaxed text-xs md:text-sm px-4">
          Dapatkan analisis mendalam dan rekomendasi cerdas berdasarkan pola transaksi Anda menggunakan kekuatan Alibaba AI (Qwen).
        </p>
      </div>

      {!insights ? (
        <Card className="bg-card border-border/50 shadow-none overflow-hidden relative border-dashed border-2 rounded-2xl">
          <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <BrainCircuit className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/20 mb-4 md:mb-6" />
            <h3 className="text-base md:text-lg font-medium mb-2">Siap untuk menganalisis data Anda?</h3>
            <p className="text-[12px] md:text-sm text-muted-foreground mb-6 md:mb-8 max-w-xs">
              AI akan memproses transaksi dan saldo dompet Anda untuk memberikan saran finansial yang personal.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 font-bold transition-all gap-2 shadow-lg shadow-emerald-900/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Menganalisis Data...' : 'Mulai Analisis AI'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerate} 
              variant="outline" 
              disabled={loading}
              className="rounded-full h-10 border-border/50 hover:bg-muted/50 text-xs gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Perbarui Analisis
            </Button>
          </div>

          <Card className="bg-card border-border/50 shadow-none overflow-hidden relative border-l-emerald-500/50 border-l-4 rounded-2xl">
            <CardContent className="p-6 md:p-10 prose dark:prose-invert max-w-none prose-sm prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-emerald-500 prose-headings:mb-4 prose-p:leading-relaxed">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50 shadow-none rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Pengingat Hemat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] md:text-sm text-muted-foreground leading-relaxed">
                  Berdasarkan tren, pengeluaran impulsif Anda biasanya terjadi di akhir pekan. Coba aktifkan fitur "Weekend Limit" untuk membantu kontrol diri.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-none rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-500" /> Target Finansial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] md:text-sm text-muted-foreground leading-relaxed">
                  Dengan menghemat 10% di kategori makan luar, Anda bisa mencapai target tabungan Dana Darurat Anda 2 bulan lebih cepat.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
