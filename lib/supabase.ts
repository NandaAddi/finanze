import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          balance: number;
          currency: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          balance?: number;
          currency?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          balance?: number;
          currency?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          amount: number;
          type: 'INCOME' | 'EXPENSE';
          description: string | null;
          category_id: string | null;
          wallet_id: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          amount: number;
          type: 'INCOME' | 'EXPENSE';
          description?: string | null;
          category_id?: string | null;
          wallet_id: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          amount?: number;
          type?: 'INCOME' | 'EXPENSE';
          description?: string | null;
          category_id?: string | null;
          wallet_id?: string;
          created_at?: string;
          created_by?: string;
        };
      };
    };
  };
};