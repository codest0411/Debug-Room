'use client';

import { motion } from 'framer-motion';

export function PremiumPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(0, 255, 136, 0.1)',
          borderRadius: 16,
          padding: '60px 40px',
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ fontSize: '3rem', marginBottom: 24 }}>🚧</div>
        
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1.75rem', 
          fontWeight: 800, 
          color: '#F0F0F0', 
          marginBottom: 16,
          letterSpacing: '-0.02em'
        }}>
          {title.toUpperCase()}
        </h1>
        
        <p style={{ 
          color: '#888', 
          fontSize: '1rem', 
          lineHeight: 1.6,
          marginBottom: 32 
        }}>
          {description}
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px',
          background: 'rgba(0,255,136,0.05)',
          border: '1px solid rgba(0,255,136,0.2)',
          borderRadius: 8,
          color: '#00FF88',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          letterSpacing: '0.05em'
        }}>
          <span className="animate-pulse">●</span> OPTIMIZING SYSTEM CORE
        </div>
      </motion.div>
    </div>
  );
}
