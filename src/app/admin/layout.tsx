import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import '../globals.css';
import { Providers } from '../providers';

const ibmPlex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Admin Console — THE DEBUG ROOM',
  description: 'Internal admin panel for The Debug Room platform',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={ibmPlex.className} style={{ background: '#0D0D0D', color: '#F0F0F0', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
