# Personal Finance Manager

A premium, minimalist personal finance management application built with Next.js, Prisma, and Supabase. Optimized for speed, clarity, and ease of use.

![Finance Manager](/public/og-image.png)

## 🌟 Features

- **Financial Dashboard**: High-level overview of your total net worth, monthly cash flow, and savings rate.
- **Wallet Management**: Track multiple bank accounts, digital wallets, and cash in one place.
- **Transaction History**: Detailed log of all income and expenses with category tagging.
- **Visual Analytics**: Interactive charts powered by Recharts for spending distribution and monthly trends.
- **Cloud Storage**: Persistent profile customization (avatars and banners) integrated with GitHub and jsDelivr.
- **Minimalist Aesthetic**: Clean, dark-mode interface inspired by Claude.ai, using Lora and Geist typography.

## 🛠 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Database**: [PostgreSQL (via Supabase)](https://supabase.com/)
- **ORM**: [Prisma](https://prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A GitHub repository for asset storage (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nandaaddi/finance-manager.git
   cd finance-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your credentials.

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for personal financial freedom.
