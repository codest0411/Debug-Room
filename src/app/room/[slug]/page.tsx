'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
              top: 'calc(100% + 12px)',
              right: 0,
              width: 320,
              background: 'rgba(15, 15, 25, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #9D4EDD',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(157,78,221,0.2)',
              zIndex: 1000,
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
  const [ghostReaction, setGhostReaction] = useState<string | null>(null);
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
          // Sync puzzles_total if room configuration changed
          if (prog.puzzles_total !== (puzzleData?.length || 0)) {
            await supabase.from('room_progress').update({ puzzles_total: puzzleData?.length || 0 }).eq('id', prog.id);
          }
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
    const code = userCode.trim().replace(/\s+/g, ' ');
    const target = currentPuzzle.validation_value.trim().replace(/\s+/g, ' ');

    switch (currentPuzzle.validation_type) {
      case 'exact_match':
        isCorrect = code === target;
        break;
      case 'contains_check':
        // For contains_check, we also try a more flexible search
        isCorrect = userCode.replace(/\s+/g, '').includes(currentPuzzle.validation_value.replace(/\s+/g, ''));
        break;
      case 'regex_match':
        try {
          isCorrect = new RegExp(currentPuzzle.validation_value, 'gm').test(userCode);
        } catch { isCorrect = false; }
        break;
      default:
        isCorrect = userCode.toLowerCase().includes(currentPuzzle.validation_value.toLowerCase());
    }

    if (isCorrect) {
      setCorrectFlash(true);
      setSubmitResult('correct');
      setTimeout(() => setCorrectFlash(false), 600);

      if (userId) {
        // Check if already solved to prevent double counting stats
        const { data: existingSuccess } = await supabase
          .from('puzzle_attempts')
          .select('id')
          .eq('user_id', userId)
          .eq('puzzle_id', currentPuzzle.id)
          .eq('is_correct', true)
          .single();

        if (!existingSuccess) {
          // Manually update progress to ensure it's not stuck in "In Progress"
          await supabase.rpc('complete_puzzle', {
            p_user_id: userId,
            p_puzzle_id: currentPuzzle.id,
            p_wrong_attempts: 0,
            p_hints_used: usedHints.length,
            p_time_taken_seconds: 0,
            p_submitted_code: userCode,
          });
        }

        if (room) {
          const { data: currentProg } = await supabase
            .from('room_progress')
            .select('status, puzzles_solved')
            .eq('user_id', userId)
            .eq('room_id', room.id)
            .single();

          const solvedCount = Math.min(Math.max(currentIdx + 1, currentProg?.puzzles_solved || 0), puzzles.length);
          const isLastPuzzle = currentIdx === puzzles.length - 1;
          const newStatus = (isLastPuzzle || currentProg?.status === 'completed' || currentProg?.status === 'perfect') 
            ? 'completed' 
            : 'in_progress';

          await supabase.from('room_progress').upsert({
            user_id: userId,
            room_id: room.id,
            puzzles_solved: solvedCount,
            status: newStatus,
            last_played_at: new Date().toISOString(),
            ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
          });

          // If room completed, update the total count in users table
          if (newStatus === 'completed' || (solvedCount >= (puzzles?.length || 0))) {
            const { data: allProg } = await supabase
              .from('room_progress')
              .select('*')
              .eq('user_id', userId);
            
            const count = (allProg || []).filter(p => 
              p.status === 'completed' || 
              p.status === 'perfect' || 
              (p.puzzles_solved >= p.puzzles_total && p.puzzles_total > 0)
            ).length;
            
            await supabase.from('users').update({ 
              total_rooms_completed: count,
              last_active_at: new Date().toISOString()
            }).eq('id', userId);
          }
        }
      }

      await new Promise((r) => setTimeout(r, 1500));

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
      
      const ghostInsults = [
        "Is that the best you can do? A literal script kiddie could do better.",
        "Logic error. Again. Do you even know what a compiler is?",
        "Wrong. Try thinking for once.",
        "The mainframe laughs at your pathetic attempt."
      ];
      const selected = ghostInsults[Math.floor(Math.random() * ghostInsults.length)];
      setGhostReaction(selected);

      setTimeout(() => { 
        setWrongFlash(false); 
        setSubmitResult(null); 
        setGhostReaction(null);
      }, 3000);

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <div className="animate-pulse-neon" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>LOADING ENVIRONMENT...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#888', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
        <h2 style={{ color: '#F0F0F0', fontFamily: 'var(--font-display)', marginBottom: 12 }}>Environment Offline</h2>
        <p style={{ maxWidth: 400, fontSize: '0.9rem', lineHeight: 1.6 }}>The slug "{slug}" does not match any active mainframe environments. It may have been relocated or purged.</p>
        <Link href="/hub">
          <button className="btn-ghost" style={{ marginTop: 24 }}>RETURN TO HUB</button>
        </Link>
      </div>
    );
  }

  if (puzzles.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#888', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚧</div>
        <h2 style={{ color: '#F0F0F0', fontFamily: 'var(--font-display)', marginBottom: 12 }}>{room.name.toUpperCase()} Empty</h2>
        <p style={{ maxWidth: 400, fontSize: '0.9rem', lineHeight: 1.6 }}>This environment is active but contains no logic puzzles. Access the Admin Panel to populate the room core.</p>
        <Link href="/hub">
          <button className="btn-ghost" style={{ marginTop: 24 }}>RETURN TO HUB</button>
        </Link>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <div className="animate-pulse-neon" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>SYNCHRONIZING CORE...</div>
      </div>
    );
  }

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
      <div className="game-layout" style={{ flex: 1, display: 'flex', paddingTop: 70, height: '100vh' }}>
        {/* Left — puzzle info */}
        <div className="game-sidebar" style={{
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

            <div style={{ 
              marginBottom: 24, 
              padding: 20, 
              background: 'rgba(0,255,136,0.03)', 
              border: '1px solid rgba(0,255,136,0.1)', 
              borderRadius: 12,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: 'var(--accent)' }} />
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 8px var(--accent))' }}>👻</div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginBottom: 4 }}>GHOST_AI // LOG_ENTRY</div>
                  <div style={{ fontSize: '0.85rem', color: '#EEE', lineHeight: 1.5, fontStyle: 'italic', fontFamily: 'var(--font-code)' }}>
                    "{currentPuzzle.story_context}"
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 8 }}>
                OBJECTIVE_SIG
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: 12, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {currentPuzzle.title}
              </h2>

              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 20 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {currentPuzzle.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.2)', color: '#00D9FF', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-code)' }}>
                  {currentPuzzle.language.toUpperCase()}
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-code)' }}>
                  +{currentPuzzle.xp_reward} XP
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-code)' }}>
                  {Math.floor(currentPuzzle.time_limit_seconds / 60)}M LIMIT
                </span>
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
                {ghostReaction && (
                  <div style={{ color: '#EEE', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: 4 }}>
                    "{ghostReaction}"
                  </div>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  Check the logic again. The bug is still there.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — editor & preview */}
        <div className="game-editor-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
