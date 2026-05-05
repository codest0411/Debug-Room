'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import { Room } from '@/types';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);

  const supabase = createClient();

  async function loadRooms() {
    setIsLoading(true);
    const { data } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });
    if (data) setRooms(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRoom) return;

    const roomData = {
      ...editingRoom,
      room_number: Number(editingRoom.room_number),
      total_puzzles: Number(editingRoom.total_puzzles),
      difficulty: Number(editingRoom.difficulty),
      order_index: Number(editingRoom.order_index || editingRoom.room_number),
    };

    const { error } = await supabase.from('rooms').upsert(roomData);

    if (error) {
      alert('Error saving room: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingRoom(null);
      loadRooms();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This will delete the room and all its puzzles.')) return;
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) alert(error.message);
    else loadRooms();
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>Room Management</h1>
            <p style={{ fontSize: '0.75rem', color: '#555' }}>Manage escape room environments and metadata.</p>
          </div>
          <button 
            onClick={() => { setEditingRoom({ is_active: true, difficulty: 1, total_puzzles: 5 }); setIsModalOpen(true); }}
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            + CREATE ROOM
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {rooms.map((room) => (
              <div 
                key={room.id}
                style={{ 
                  background: '#161616', 
                  border: '1px solid #2A2A2A', 
                  borderRadius: 8, 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ padding: 16, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.65rem', color: '#00FF88', fontFamily: 'monospace', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      ROOM {room.room_number}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: room.is_active ? '#00FF88' : '#FF4444' }}>
                      {room.is_active ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>{room.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: 12 }}>{room.subtitle}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div className="badge badge-outline" style={{ fontSize: '0.6rem' }}>{room.language}</div>
                    <div className="badge badge-outline" style={{ fontSize: '0.6rem' }}>{room.difficulty_label}</div>
                    <div className="badge badge-outline" style={{ fontSize: '0.6rem', borderColor: '#9D4EDD', color: '#9D4EDD' }}>{room.total_puzzles} PUZZLES</div>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', background: '#1A1A1A', borderTop: '1px solid #222', display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => { setEditingRoom(room); setIsModalOpen(true); }}
                    style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    EDIT
                  </button>
                  <button 
                    onClick={() => handleDelete(room.id)}
                    style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #333', color: '#FF4444', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{ position: 'relative', width: '100%', maxWidth: 600, background: '#161616', border: '1px solid #2A2A2A', borderRadius: 12, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 24 }}>
                  {editingRoom?.id ? 'Edit Room' : 'Create New Room'}
                </h2>
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Room Number</label>
                    <input type="number" required value={editingRoom?.room_number || ''} onChange={e => setEditingRoom({...editingRoom, room_number: Number(e.target.value)})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Slug (e.g. html-island)</label>
                    <input type="text" required value={editingRoom?.slug || ''} onChange={e => setEditingRoom({...editingRoom, slug: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Room Name</label>
                    <input type="text" required value={editingRoom?.name || ''} onChange={e => setEditingRoom({...editingRoom, name: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Subtitle</label>
                    <input type="text" value={editingRoom?.subtitle || ''} onChange={e => setEditingRoom({...editingRoom, subtitle: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Description</label>
                    <textarea rows={3} value={editingRoom?.description || ''} onChange={e => setEditingRoom({...editingRoom, description: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0', resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Language</label>
                    <input type="text" value={editingRoom?.language || ''} onChange={e => setEditingRoom({...editingRoom, language: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Language Icon</label>
                    <input type="text" value={editingRoom?.language_icon || ''} onChange={e => setEditingRoom({...editingRoom, language_icon: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Difficulty (1-6)</label>
                    <input type="number" min={1} max={6} value={editingRoom?.difficulty || 1} onChange={e => setEditingRoom({...editingRoom, difficulty: Number(e.target.value)})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Difficulty Label</label>
                    <input type="text" value={editingRoom?.difficulty_label || ''} onChange={e => setEditingRoom({...editingRoom, difficulty_label: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Theme Color (Hex)</label>
                    <input type="text" value={editingRoom?.theme_color || '#00FF88'} onChange={e => setEditingRoom({...editingRoom, theme_color: e.target.value})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>Total Puzzles</label>
                    <input type="number" value={editingRoom?.total_puzzles || 5} onChange={e => setEditingRoom({...editingRoom, total_puzzles: Number(e.target.value)})} style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2A2A2A', padding: '10px', borderRadius: 6, color: '#F0F0F0' }} />
                  </div>

                  <div style={{ gridColumn: 'span 2', marginTop: 12, display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>SAVE ROOM</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #2A2A2A', color: '#666', borderRadius: 6, cursor: 'pointer' }}>CANCEL</button>
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
