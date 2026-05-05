'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '⊞', group: 'OVERVIEW' },
  { label: 'Users', href: '/admin/users', icon: '👤', group: 'USERS' },
  { label: 'Reports', href: '/admin/reports', icon: '🚩', group: 'USERS' },
  { label: 'Rooms', href: '/admin/rooms', icon: '🚪', group: 'CONTENT' },
  { label: 'Puzzles', href: '/admin/puzzles', icon: '🧩', group: 'CONTENT' },
  { label: 'Achievements', href: '/admin/achievements', icon: '🏆', group: 'CONTENT' },
  { label: 'Announcements', href: '/admin/announcements', icon: '📢', group: 'CONTENT' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📊', group: 'ANALYTICS' },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: '🥇', group: 'ANALYTICS' },
  { label: 'Audit Log', href: '/admin/audit-log', icon: '📋', group: 'SYSTEM' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙', group: 'SYSTEM', superAdminOnly: true },
  { label: 'Admins', href: '/admin/admins', icon: '🛡', group: 'SYSTEM', superAdminOnly: true },
];

const GROUPS = ['OVERVIEW', 'USERS', 'CONTENT', 'ANALYTICS', 'SYSTEM'];

export function AdminSidebar({ user, collapsed, onToggle }: {
  user: Partial<User> | null;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const isSuperAdmin = user?.is_super_admin;

  return (
    <div className="admin-sidebar" style={{
      width: collapsed ? 56 : 240,
      flexShrink: 0,
      background: '#111111',
      borderRight: '1px solid #1E1E1E',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '16px 0' : '16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1E1E1E', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {!collapsed && (
          <div>
            <div style={{ color: '#00FF88', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>DEBUG_ROOM</div>
            <div style={{ color: '#555', fontSize: '0.65rem', letterSpacing: '0.15em' }}>ADMIN CONSOLE</div>
          </div>
        )}
        {collapsed && <span style={{ color: '#00FF88', fontSize: '1rem' }}>⚡</span>}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((item) => item.group === group && (!item.superAdminOnly || isSuperAdmin));
          if (!items.length) return null;
          return (
            <div key={group} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div style={{ padding: '8px 12px 4px', fontSize: '0.6rem', color: '#444', letterSpacing: '0.15em', fontWeight: 600 }}>
                  {group}
                </div>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', background: isActive ? 'rgba(0,255,136,0.08)' : 'transparent', borderLeft: isActive ? '2px solid #00FF88' : '2px solid transparent', color: isActive ? '#F0F0F0' : '#666', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#1A1A1A'; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 500 : 400 }}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && user && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1E1E1E' }}>
          <div style={{ fontSize: '0.75rem', color: '#F0F0F0', fontWeight: 500, marginBottom: 2 }}>
            {user.display_name || user.username}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#555' }}>{user.admin_role?.replace('_', ' ')}</div>
        </div>
      )}
    </div>
  );
}

export function AdminHeader({ user, onToggleSidebar }: { user: Partial<User> | null; onToggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="header-content" style={{ height: 56, flexShrink: 0, background: '#111111', borderBottom: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
      <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 8, borderRadius: 4, fontSize: '1rem' }}>☰</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{user.email}</span>
            <span style={{ padding: '3px 8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 4, fontSize: '0.65rem', color: '#00FF88', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {user.admin_role?.replace('_', ' ') || 'Admin'}
            </span>
          </>
        )}
        <Link href="/" target="_blank" style={{ fontSize: '0.75rem', color: '#666', textDecoration: 'none' }}>View Site ↗</Link>
        <button onClick={handleLogout} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 4, color: '#888', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#FF4444'; (e.currentTarget as HTMLElement).style.color = '#FF4444'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLElement).style.color = '#888'; }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/admin/login'); return; }
      const { data } = await supabase.from('users').select('username, display_name, email, is_admin, is_super_admin, admin_role').eq('id', authUser.id).single();
      if (!data?.is_admin) { router.push('/admin/login'); return; }
      setUser({ ...data, email: authUser.email });
      setIsLoading(false);
    }
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D' }}>
        <div style={{ color: '#00FF88', fontFamily: 'monospace', fontSize: '0.85rem' }}>Loading admin console...</div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0D' }}>
      <AdminSidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminHeader user={user} onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
