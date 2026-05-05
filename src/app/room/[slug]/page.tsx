'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
import type { Room, Puzzle, RoomProgress, HintUsage } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

function Timer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const isUrgent = remaining < 60;

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setInterval(() => setRemaining((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.4rem',
        fontWeight: 700,
        color: isUrgent ? 'var(--danger)' : 'var(--accent)',
        textShadow: isUrgent ? 'var(--glow-danger)' : 'var(--glow)',
        letterSpacing: '0.1em',
      }}
    >
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </motion.div>
  );
}

function GhostHint({ hints, usedHints, onUseHint, puzzle }: {
  hints: string[];
  usedHints: HintUsage[];
  onUseHint: (n: 1 | 2 | 3) => void;
  puzzle: Puzzle;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const availableHint = usedHints.length < 3 ? (usedHints.length + 1) as 1 | 2 | 3 : null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost"
        style={{ padding: '8px 16px', fontSize: '0.75rem', borderColor: '#9D4EDD', color: '#9D4EDD' }}
      >
        👻 GHOST HINTS ({3 - usedHints.length} left)
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '110%',
              right: 0,
              width: 320,
              background: 'var(--surface)',
              border: '1px solid #9D4EDD',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 0 30px rgba(157,78,221,0.3)',
              zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>👻</span>
              <div>
                <div style={{ color: '#9D4EDD', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>GHOST</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>AI HINT SYSTEM · -25 XP each</div>
              </div>
            </div>

            {usedHints.map((h) => (
              <div key={h.hint_number} style={{
                padding: '10px 14px',
                background: 'rgba(157,78,221,0.08)',
                border: '1px solid rgba(157,78,221,0.2)',
                borderRadius: 8,
                marginBottom: 8,
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                <span style={{ color: '#9D4EDD', fontSize: '0.65rem', display: 'block', marginBottom: 4 }}>HINT {h.hint_number}</span>
                {hints[h.hint_number - 1]}
              </div>
            ))}

            {availableHint && (
              <button
                onClick={() => { onUseHint(availableHint); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(157,78,221,0.15)',
                  border: '1px solid rgba(157,78,221,0.4)',
                  borderRadius: 8,
                  color: '#9D4EDD',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                REVEAL HINT {availableHint} (-25 XP)
              </button>
            )}
            {!availableHint && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                All hints used. You&apos;re on your own.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [progress, setProgress] = useState<RoomProgress | null>(null);
  const [usedHints, setUsedHints] = useState<HintUsage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'correct' | 'wrong' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPuzzle = puzzles[currentIdx];

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!roomData) { router.push('/hub'); return; }
      setRoom(roomData);

      const { data: puzzleData } = await supabase
        .from('puzzles')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('is_active', true)
        .order('order_index');

      if (puzzleData) {
        setPuzzles(puzzleData);
        setUserCode(puzzleData[0]?.broken_code || '');
      }

      if (user) {
        const { data: prog } = await supabase
          .from('room_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('room_id', roomData.id)
          .single();

        if (prog) {
          setProgress(prog);
          const solved = prog.puzzles_solved || 0;
          const idx = Math.min(solved, (puzzleData?.length || 1) - 1);
          setCurrentIdx(idx);
          setUserCode(puzzleData?.[idx]?.broken_code || '');
        } else {
          await supabase.from('room_progress').upsert({
            user_id: user.id,
            room_id: roomData.id,
            status: 'in_progress',
            puzzles_total: puzzleData?.length || 0,
            time_started_at: new Date().toISOString(),
          });
        }
      }
      setIsLoading(false);
    }
    load();
  }, [slug, router]);

  const handleSubmit = useCallback(async () => {
    if (!currentPuzzle || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    const supabase = createClient();
    let isCorrect = false;

    // Validate answer
    const code = userCode.trim();
    switch (currentPuzzle.validation_type) {
      case 'exact_match':
        isCorrect = code === currentPuzzle.validation_value.trim();
        break;
      case 'contains_check':
        isCorrect = code.includes(currentPuzzle.validation_value);
        break;
      case 'regex_match':
        try {
          isCorrect = new RegExp(currentPuzzle.validation_value, 'gm').test(code);
        } catch { isCorrect = false; }
        break;
      default:
        isCorrect = code.toLowerCase().includes(currentPuzzle.validation_value.toLowerCase());
    }

    if (isCorrect) {
      setCorrectFlash(true);
      setSubmitResult('correct');
      setTimeout(() => setCorrectFlash(false), 600);

      if (userId) {
        await supabase.rpc('complete_puzzle', {
          p_user_id: userId,
          p_puzzle_id: currentPuzzle.id,
          p_wrong_attempts: 0,
          p_hints_used: usedHints.length,
          p_time_taken_seconds: 0,
          p_submitted_code: userCode,
        });
      }

      await new Promise((r) => setTimeout(r, 1000));

      if (currentIdx < puzzles.length - 1) {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setUserCode(puzzles[nextIdx].broken_code);
        setUsedHints([]);
        setSubmitResult(null);
      } else {
        router.push(`/room/${slug}/complete`);
      }
    } else {
      setWrongFlash(true);
      setSubmitResult('wrong');
      setTimeout(() => { setWrongFlash(false); setSubmitResult(null); }, 800);

      if (userId && currentPuzzle) {
        await supabase.from('puzzle_attempts').insert({
          user_id: userId,
          puzzle_id: currentPuzzle.id,
          room_id: room?.id,
          attempt_code: userCode,
          is_correct: false,
          hints_used_count: usedHints.length,
          xp_earned: 0,
          attempt_number: 1,
        });
      }
    }

    setIsSubmitting(false);
  }, [currentPuzzle, isSubmitting, userCode, userId, usedHints, currentIdx, puzzles, room, slug, router]);

  const handleUseHint = useCallback(async (hintNum: 1 | 2 | 3) => {
    if (!userId || !currentPuzzle) return;
    const supabase = createClient();
    const { error } = await supabase.from('hint_usage').insert({
      user_id: userId,
      puzzle_id: currentPuzzle.id,
      hint_number: hintNum,
      xp_deducted: 25,
    });
    if (!error) {
      setUsedHints((prev) => [...prev, {
        id: '', user_id: userId, puzzle_id: currentPuzzle.id,
        hint_number: hintNum, xp_deducted: 25, used_at: new Date().toISOString(),
      }]);
      await supabase.from('users').update({ total_hints_used: (progress?.hints_used || 0) + 1 }).eq('id', userId);
    }
  }, [userId, currentPuzzle, progress]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 50, height: 50, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!room || !currentPuzzle) return null;

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <MatrixRain />

      {/* Flash overlays */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(255,59,59,0.15)', zIndex: 200, pointerEvents: 'none' }} />
        )}
        {correctFlash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,255,136,0.12)', zIndex: 200, pointerEvents: 'none' }} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 20 }}>{room.language_icon}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {room.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Puzzle {currentIdx + 1} / {puzzles.length}
            </div>
          </div>
        </div>

        <Timer seconds={room.time_limit_seconds} onExpire={() => router.push('/hub')} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <GhostHint
            hints={[currentPuzzle.hint_1, currentPuzzle.hint_2, currentPuzzle.hint_3]}
            usedHints={usedHints}
            onUseHint={handleUseHint}
            puzzle={currentPuzzle}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', paddingTop: 70, height: '100vh' }}>
        {/* Left — puzzle info */}
        <div style={{
          width: 380, flexShrink: 0, borderRight: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column',
          overflow: 'auto',
        }}>
          {/* Progress dots */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
            {puzzles.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i < currentIdx ? 'var(--accent)' : i === currentIdx ? 'var(--warning)' : 'var(--border)',
                boxShadow: i === currentIdx ? '0 0 8px var(--warning)' : 'none',
              }} />
            ))}
          </div>

          <div style={{ padding: 24, flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 8 }}>
              PUZZLE {currentIdx + 1}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12, color: 'var(--text-primary)' }}>
              {currentPuzzle.title}
            </h2>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic', lineHeight: 1.6 }}>
              {currentPuzzle.story_context}
            </div>

            <div style={{ padding: 16, background: 'rgba(0,217,255,0.05)', border: '1px solid rgba(0,217,255,0.15)', borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-2)', fontFamily: 'var(--font-display)', marginBottom: 8, letterSpacing: '0.1em' }}>
                MISSION
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {currentPuzzle.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-info">{currentPuzzle.language}</span>
              <span className="badge badge-warning">+{currentPuzzle.xp_reward} XP</span>
              <span className="badge badge-muted">{Math.floor(currentPuzzle.time_limit_seconds / 60)}m limit</span>
            </div>
          </div>

          {/* Submit result feedback */}
          <AnimatePresence>
            {submitResult === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ margin: '0 20px 20px', padding: 14, background: 'rgba(255,59,59,0.1)', border: '1px solid var(--danger)', borderRadius: 8 }}
              >
                <div style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
                  ✗ INCORRECT
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Check the logic again. The bug is still there.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — code editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D0D0D' }}>
          <div style={{
            padding: '10px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)',
          }}>
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-code)', marginLeft: 8 }}>
              solution.{currentPuzzle.language.toLowerCase().replace(/[^a-z]/g, '')}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <MonacoEditor
              height="100%"
              language={currentPuzzle.language.toLowerCase().includes('type') ? 'typescript'
                : currentPuzzle.language.toLowerCase().includes('python') ? 'python'
                : currentPuzzle.language.toLowerCase().includes('css') ? 'css'
                : currentPuzzle.language.toLowerCase().includes('html') ? 'html'
                : currentPuzzle.language.toLowerCase().includes('sql') ? 'sql'
                : 'javascript'}
              value={userCode}
              onChange={(v) => setUserCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                wordWrap: 'on',
                padding: { top: 16 },
                cursorBlinking: 'smooth',
              }}
            />
          </div>

          <div style={{
            padding: '16px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface)',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-code)' }}>
              Fix the bug and submit your solution
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setUserCode(currentPuzzle.broken_code)}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: '0.75rem' }}
              >
                RESET
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '10px 28px', fontSize: '0.85rem', opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? 'CHECKING...' : '⚡ SUBMIT FIX'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
