export interface Wallet {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  balance: number;
  currency: string;
  created_at: string;
  user_id: string;
  public_share_token?: string;
  is_public?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  position: number;
  transactions: Transaction[];
  wallet_id: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  category_id: string;
  wallet_id: string;
  created_at: string;
  created_by: string | null;
}

