'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getFinancialOverview(userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [wallets, transactions, weeklyTransactions] = await Promise.all([
      db.wallet.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' },
      }),
      db.transaction.findMany({
        where: { created_by: userId },
        include: {
          category: true,
          wallet: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      db.transaction.findMany({
        where: {
          created_by: userId,
          type: 'EXPENSE',
          created_at: { gte: sevenDaysAgo },
        },
        select: {
          amount: true,
          created_at: true,
        },
      }),
    ]);

    // Process weekly data using a Map for O(1) lookups (Rule: js-index-maps)
    const spendingMap = new Map<string, number>();
    weeklyTransactions.forEach(t => {
      const dateKey = new Date(t.created_at).toDateString();
      spendingMap.set(dateKey, (spendingMap.get(dateKey) || 0) + t.amount);
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySpending = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = days[date.getDay()];
      const amount = spendingMap.get(date.toDateString()) || 0;
      
      return { day: dayName, amount };
    });

    return { wallets, transactions, weeklySpending };
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return { wallets: [], transactions: [], weeklySpending: [] };
  }
}

export async function getAnalyticsData(userId: string, startDate: Date) {
  try {
    const [wallets, transactions] = await Promise.all([
      db.wallet.findMany({
        where: { user_id: userId },
      }),
      db.transaction.findMany({
        where: {
          created_by: userId,
          created_at: { gte: startDate },
        },
        include: {
          category: true,
          wallet: true,
        },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    return { wallets, transactions };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return { wallets: [], transactions: [] };
  }
}

export async function createTransaction(data: {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  wallet_id: string;
  category_id: string;
  userId: string;
}) {
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          type: data.type,
          description: data.description,
          wallet_id: data.wallet_id,
          category_id: data.category_id,
          created_by: data.userId,
        },
      });

      // 2. Update wallet balance
      const wallet = await tx.wallet.findUnique({
        where: { id: data.wallet_id },
      });

      if (!wallet) throw new Error('Wallet not found');

      const newBalance = data.type === 'INCOME' 
        ? wallet.balance + data.amount
        : wallet.balance - data.amount;

      await tx.wallet.update({
        where: { id: data.wallet_id },
        data: { balance: newBalance },
      });

      return transaction;
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/analytics');
    revalidatePath('/dashboard/transactions');
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return { success: false, error: error.message };
  }
}

