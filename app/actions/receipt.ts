'use server';

import { createClient } from '@/utils/supabase/server';
import { callAlibabaMultimodal } from '@/lib/ai';
import { getCategories } from './finance';

export async function analyzeReceipt(base64Image: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const categories = await getCategories(user.id);
  const categoryNames = categories.map(c => c.name).join(', ');

  const prompt = `
Analyze this receipt image. Extract the transactions and return them ONLY as a JSON object.
If there are multiple items that belong to different categories, split them into separate transaction objects.

Available categories: ${categoryNames}

The JSON structure MUST be:
{
  "transactions": [
    {
      "amount": number,
      "description": "string",
      "categoryName": "string (must match one of the available categories if possible, or use 'Others')",
      "type": "EXPENSE"
    }
  ],
  "totalAmount": number,
  "date": "YYYY-MM-DD"
}

Example output: {"transactions": [{"amount": 50000, "description": "Lunch at McD", "categoryName": "Food & Drinks", "type": "EXPENSE"}], "totalAmount": 50000, "date": "2024-05-01"}
  `;

  try {
    const rawResult = await callAlibabaMultimodal(base64Image, prompt);
    
    // Clean the result (remove markdown code blocks if AI added them)
    const jsonString = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonString);

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Receipt analysis failed:', error);
    return { success: false, error: error.message };
  }
}
