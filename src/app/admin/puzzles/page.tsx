'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import Editor from '@monaco-editor/react';

export default function AdminPuzzlesPage() {
  const [rooms, setRooms] = useState<{id: string, name: string}[]>([]);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadInitial() {
      const { data: roomData } = await supabase.from('rooms').select('id, name').order('room_number');
      if (roomData) setRooms(roomData);
      loadPuzzles();
    }
    loadInitial();
  }, []);

  async function loadPuzzles() {
    setIsLoading(true);
    let query = supabase.from('puzzles').select('*, room:room_id(name)').order('room_id').order('puzzle_number');
    if (selectedRoom !== 'all') {
      query = query.eq('room_id', selectedRoom);
    }
    const { data } = await query;
    if (data) setPuzzles(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadPuzzles();
  }, [selectedRoom]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPuzzle) return;

    const { room, ...saveData } = editingPuzzle;

    const { error } = await supabase.from('puzzles').upsert({
      ...saveData,
      puzzle_number: Number(saveData.puzzle_number),
      difficulty: Number(saveData.difficulty),
      order_index: Number(saveData.order_index || saveData.puzzle_number),
      xp_reward: Number(saveData.xp_reward || 50),
      xp_penalty_wrong: Number(saveData.xp_penalty_wrong || 5),
      xp_penalty_hint: Number(saveData.xp_penalty_hint || 25),
      time_limit_seconds: Number(saveData.time_limit_seconds || 300),
    });

    if (error) {
      alert('Error saving puzzle: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingPuzzle(null);
      loadPuzzles();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('puzzles').delete().eq('id', id);
    if (error) alert(error.message);
    else loadPuzzles();
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 1400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>Puzzle Management</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#555' }}>Configure logic and content for every room.</p>
              <select 
                value={selectedRoom} 
                onChange={(e) => setSelectedRoom(e.target.value)}
                style={{ background: '#161616', border: '1px solid #2A2A2A', color: '#888', fontSize: '0.7rem', padding: '4px 8px', borderRadius: 4 }}
              >
                <option value="all">All Rooms</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={() => { setEditingPuzzle({ room_id: rooms[0]?.id, puzzle_number: 1, difficulty: 1, validation_type: 'exact_match', is_active: true, language: 'javascript' }); setIsModalOpen(true); }}
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            + CREATE PUZZLE
          </button>
        </div>

        <div className="table-responsive" style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Room', '#', 'Title', 'Language', 'Validation', 'Reward', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A1A1A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: 12 }}><div className="skeleton" style={{ height: 24, borderRadius: 4 }} /></td></tr>
                ))
              ) : puzzles.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #111' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A1A')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#888' }}>{p.room?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#00FF88', fontFamily: 'monospace' }}>{p.puzzle_number}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#F0F0F0', fontWeight: 500 }}>{p.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#555' }}>
                    <span style={{ padding: '2px 6px', border: '1px solid #2A2A2A', borderRadius: 4, fontSize: '0.6rem' }}>{p.language.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#666' }}>{p.validation_type}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#9D4EDD', fontFamily: 'monospace' }}>{p.xp_reward} XP</td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(p.correct_solution);
                        setCopiedId(p.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }} 
                      style={{ background: 'none', border: 'none', color: copiedId === p.id ? '#00FF88' : '#888', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {copiedId === p.id ? '✓ Copied' : '📄 Copy Ans'}
                    </button>
                    <button onClick={() => { setEditingPuzzle(p); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#FF4444', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {!isLoading && !puzzles.length && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>No puzzles found. Click "Create Puzzle" to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal (Large Slide-over) */}
        <AnimatePresence>
          {isModalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
              />
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ position: 'relative', width: '100%', maxWidth: 1000, background: '#161616', borderLeft: '1px solid #2A2A2A', padding: 0, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ padding: '20px 32px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F0F0F0' }}>{editingPuzzle?.id ? 'Edit Puzzle' : 'Create New Puzzle'}</h2>
                  <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>

                <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 32 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Room</label>
                      <select required value={editingPuzzle?.room_id || ''} onChange={e => setEditingPuzzle({...editingPuzzle, room_id: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }}>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Puzzle #</label>
                      <input type="number" required min={1} max={10} value={editingPuzzle?.puzzle_number || ''} onChange={e => setEditingPuzzle({...editingPuzzle, puzzle_number: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Language</label>
                      <select required value={editingPuzzle?.language || 'javascript'} onChange={e => setEditingPuzzle({...editingPuzzle, language: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }}>
                        {['javascript', 'typescript', 'html', 'css', 'python', 'sql'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Puzzle Title</label>
                      <input type="text" required value={editingPuzzle?.title || ''} onChange={e => setEditingPuzzle({...editingPuzzle, title: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Difficulty (1-6)</label>
                      <input type="number" required min={1} max={6} value={editingPuzzle?.difficulty || 1} onChange={e => setEditingPuzzle({...editingPuzzle, difficulty: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Description & Story Context</label>
                    <textarea rows={3} required value={editingPuzzle?.description || ''} onChange={e => setEditingPuzzle({...editingPuzzle, description: e.target.value})} placeholder="Main description..." style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0', marginBottom: 12 }} />
                    <textarea rows={2} required value={editingPuzzle?.story_context || ''} onChange={e => setEditingPuzzle({...editingPuzzle, story_context: e.target.value})} placeholder="Story context / Ghost AI dialogue..." style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>

                  {/* Editors */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32, height: 400 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Broken Code (Initial)</label>
                      <div style={{ flex: 1, border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
                        <Editor
                          theme="vs-dark"
                          language={editingPuzzle?.language || 'javascript'}
                          value={editingPuzzle?.broken_code || ''}
                          onChange={(v) => setEditingPuzzle({...editingPuzzle, broken_code: v})}
                          options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Correct Solution (Reference)</label>
                      <div style={{ flex: 1, border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
                        <Editor
                          theme="vs-dark"
                          language={editingPuzzle?.language || 'javascript'}
                          value={editingPuzzle?.correct_solution || ''}
                          onChange={(v) => setEditingPuzzle({...editingPuzzle, correct_solution: v})}
                          options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Validation Type</label>
                      <select required value={editingPuzzle?.validation_type || 'exact_match'} onChange={e => setEditingPuzzle({...editingPuzzle, validation_type: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }}>
                        <option value="exact_match">Exact Match</option>
                        <option value="contains_check">Contains Check</option>
                        <option value="regex_match">Regex Match</option>
                        <option value="output_match">Output Match</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Validation Value</label>
                      <input type="text" required value={editingPuzzle?.validation_value || ''} onChange={e => setEditingPuzzle({...editingPuzzle, validation_value: e.target.value})} placeholder="String, Regex, or expected Output" style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Hint 1 (Vague)</label>
                      <textarea rows={2} value={editingPuzzle?.hint_1 || ''} onChange={e => setEditingPuzzle({...editingPuzzle, hint_1: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Hint 2 (Direct)</label>
                      <textarea rows={2} value={editingPuzzle?.hint_2 || ''} onChange={e => setEditingPuzzle({...editingPuzzle, hint_2: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Hint 3 (Solution-ish)</label>
                      <textarea rows={2} value={editingPuzzle?.hint_3 || ''} onChange={e => setEditingPuzzle({...editingPuzzle, hint_3: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px' }}>SAVE PUZZLE</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 0.5, padding: '16px', background: 'transparent', border: '1px solid #2A2A2A', color: '#666', borderRadius: 6, cursor: 'pointer' }}>CANCEL</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminShell>
  );
}
