'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile, updateEmail, updatePassword, updateMobile } from './actions';

interface ProfileEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    display_name: user.display_name || '',
    mobile_number: user.mobile_number || '',
    email: user.email || '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateBasic = async () => {
    setIsLoading(true);
    const res = await updateProfile({
      username: formData.username,
      display_name: formData.display_name,
      mobile_number: formData.mobile_number
    });
    
    if (res.error) setMessage({ type: 'error', text: res.error });
    else setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const supabase = (await import('@/lib/supabase/client')).createClient();
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ type: 'error', text: uploadError.message });
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const res = await updateProfile({ avatar_url: publicUrl });
    if (res.error) setMessage({ type: 'error', text: res.error });
    else setMessage({ type: 'success', text: 'Avatar updated!' });
    setIsLoading(false);
  };

  const handleUpdateEmail = async () => {
    setIsLoading(true);
    const res = await updateEmail(formData.email);
    if (res.error) setMessage({ type: 'error', text: res.error });
    else setMessage({ type: 'success', text: res.success || 'Verification sent!' });
    setIsLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!formData.password) return;
    setIsLoading(true);
    const res = await updatePassword(formData.password);
    if (res.error) setMessage({ type: 'error', text: res.error });
    else setMessage({ type: 'success', text: 'Password updated!' });
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 500,
              background: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: 20,
              padding: 40,
              boxShadow: '0 0 50px rgba(0,255,136,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 8 }}>TERMINAL_CONFIG</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Modify your hacker identity and security protocols.</p>
            </div>

            {message && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: 8, 
                marginBottom: 24, 
                fontSize: '0.8rem',
                background: message.type === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,59,59,0.1)',
                border: `1px solid ${message.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`,
                color: message.type === 'success' ? 'var(--accent)' : 'var(--danger)'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Basic Info */}
              <section>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.1em' }}>IDENTITY</div>
                
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 32 }}>{user.personality_type?.includes('NINJA') ? '🥷' : '💻'}</span>
                    )}
                  </div>
                  <div>
                    <label className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-block' }}>
                      {isLoading ? 'UPLOADING...' : 'CHANGE PHOTO'}
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden disabled={isLoading} />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>USERNAME</label>
                    <input 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="input-main" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#FFF' }}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>DISPLAY NAME</label>
                    <input 
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      className="input-main" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#FFF' }}
                    />
                  </div>
                  <button onClick={handleUpdateBasic} disabled={isLoading} className="btn-primary" style={{ marginTop: 8, padding: '10px', fontSize: '0.8rem', width: '100%' }}>
                    SAVE IDENTITY
                  </button>
                </div>
              </section>

              <div style={{ height: 1, background: 'var(--border)' }} />

              {/* Email */}
              <section>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.1em' }}>SECURITY_PROTOCOL</div>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>EMAIL (VERIFICATION REQUIRED)</label>
                  <input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-main" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#FFF' }}
                  />
                  <button onClick={handleUpdateEmail} disabled={isLoading} className="btn-ghost" style={{ marginTop: 12, padding: '8px', fontSize: '0.75rem', width: '100%' }}>
                    CHANGE EMAIL
                  </button>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>NEW PASSWORD</label>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-main" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#FFF' }}
                  />
                  <button onClick={handleUpdatePassword} disabled={isLoading || !formData.password} className="btn-ghost" style={{ marginTop: 12, padding: '8px', fontSize: '0.75rem', width: '100%' }}>
                    UPDATE PASSWORD
                  </button>
                </div>
              </section>

              <button onClick={onClose} style={{ marginTop: 20, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                CLOSE TERMINAL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
