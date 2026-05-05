'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { MouseTrail } from '@/components/effects/MouseTrail';
import { ThemePanel } from '@/components/theme/ThemePanel';
import { SystemControls, CRTOverlay, playSound } from '@/components/effects/SystemControls';

const ROOMS_PREVIEW = [
  { number: 1, name: 'HTML Island', icon: '🏝️', difficulty: 1, color: '#FFB347', lang: 'HTML5' },
  { number: 2, name: 'CSS Coral Reef', icon: '🪸', difficulty: 2, color: '#00D9FF', lang: 'CSS3' },
  { number: 3, name: 'JavaScript Cave', icon: '⚡', difficulty: 3, color: '#FFD700', lang: 'JS ES6+' },
  { number: 4, name: 'TypeScript Vault', icon: '🔷', difficulty: 3, color: '#3178C6', lang: 'TypeScript' },
  { number: 5, name: 'React Shipwreck', icon: '⚛️', difficulty: 4, color: '#61DAFB', lang: 'React 18' },
  { number: 6, name: 'Python Dungeon', icon: '🐍', difficulty: 3, color: '#3776AB', lang: 'Python 3' },
  { number: 7, name: "Node.js Harbor", icon: '🚢', difficulty: 4, color: '#339933', lang: 'Node.js' },
  { number: 8, name: 'Database Depths', icon: '🗄️', difficulty: 4, color: '#00758F', lang: 'SQL' },
  { number: 9, name: 'Algorithm Abyss', icon: '🧮', difficulty: 5, color: '#FF3B3B', lang: 'DSA' },
  { number: 10, name: 'The Mainframe', icon: '💀', difficulty: 6, color: '#9D4EDD', lang: 'Full Stack' },
];

const SURVIVORS = [
  { handle: '0x_dev', time: '42:17', message: 'Fixed that async bug in room 5. Nearly lost my mind.' },
  { handle: 'null_ptr', time: '58:44', message: 'Algorithm Abyss almost destroyed me. Key: think O(n).' },
  { handle: 'git_blamed', time: '31:09', message: 'CSS Coral Reef: z-index will be the death of all of us.' },
  { handle: 'r00t_cause', time: '1:02:33', message: 'The Mainframe... I will never write unchecked code again.' },
];

const TICKER_ITEMS = [
  'SYSTEM STATUS: CRITICAL',
  'BUGS DETECTED: ∞',
  'COFFEE REMAINING: 0%',
  'UPTIME: 0 days 0 hours',
  'STACK OVERFLOW: OVERFLOWING',
  'PROD IS DOWN',
  'ON CALL: YOU',
  'SLA BREACHED',
];

function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={`glitch ${className}`}
      data-text={text}
      style={{ display: 'inline-block' }}
    >
      {text}
    </span>
  );
}

function DifficultyStars({ count, max = 6 }: { count: number; max?: number }) {
  return (
    <div className="difficulty-stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </div>
  );
}

