import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { PWAStatus } from '@/components/ui/pwa-status';

export const metadata: Metadata = {
  title: 'Senior Citizen Information Management System',
  description:
    'Comprehensive senior citizen registration and management system for OSCA and BASCA',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: [
    'senior citizen',
    'OSCA',
    'BASCA',
    'government',
    'management',
    'PWA'
  ],
  authors: [{ name: 'SCIMS Team' }],
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png'
  },
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SCIMS'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'Senior Citizen Information Management System',
    title: 'SCIMS - Senior Citizen Management',
    description:
      'Comprehensive senior citizen registration and management system for OSCA and BASCA'
  },
  twitter: {
    card: 'summary',
    title: 'SCIMS - Senior Citizen Management',
    description:
      'Comprehensive senior citizen registration and management system for OSCA and BASCA'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <meta name="theme-color" content="#00af8f" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
          <PWAStatus />
        </AuthProvider>
      </body>
    </html>
  );
}
