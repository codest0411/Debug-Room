import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disabling auto-preload to stop the console warnings across the platform
});