function RoomCard({ room }: { room: (typeof ROOMS_PREVIEW)[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const slug = room.name.toLowerCase().replace(/ /g, '-').replace(/\./g, '');

  return (
    <Link href={`/room/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        className="room-card glass"
        style={{
          borderRadius: 12,
          padding: '24px 20px',
          background: isHovered ? `linear-gradient(180deg, rgba(10,10,15,0.9), ${room.color}15)` : 'rgba(255, 255, 255, 0.03)',
          borderColor: isHovered ? room.color : 'var(--border)',
          borderWidth: 1,
          borderStyle: 'solid',
          boxShadow: isHovered ? `0 0 30px ${room.color}33, inset 0 0 20px ${room.color}11` : 'none',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onHoverStart={() => {
          setIsHovered(true);
          playSound('hover');
        }}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => playSound('click')}
        whileHover={{ scale: 1.05, y: -10, rotateX: 10, rotateY: -10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: 36, marginBottom: 12, filter: isHovered ? `drop-shadow(0 0 15px ${room.color})` : 'none', transition: 'all 0.3s' }}>{room.icon}</div>
          <div
            style={{
              fontSize: '0.65rem',
              color: room.color,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            DEPTH {room.difficulty * 100}m · {room.lang}
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: isHovered ? '#fff' : 'var(--text-primary)',
              marginBottom: 12,
              textShadow: isHovered ? `0 0 10px ${room.color}` : 'none',
              transition: 'all 0.3s',
            }}
          >
            {room.name}
          </div>
          <div style={{ marginTop: 'auto' }}>
             <DifficultyStars count={room.difficulty} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SurvivorCard({ survivor }: { survivor: (typeof SURVIVORS)[0] }) {
  return (
    <div className="terminal" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: 'var(--accent)',
            fontFamily: 'var(--font-code)',
          }}
        >
          {'>'}
        </div>
        <div>
          <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}>
            {survivor.handle}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            escaped in {survivor.time}
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
        &quot;{survivor.message}&quot;
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const fullSubtitle = 'You are trapped inside a broken production system.';

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsLoggedIn(true);
    }
    checkUser();

    // Typewriter effect
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullSubtitle.length) {
        const nextChar = fullSubtitle.slice(0, i + 1);
        setTypewriterText(nextChar);
        if (nextChar.length % 2 === 0) playSound('typewriter');
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, []);

  const tickerText = TICKER_ITEMS.join(' ◆ ');

  return (
    <>
      <MatrixRain />
      <MouseTrail />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* NAVBAR */}
          <nav
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 40px',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(20px)',
              background: 'rgba(10,10,15,0.8)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                textShadow: '0 0 10px var(--accent)',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {'>'} DEBUG_ROOM
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Link href="/auth/login">
                <button 
                  className="btn-ghost" 
                  style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                >
                  Login
                </button>
              </Link>
              <Link href="/auth/signup">
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 20px', fontSize: '0.75rem' }}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                >
                  Sign Up
                </button>
              </Link>
              <ThemePanel />
            </div>
          </nav>

          {/* HERO SECTION */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '120px 40px 60px',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: 32 }}
            >
              <span className="badge badge-danger">
                ⚠ SYSTEM CRITICAL — CONTAINMENT BREACH ACTIVE
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 24,
                letterSpacing: '-0.03em',
              }}
            >
              <GlitchText text="THE" className="text-neon" />
              <br />
              <GlitchText
                text="DEBUG ROOM"
                className="text-gradient"
              />
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                color: 'var(--text-secondary)',
                marginBottom: 12,
                fontFamily: 'var(--font-display)',
                minHeight: '2em',
              }}
            >
              {typewriterText}
              {showCursor && <span style={{ color: 'var(--accent)' }}>|</span>}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              style={{
                fontSize: '1rem',
                color: 'var(--accent)',
                marginBottom: 48,
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em',
              }}
            >
              Only true developers escape alive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}
            >
              <Link href={isLoggedIn ? "/hub" : "/auth/login"}>
                <button
                  className="btn-primary animate-pulse-neon"
                  style={{ fontSize: '0.9rem', padding: '16px 36px' }}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                >
                  {isLoggedIn ? '⚡ CONTINUE PROGRESS' : '⚡ ENTER THE DEBUG ROOM'}
                </button>
              </Link>
              <Link href="#rooms">
                <button 
                  className="btn-ghost" 
                  style={{ fontSize: '0.9rem', padding: '16px 36px' }}
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                >
                  VIEW ESCAPE ROOMS
                </button>
              </Link>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-display)' }}
            >
              ↓ SCROLL TO EXPLORE ↓
            </motion.div>
          </section>

          {/* STATUS TICKER */}
          <div
            style={{
              background: 'var(--danger)',
              padding: '8px 0',
              overflow: 'hidden',
            }}
          >
            <div className="ticker-wrap">
              <div className="ticker-content">
                <span
                  style={{
                    color: '#000',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  {tickerText} ◆ {tickerText} ◆
                </span>
              </div>
            </div>
          </div>

          {/* STATS BAR */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              padding: '60px 40px',
              display: 'flex',
              justifyContent: 'center',
              gap: 60,
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {[
              { value: '10', label: 'Escape Rooms' },
              { value: '60+', label: 'Real Puzzles' },
              { value: '8+', label: 'Languages' },
              { value: '20', label: 'Achievements' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '3rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    textShadow: '0 0 20px var(--accent)',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.section>

          {/* ROOM PREVIEW */}
          <motion.section
            id="rooms"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ padding: '80px 40px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                10 ROOMS. 0 MERCY.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Each room is a broken environment. Your job: fix it and escape.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16,
                maxWidth: 1200,
                margin: '0 auto',
              }}
            >
              {ROOMS_PREVIEW.map((room) => (
                <RoomCard key={room.number} room={room} />
              ))}
            </div>
          </motion.section>

          {/* HOW IT WORKS */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: '80px 40px',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                HOW IT WORKS
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 32,
                maxWidth: 1000,
                margin: '0 auto',
              }}
            >
              {[
                {
                  step: '01',
                  icon: '🔐',
                  title: 'Gain System Access',
                  desc: 'Create your developer profile. Your progress, achievements, and XP will be tracked in real-time.',
                },
                {
                  step: '02',
                  icon: '🚪',
                  title: 'Enter the Escape Rooms',
                  desc: 'Start with HTML Island. Work your way to The Mainframe. Each room harder than the last.',
                },
                {
                  step: '03',
                  icon: '🏆',
                  title: 'Solve. Escape. Become Legend.',
                  desc: 'Fix real broken code. Earn XP. Unlock badges. Claim your spot on the global leaderboard.',
                },
              ].map((step) => (
                <motion.div
                  key={step.step}
                  whileHover={{ scale: 1.02 }}
                  className="glass-accent"
                  style={{ borderRadius: 12, padding: 32, textAlign: 'center' }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.65rem',
                      color: 'var(--accent)',
                      letterSpacing: '0.2em',
                      marginBottom: 16,
                    }}
                  >
                    STEP {step.step}
                  </div>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{step.icon}</div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* SURVIVOR LOG */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ padding: '80px 40px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                }}
              >
                SURVIVOR LOG
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>Testimonials from those who made it out.</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
                maxWidth: 1200,
                margin: '0 auto',
              }}
            >
              {SURVIVORS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <SurvivorCard survivor={s} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* LIVE INTRUSION FEED */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              padding: '60px 40px',
              background: '#050508',
              borderTop: '1px solid var(--border)',
              fontFamily: 'var(--font-code)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ color: 'var(--accent)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>[ LIVE_SECURITY_FEED ]</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>UPLINK_STABLE // 128.0.0.1</div>
            </div>
            
            <div style={{ height: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' }}>
              {[
                'BYPASSING FIREWALL... SUCCESS',
                'TRACING IP: 192.168.1.104... LOCATED',
                'DECRYPTING ROOM_08_ACCESS_KEY... [########--] 82%',
                'INJECTING SQL_PAYLOAD... DETECTED',
                'RE-ROUTING TRAFFIC VIA TOR_NODE_99',
                'USER_0x42 JOINED THE MAINFRAME',
                'ALERT: KERNEL_PANIC AVERTED',
                'DUMPING DATABASE_HASHES... COMPLETE',
                'SYSTEM_LOG: UNAUTHORIZED ACCESS AT ROOM_03',
                'CLEANING TRACKS... OK',
              ].map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  style={{ fontSize: '0.8rem', color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 4 }}
                >
                  <span style={{ color: 'var(--accent)', marginRight: 8 }}>{'>'}</span> {log}
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FINAL CTA */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: '100px 40px',
              textAlign: 'center',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                color: 'var(--accent)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              ARE YOU READY, DEVELOPER?
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                marginBottom: 32,
                lineHeight: 1.1,
              }}
            >
              The production server is down.
              <br />
              <span className="text-neon">You are the only hope.</span>
            </h2>
            <Link href="/auth/login">
              <button
                className="btn-primary animate-pulse-neon"
                style={{ fontSize: '1rem', padding: '18px 48px' }}
                onMouseEnter={() => playSound('hover')}
                onClick={() => playSound('click')}
              >
                ⚡ BEGIN THE ESCAPE
              </button>
            </Link>
          </motion.section>

          {/* FOOTER */}
          <footer
            style={{
              padding: '32px 40px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {'>'} DEBUG_ROOM v2.0 — Made by developers. For developers. No designers were harmed.
            </div>
          </footer>
          <SystemControls />
          <CRTOverlay />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