export async function getCategories(userId: string) {
  try {
    return await db.category.findMany({
      where: {
        OR: [
          { created_by: userId },
          { created_by: null } // System categories if any
        ]
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getWalletDetails(walletId: string, userId: string) {
  try {
    const [wallet, transactions] = await Promise.all([
      db.wallet.findUnique({
        where: { id: walletId, user_id: userId },
      }),
      db.transaction.findMany({
        where: { wallet_id: walletId, created_by: userId },
        include: {
          category: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return { wallet, transactions };
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    return { wallet: null, transactions: [] };
  }
}
export async function searchFinancials(query: string, userId: string) {
  try {
    const [wallets, transactions] = await Promise.all([
      db.wallet.findMany({
        where: {
          user_id: userId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
      db.transaction.findMany({
        where: {
          created_by: userId,
          description: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    return { wallets, transactions };
  } catch (error) {
    console.error('Search failed:', error);
    return { wallets: [], transactions: [] };
  }
}
export async function getTransactions(userId: string, filterType: 'ALL' | 'INCOME' | 'EXPENSE') {
  try {
    const transactions = await db.transaction.findMany({
      where: {
        created_by: userId,
        ...(filterType !== 'ALL' ? { type: filterType } : {}),
      },
      include: {
        category: true,
        wallet: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function deleteTransactionAction(transactionId: string, userId: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.created_by !== userId) {
      throw new Error('Transaction not found or unauthorized');
    }

    await db.$transaction(async (tx) => {
      // 1. Update wallet balance back
      const wallet = await tx.wallet.findUnique({
        where: { id: transaction.wallet_id },
      });

      if (wallet) {
        const adjustment = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
        await tx.wallet.update({
          where: { id: transaction.wallet_id },
          data: { balance: wallet.balance + adjustment },
        });
      }

      // 2. Delete transaction
      await tx.transaction.delete({
        where: { id: transactionId },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/analytics');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
}
export async function getWallets(userId: string) {
  try {
    return await db.wallet.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }
}
export async function updateProfile(userId: string, data: { full_name?: string; avatar_url?: string; banner_url?: string }) {
  try {
    await db.profile.update({
      where: { id: userId },
      data: {
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        banner_url: data.banner_url,
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update profile failed:', error);
    return { success: false, error: error.message };
  }
}
export async function createWallet(data: {
  name: string;
  description?: string;
  balance: number;
  currency: string;
  userId: string;
}) {
  try {
    const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    
    const wallet = await db.wallet.create({
      data: {
        name: data.name,
        description: data.description,
        balance: data.balance,
        currency: data.currency,
        user_id: data.userId,
        slug: slug,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/wallets');
    
    return { success: true, data: wallet };
  } catch (error: any) {
    console.error('Create wallet failed:', error);
    return { success: false, error: error.message };
  }
}
export async function updateWallet(data: {
  id: string;
  name: string;
  description?: string;
  currency: string;
  userId: string;
}) {
  try {
    const wallet = await db.wallet.update({
      where: { id: data.id, user_id: data.userId },
      data: {
        name: data.name,
        description: data.description,
        currency: data.currency,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/wallets');
    revalidatePath(`/dashboard/wallets/${data.id}`);
    
    return { success: true, data: wallet };
  } catch (error: any) {
    console.error('Update wallet failed:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteWallet(walletId: string, userId: string) {
  try {
    const wallet = await db.wallet.findUnique({
      where: { id: walletId, user_id: userId },
    });

    if (!wallet) throw new Error('Wallet not found');

    await db.wallet.delete({
      where: { id: walletId },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/wallets');
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete wallet failed:', error);
    return { success: false, error: error.message };
  }
}
export async function seedDefaultCategories(userId: string, walletId: string) {
  const defaults = [
    { name: 'Food & Drinks', icon: 'utensils', color: '#10b981' },
    { name: 'Transportation', icon: 'car', color: '#3b82f6' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#f59e0b' },
    { name: 'Housing', icon: 'home', color: '#ef4444' },
    { name: 'Salary', icon: 'dollar-sign', color: '#10b981' },
    { name: 'Entertainment', icon: 'film', color: '#8b5cf6' },
    { name: 'Others', icon: 'grid', color: '#6b7280' },
  ];

  try {
    const categories = await Promise.all(
      defaults.map((cat, index) => 
        db.category.create({
          data: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            wallet_id: walletId,
            created_by: userId,
            position: index,
          }
        })
      )
    );
    return categories;
  } catch (error) {
    console.error('Seeding categories failed:', error);
    return [];
  }
}
export async function transferFunds(data: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  userId: string;
}) {
  try {
    await db.$transaction(async (tx) => {
      // 1. Deduct from source wallet
      const fromWallet = await tx.wallet.findUnique({ where: { id: data.fromWalletId } });
      if (!fromWallet || fromWallet.user_id !== data.userId) throw new Error('Source wallet not found');
      if (fromWallet.balance < data.amount) throw new Error('Insufficient balance');

      await tx.wallet.update({
        where: { id: data.fromWalletId },
        data: { balance: fromWallet.balance - data.amount },
      });

      // 2. Add to target wallet
      const toWallet = await tx.wallet.findUnique({ where: { id: data.toWalletId } });
      if (!toWallet || toWallet.user_id !== data.userId) throw new Error('Target wallet not found');

      await tx.wallet.update({
        where: { id: data.toWalletId },
        data: { balance: toWallet.balance + data.amount },
      });

      // 3. Create transactions
      await tx.transaction.create({
        data: {
          amount: data.amount,
          type: 'EXPENSE',
          description: `Transfer to ${toWallet.name}${data.description ? ': ' + data.description : ''}`,
          wallet_id: data.fromWalletId,
          created_by: data.userId,
          category_id: (await tx.category.findFirst({ where: { name: 'Others', created_by: data.userId } }))?.id || '',
        }
      });

      await tx.transaction.create({
        data: {
          amount: data.amount,
          type: 'INCOME',
          description: `Transfer from ${fromWallet.name}${data.description ? ': ' + data.description : ''}`,
          wallet_id: data.toWalletId,
          created_by: data.userId,
          category_id: (await tx.category.findFirst({ where: { name: 'Others', created_by: data.userId } }))?.id || '',
        }
      });
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Transfer failed:', error);
    return { success: false, error: error.message };
  }
}
export async function updateTransaction(data: {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  wallet_id: string;
  category_id: string;
  userId: string;
}) {
  try {
    await db.$transaction(async (tx) => {
      // 1. Get old transaction
      const oldTransaction = await tx.transaction.findUnique({
        where: { id: data.id },
      });

      if (!oldTransaction || oldTransaction.created_by !== data.userId) {
        throw new Error('Transaction not found or unauthorized');
      }

      // 2. Revert old balance
      const oldWallet = await tx.wallet.findUnique({ where: { id: oldTransaction.wallet_id } });
      if (oldWallet) {
        const revertAdjustment = oldTransaction.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount;
        await tx.wallet.update({
          where: { id: oldTransaction.wallet_id },
          data: { balance: oldWallet.balance + revertAdjustment },
        });
      }

      // 3. Apply new balance
      const targetWallet = await tx.wallet.findUnique({ where: { id: data.wallet_id } });
      if (!targetWallet) throw new Error('New wallet not found');
      
      const newAdjustment = data.type === 'INCOME' ? data.amount : -data.amount;
      await tx.wallet.update({
        where: { id: data.wallet_id },
        data: { balance: targetWallet.balance + newAdjustment },
      });

      // 4. Update transaction
      await tx.transaction.update({
        where: { id: data.id },
        data: {
          amount: data.amount,
          type: data.type,
          description: data.description,
          wallet_id: data.wallet_id,
          category_id: data.category_id,
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    return { success: true };
  } catch (error: any) {
    console.error('Update transaction failed:', error);
    return { success: false, error: error.message };
  }
}
