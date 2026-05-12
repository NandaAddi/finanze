# AI Context: Personal Finance Manager

This document provides context for AI assistants working on this codebase.

## 🎯 Project Vision
A minimalist, high-performance Personal Finance Manager designed for individual use. The focus is on clarity, speed, and premium aesthetics.

## 🏗 Architecture
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth (Profile-based)
- **Storage**: GitHub-backed asset storage (Avatars, Banners)
- **UI**: Tailwind CSS + Shadcn UI + Lora/Geist Fonts

## 📊 Data Models (Prisma)
- **Profile**: User account details, avatar, banner.
- **Wallet**: Financial accounts (Bank, Cash, Crypto, etc.) with balances.
- **Category**: Transaction categories (Food, Rent, Salary, etc.).
- **Transaction**: Ledger entries (Income/Expense) linked to Wallets and Categories.

## 🎨 Design System
- **Colors**: Emerald (Income), Rose/Rose-600 (Expense), Charcoal/Black (Background).
- **Typography**: 
  - Serif (Lora): Numbers, headings, currency displays.
  - Sans (Geist): Body text, labels, UI elements.
- **Aesthetic**: Claude.ai-inspired (minimal borders, subtle shadows, generous whitespace).

## 📂 Directory Structure
- `/app`: Main application routes (Dashboard, Wallets, Transactions, Analytics, Settings).
- `/components`: Reusable UI components.
- `/lib`: Database client, shared types, and utility functions.
- `/prisma`: Schema definition and migrations.
- `/public`: Static assets.

## 🛠 Guidelines for AI
- **Strict Finance Focus**: Never suggest or re-implement task management or project features.
- **Clean Code**: Prioritize Prisma for database operations. Use Supabase client only for Auth and Realtime if needed.
- **Visual Excellence**: All new UI components must match the premium, minimalist design language.
- **Privacy**: Ensure all queries are scoped to the current user via `user_id` or `created_by`.
