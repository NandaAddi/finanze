import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Lora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/components/user-provider';
import { AccentThemeProvider } from '@/components/accent-theme-provider';
import { Analytics } from "@vercel/analytics/next"
import { TransitionProvider } from '@/components/transition-provider';
import { Suspense } from 'react';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Finanze — Track Money Effortlessly',
  description: 'Minimalist Personal Finance Management for Individuals. Track your money effortlessly with AI-powered insights.',
  metadataBase: new URL('https://finanze.com'), // Assuming a placeholder or final domain
  openGraph: {
    title: 'Finanze — Track Money Effortlessly',
    description: 'Minimalist Personal Finance Management for Individuals. Track your money effortlessly with AI-powered insights.',
    url: 'https://finanze.com',
    siteName: 'Finanze',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finanze — Track Money Effortlessly',
    description: 'Minimalist Personal Finance Management for Individuals. Track your money effortlessly with AI-powered insights.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: ['personal finance', 'money manager', 'wallet tracker', 'expense tracker', 'financial analytics', 'minimalist finance', 'AI finance'],
  authors: [{ name: 'Finanze Team' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-white.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${lora.variable}`}
    >
      <body className={`${GeistSans.className} antialiased`}>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AccentThemeProvider>
            <UserProvider>
              <Suspense fallback={null}>
                <TransitionProvider>
                  {children}
                </TransitionProvider>
              </Suspense>
              <Toaster />
            </UserProvider>
          </AccentThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
