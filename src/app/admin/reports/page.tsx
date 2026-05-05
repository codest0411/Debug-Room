import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/layout/AdminShell';

export default async function AdminReportsPage() {
  const supabase = await createClient();
  
  const { data: reports } = await supabase
    .from('user_reports')
    .select('*, user:reporter_id(username, email)')
    .order('created_at', { ascending: false });

  return (
    <AdminShell>
      <div style={{ padding: 40 }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 8 }}>USER_REPORTS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and resolve technical issues and player feedback.</p>
        </div>

        <div className="glass" style={{ borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', background: 'rgba(10,10,15,0.8)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>REPORTER</th>
                <th style={{ padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>TYPE</th>
                <th style={{ padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>PRIORITY</th>
                <th style={{ padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '16px 24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {(reports || []).map((report: any) => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{report.user?.username || 'Unknown'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{report.user?.email}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div className="badge badge-outline" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{report.report_type.replace(/_/g, ' ')}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ 
                      color: report.priority === 'critical' ? 'var(--danger)' : report.priority === 'high' ? '#FFA500' : 'var(--accent)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {report.priority}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      fontSize: '0.7rem', 
                      display: 'inline-block',
                      background: report.status === 'open' ? 'rgba(255,59,59,0.1)' : 'rgba(0,255,136,0.1)',
                      border: `1px solid ${report.status === 'open' ? 'var(--danger)' : 'var(--accent)'}`,
                      color: report.status === 'open' ? 'var(--danger)' : 'var(--accent)'
                    }}>
                      {report.status.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!reports || reports.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    NO REPORTS LOGGED IN THE SYSTEM
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
