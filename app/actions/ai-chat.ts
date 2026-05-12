'use server';

import { callAlibabaAI } from '@/lib/ai';
import { getCategories, createTransaction } from './finance';

export async function parseAndCreateTransactions(userInput: string, walletId: string, userId: string) {
  try {
    const categories = await getCategories(userId);
    const categoryNames = categories.map(c => c.name).join(', ');

    const systemPrompt = `
      Anda adalah "Finanze AI", asisten keuangan yang mahir mengekstrak transaksi.
      Kategori yang tersedia: [${categoryNames}]
      
      Tugas:
      Ekstrak transaksi dari input user. Pecah menjadi beberapa item jika perlu.
      Ubah nominal "rb", "k", "jt" menjadi angka murni.
      
      Format JSON (WAJIB):
      {
        "transactions": [
          {
            "description": string,
            "amount": number,
            "type": "EXPENSE" | "INCOME",
            "categoryName": string
          }
        ]
      }
    `;

    const rawResponse = await callAlibabaAI(`${systemPrompt}\n\nInput User: "${userInput}"`);

    // Strip markdown fences if present
    const jsonString = rawResponse
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('AI mengembalikan format yang tidak valid. Coba ulangi permintaan.');
    }

    const rawTransactions = parsed?.transactions;
    if (!rawTransactions || !Array.isArray(rawTransactions) || rawTransactions.length === 0) {
      throw new Error('Tidak ada transaksi yang berhasil diidentifikasi dari input.');
    }

    // Validate & sanitize each transaction field
    const validTransactions = rawTransactions.filter((t: any) => {
      const amount = parseFloat(t?.amount);
      return (
        t &&
        typeof t.description === 'string' && t.description.trim() !== '' &&
        !isNaN(amount) && amount > 0 &&
        (t.type === 'EXPENSE' || t.type === 'INCOME') &&
        typeof t.categoryName === 'string'
      );
    });

    if (validTransactions.length === 0) {
      throw new Error('Semua transaksi tidak valid. Pastikan nominal dan deskripsi terisi dengan benar.');
    }
    const results = [];
    for (const t of validTransactions) {
      const category = categories.find(c =>
        c.name.toLowerCase() === t.categoryName.toLowerCase()
      ) || categories.find(c => c.name === 'Others') || categories[0];

      const res = await createTransaction({
        amount: t.amount,
        type: t.type,
        description: t.description,
        wallet_id: walletId,
        category_id: category.id,
        userId: userId
      });
      results.push(res);
    }

    return {
      success: true,
      count: results.filter(r => r.success).length,
      data: parsed.transactions
    };

  } catch (error: any) {
    console.error("AI Transaction Error:", error);
    return { success: false, error: error.message };
  }
}
