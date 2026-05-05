'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// High-quality public assets for the hacker vibe
const SOUND_FILES = {
  ambient: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3c3a9f074.mp3?filename=spaceship-engine-hum-15443.mp3',
  click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_73f08f237d.mp3?filename=ui-click-43196.mp3',
  hover: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_24a2757262.mp3?filename=electronic-beep-13454.mp3',
  typewriter: 'https://cdn.pixabay.com/download/audio/2021/11/26/audio_2911b3f9d3.mp3?filename=typewriter-sound-9602.mp3'
};

export function SystemControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [glitchEnabled, setGlitchEnabled] = useState(true);
  const [activeTheme, setActiveTheme] = useState('default');
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  const THEMES = [
    { id: 'default', color: '#00FF88', name: 'MATRIX_GREEN' },
    { id: 'ocean_blue', color: '#00D9FF', name: 'CYBER_BLUE' },
    { id: 'blood_red', color: '#FF3B3B', name: 'SYSTEM_RED' },
    { id: 'midnight_purple', color: '#9D4EDD', name: 'NEON_PURPLE' },
  ];

  useEffect(() => {
    const savedAudio = localStorage.getItem('sys_audio') === 'true';
    const savedGlitch = localStorage.getItem('sys_glitch') !== 'false';
    const savedTheme = localStorage.getItem('sys_theme') || 'default';
    
    setAudioEnabled(savedAudio);
    setGlitchEnabled(savedGlitch);
    setActiveTheme(savedTheme);
    
    document.documentElement.setAttribute('data-glitch', savedGlitch ? 'on' : 'off');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (audioEnabled) {
      if (!ambientRef.current) {
        ambientRef.current = new Audio(SOUND_FILES.ambient);
        ambientRef.current.loop = true;
        ambientRef.current.volume = 0.15;
      }
      ambientRef.current.play().catch(() => setAudioEnabled(false));
    } else if (ambientRef.current) {
      ambientRef.current.pause();
    }
    localStorage.setItem('sys_audio', audioEnabled.toString());
  }, [audioEnabled]);

  const toggleGlitch = () => {
    const next = !glitchEnabled;
    setGlitchEnabled(next);
    localStorage.setItem('sys_glitch', next.toString());
    document.documentElement.setAttribute('data-glitch', next ? 'on' : 'off');
    playSound('click');
  };

  const changeTheme = (id: string) => {
    setActiveTheme(id);
    localStorage.setItem('sys_theme', id);
    document.documentElement.setAttribute('data-theme', id);
    playSound('click');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="terminal"
            style={{
              marginBottom: 16,
              padding: 20,
              width: 280,
              background: 'rgba(10,10,15,0.98)',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 50px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '0.3em', marginBottom: 20, fontWeight: 800 }}>COMMAND_CENTER_V2.1</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* PERSISTENT TOGGLES */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>AUDIO_ENGINE</span>
                <button 
                  onClick={() => { setAudioEnabled(!audioEnabled); playSound('click'); }}
                  className={audioEnabled ? 'badge badge-success' : 'badge badge-muted'}
                  style={{ cursor: 'pointer', border: 'none', fontSize: '0.55rem', minWidth: 60 }}
                >
                  {audioEnabled ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>VISUAL_STABILITY</span>
                <button 
                  onClick={toggleGlitch}
                  className={!glitchEnabled ? 'badge badge-info' : 'badge badge-danger'}
                  style={{ cursor: 'pointer', border: 'none', fontSize: '0.55rem', minWidth: 60 }}
                >
                  {!glitchEnabled ? 'LOCKED' : 'GLITCH'}
                </button>
              </div>

              {/* SPECTRUM DECRYPTER */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: 10, letterSpacing: '0.1em' }}>SPECTRUM_DECRYPTER</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => changeTheme(t.id)}
                      style={{
                        height: 32,
                        background: t.color,
                        border: activeTheme === t.id ? '2px solid #fff' : 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: activeTheme === t.id ? `0 0 15px ${t.color}` : 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; playSound('hover'); }}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', color: '#444' }}>ENCRYPTION: AES-256</span>
              <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { setIsOpen(!isOpen); playSound('click'); }}
        onMouseEnter={() => playSound('hover')}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isOpen ? 'var(--accent)' : 'rgba(10,10,15,0.9)',
          border: '1px solid var(--accent)',
          color: isOpen ? '#000' : 'var(--accent)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: isOpen ? '0 0 30px var(--accent)' : '0 0 20px rgba(0,0,0,0.5)',
          transition: 'all 0.3s',
          zIndex: 1001
        }}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {isOpen ? '✕' : '⚡'}
        </motion.span>
      </button>
    </div>
  );
}

export function CRTOverlay() {
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
        backgroundSize: '100% 3px, 3px 100%',
        opacity: 0.4,
      }}
    />
  );
}

export function playSound(type: keyof typeof SOUND_FILES) {
  if (localStorage.getItem('sys_audio') !== 'true') return;
  const audio = new Audio(SOUND_FILES[type]);
  audio.volume = type === 'typewriter' ? 0.1 : 0.4;
  audio.play().catch(() => {});
}
