'use server';

import { createClient } from '@/utils/supabase/server';
import { getFinancialOverview, getTransactions } from './finance';
import { callAlibabaAI } from '@/lib/ai';

export async function generateFinancialInsights() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // 1. Fetch data for analysis
  const [overview, recentTransactions] = await Promise.all([
    getFinancialOverview(user.id),
    getTransactions(user.id, 'ALL')
  ]);

  // 2. Prepare data for the AI
  const walletSummary = overview.wallets.map(w => `${w.name}: Rp ${w.balance.toLocaleString('id-ID')}`).join('\n');
  const transactionSummary = recentTransactions.slice(0, 50).map(t => 
    `- ${t.type}: Rp ${t.amount.toLocaleString('id-ID')} | ${t.description || 'No desc'} | ${(t.category as any)?.name || 'Uncategorized'} | ${t.created_at.toLocaleDateString()}`
  ).join('\n');

  const prompt = `
Analyze my current financial situation based on the data below and provide 3-4 specific, actionable recommendations for saving money. 

CURRENT WALLETS:
${walletSummary}

RECENT TRANSACTIONS (Last 50):
${transactionSummary}

TOTAL SPENDING THIS WEEK: Rp ${overview.weeklySpending.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}

Please provide your analysis in Indonesian (Bahasa Indonesia). Format the response with:
1. **Ringkasan Kondisi**: Singkat saja.
2. **Area Pengeluaran Terbesar**: Identifikasi dari data.
3. **Rekomendasi Hemat**: 3-4 poin konkret.
4. **Target Bulan Depan**: Satu kalimat penyemangat.
  `;

  // 3. Call Alibaba AI
  try {
    const insights = await callAlibabaAI(prompt);
    return { success: true, insights };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getQuickInsight() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const overview = await getFinancialOverview(user.id);
  const totalSpending = overview.weeklySpending.reduce((acc, curr) => acc + curr.amount, 0);

  const prompt = `
Beri saya SATU kalimat singkat (maksimal 15 kata) berisi saran finansial atau observasi pengeluaran berdasarkan data berikut:
- Total belanja minggu ini: Rp ${totalSpending.toLocaleString('id-ID')}
- Jumlah dompet: ${overview.wallets.length}
- Transaksi terakhir: ${overview.transactions[0]?.description || 'Belum ada'}

Gunakan Bahasa Indonesia yang santai tapi profesional. Jangan pakai salam, langsung ke intinya.
  `;

  try {
    const insight = await callAlibabaAI(prompt);
    return insight.trim().replace(/^"|"$/g, '');
  } catch (error) {
    return "Tetap pantau pengeluaran Anda untuk menjaga kesehatan finansial.";
  }
}
