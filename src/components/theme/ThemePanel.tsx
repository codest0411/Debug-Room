'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, THEMES, type Theme } from '@/store';

export function ThemePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, soundEnabled, setSoundEnabled, animationsEnabled, setAnimationsEnabled } =
    useThemeStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--accent)',
          fontSize: '1rem',
          transition: 'all 0.2s',
        }}
        title="Theme Settings"
        aria-label="Open theme panel"
      >
        🎨
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 999,
              }}
            />
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 70,
                right: 20,
                width: 320,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 20,
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  fontSize: '0.85rem',
                  marginBottom: 16,
                  letterSpacing: '0.1em',
                }}
              >
                ⚙ SYSTEM PREFERENCES
              </div>

              {/* Theme grid */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.1em',
                    marginBottom: 10,
                  }}
                >
                  THEME
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {(Object.entries(THEMES) as [Theme, { label: string; bg: string; accent: string; preview: string }][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key as Theme)}
                      title={val.label}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 8,
                        background: val.bg,
                        border: theme === key ? `2px solid ${val.accent}` : '2px solid transparent',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: theme === key ? `0 0 10px ${val.accent}66` : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 12,
                          height: 4,
                          borderRadius: 2,
                          background: val.accent,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '🔊 Sound Effects', value: soundEnabled, onChange: setSoundEnabled },
                  { label: '✨ Animations', value: animationsEnabled, onChange: setAnimationsEnabled },
                ].map(({ label, value, onChange }) => (
                  <div
                    key={label}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {label}
                    </span>
                    <button
                      onClick={() => onChange(!value)}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: value ? 'var(--accent)' : 'var(--border)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: value ? 22 : 2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Theme auto-saved to localStorage
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
