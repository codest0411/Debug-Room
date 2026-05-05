'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SystemBootLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if we've already shown the boot sequence in this session
    const hasBooted = sessionStorage.getItem('system_booted');
    if (hasBooted) {
      setIsLoading(false);
      return;
    }

    const duration = 3000; // Minimum 3 seconds boot
    const interval = 30;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem('system_booted', 'true');
          }, 800);
          return 100;
        }
        
        // Dynamic bursty progress logic
        const remaining = 100 - prev;
        const randomBurst = Math.random() * (remaining > 50 ? 5 : 2);
        const next = prev + (remaining / (duration / interval)) + randomBurst;
        return Math.min(next, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#050508',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40
          }}
        >
          {/* Background Grid Effect */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: 'radial-gradient(circle at center, rgba(0,255,136,0.05) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            zIndex: -1
          }} />

          {/* Logo Reveal */}
          <div style={{ position: 'relative' }}>
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.2em' }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 900,
                color: '#FFF',
                textAlign: 'center',
                textShadow: '0 0 20px rgba(255,255,255,0.5)'
              }}
            >
              DEBUG_ROOM
            </motion.h1>
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              style={{
                position: 'absolute',
                inset: -10,
                border: '1px solid var(--accent)',
                borderRadius: 4,
                filter: 'blur(2px)'
              }}
            />
          </div>

          {/* Progress Container */}
          <div style={{ width: 300, position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.6rem', 
              color: 'var(--accent)', 
              fontFamily: 'var(--font-code)',
              marginBottom: 8,
              letterSpacing: '0.1em'
            }}>
              <span>SYSTEM_INITIALIZING</span>
              <span>{Math.round(progress)}%</span>
            </div>
            
            {/* The Bar */}
            <div style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <motion.div
                style={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  background: 'var(--accent)',
                  boxShadow: '0 0 15px var(--accent)'
                }}
              />
            </div>

            {/* Scanning Line */}
            <motion.div
              animate={{ left: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 20,
                height: 10,
                width: 2,
                background: 'var(--accent)',
                boxShadow: '0 0 10px var(--accent)',
                opacity: 0.5
              }}
            />
          </div>

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em'
            }}
          >
            ESTABLISHING SECURE CONNECTION...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
