'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store';

const BOOT_LINES = [
  '> Initializing DEBUG_ROOM v2.0...',
  '> Scanning developer ID...',
  '> Authenticating credentials...',
  '> Breach detected. Containment protocol active.',
  '> WARNING: Escape window closing in T-minus unknown.',
  '> Loading escape room environment...',
  '> System ready.',
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);
  const { isBootSequenceDone, setBootSequenceDone } = useUIStore();

  useEffect(() => {
    if (isBootSequenceDone) {
      onComplete();
      return;
    }

    let lineIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const addLine = () => {
      if (lineIndex < BOOT_LINES.length) {
        setVisibleLines((prev) => {
          const newLine = BOOT_LINES[lineIndex];
          if (!newLine) return prev;
          return [...prev, newLine];
        });
        lineIndex++;
        timeoutId = setTimeout(addLine, 400 + Math.random() * 300);
      } else {
        // Glitch and complete
        timeoutId = setTimeout(() => {
          setIsGlitching(true);
          timeoutId = setTimeout(() => {
            setBootSequenceDone(true);
            onComplete();
          }, 800);
        }, 600);
      }
    };

    timeoutId = setTimeout(addLine, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isBootSequenceDone, onComplete, setBootSequenceDone]);

  if (isBootSequenceDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-9999 flex items-center justify-center ${
          isGlitching ? 'animate-error' : ''
        }`}
        style={{ background: '#000000' }}
      >
        <div className="crt w-full max-w-2xl px-8">
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>
                DEBUG_ROOM — TERMINAL v2.0
              </span>
            </div>

            <div style={{ minHeight: 200 }}>
              {visibleLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color:
                      line?.includes('WARNING') || line?.includes('Breach')
                        ? 'var(--danger)'
                        : line?.includes('ready')
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                    marginBottom: 8,
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.9rem',
                  }}
                >
                  {line}
                </motion.div>
              ))}

              {visibleLines.length < BOOT_LINES.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-code)' }}
                >
                  █
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, rgba(0,255,136,0.1), rgba(0,217,255,0.1))',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
