import type { Metadata } from 'next';
import { inter } from '@/lib/fonts';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Providers } from './providers';
import { SystemBootLoader } from '@/components/effects/SystemBootLoader';
import dns from 'dns';

// FORCE IPv4 FIRST to fix 10s DNS timeouts on Windows/Certain ISPs
if (dns && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

export const metadata: Metadata = {
  title: 'THE DEBUG ROOM — Coder Escape Room',
  description:
    'A cinematic, dark cyberpunk escape room for developers. Solve real coding puzzles, escape 10 rooms, and prove you are a true developer.',
  keywords: ['escape room', 'coding', 'developer', 'puzzle', 'debug', 'programming'],
  openGraph: {
    title: 'THE DEBUG ROOM',
    description: 'You are trapped inside a broken production system. Only true developers escape alive.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <SystemBootLoader />
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
