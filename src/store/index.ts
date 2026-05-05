import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Room, RoomProgress, GameState, PersonalityType } from '@/types';

// ============================================================
// THEME STORE
// ============================================================
export type Theme =
  | 'dark_hacker'
  | 'ocean_blue'
  | 'midnight_purple'
  | 'synthwave'
  | 'minimal_white'
  | 'forest_green'
  | 'sunset_orange'
  | 'soft_pink'
  | 'terminal_green'
  | 'deep_space';

export const THEMES: Record<Theme, { label: string; bg: string; accent: string; preview: string }> = {
  dark_hacker: { label: 'Dark Hacker', bg: '#0A0A0F', accent: '#00FF88', preview: '#00FF88' },
  ocean_blue: { label: 'Ocean Blue', bg: '#050D1A', accent: '#00D9FF', preview: '#00D9FF' },
  midnight_purple: { label: 'Midnight Purple', bg: '#0A0512', accent: '#9D4EDD', preview: '#9D4EDD' },
  synthwave: { label: 'Synthwave', bg: '#0D0021', accent: '#FF2D78', preview: '#FF2D78' },
  minimal_white: { label: 'Minimal White', bg: '#F8F8F8', accent: '#1A1A2E', preview: '#1A1A2E' },
  forest_green: { label: 'Forest Green', bg: '#030D0A', accent: '#00CC77', preview: '#00CC77' },
  sunset_orange: { label: 'Sunset Orange', bg: '#0D0500', accent: '#FF6B2C', preview: '#FF6B2C' },
  soft_pink: { label: 'Soft Pink', bg: '#0D040A', accent: '#FF69B4', preview: '#FF69B4' },
  terminal_green: { label: 'Terminal Green', bg: '#001200', accent: '#39FF14', preview: '#39FF14' },
  deep_space: { label: 'Deep Space', bg: '#00000A', accent: '#4FC3F7', preview: '#4FC3F7' },
};

interface ThemeStore {
  theme: Theme;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  uiDensity: 'compact' | 'comfortable' | 'spacious';
  fontStyle: 'mono' | 'sans' | 'serif';
  setTheme: (theme: Theme) => void;
  setSoundEnabled: (v: boolean) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setUiDensity: (v: 'compact' | 'comfortable' | 'spacious') => void;
  setFontStyle: (v: 'mono' | 'sans' | 'serif') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark_hacker',
      soundEnabled: true,
      animationsEnabled: true,
      uiDensity: 'comfortable',
      fontStyle: 'mono',
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setUiDensity: (uiDensity) => set({ uiDensity }),
      setFontStyle: (fontStyle) => set({ fontStyle }),
    }),
    { name: 'debug-room-theme' }
  )
);

// ============================================================
// USER STORE
// ============================================================
interface UserStore {
  user: User | null;
  roomProgress: RoomProgress[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRoomProgress: (progress: RoomProgress[]) => void;
  setIsLoading: (v: boolean) => void;
  updateXP: (xp: number) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  roomProgress: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setRoomProgress: (roomProgress) => set({ roomProgress }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateXP: (xp) =>
    set((state) => ({
      user: state.user ? { ...state.user, xp: state.user.xp + xp } : null,
    })),
}));

// ============================================================
// GAME STORE
// ============================================================
interface GameStore {
  gameState: GameState;
  currentRoom: Room | null;
  puzzleResults: { puzzleId: string; correct: boolean; xpEarned: number }[];
  setGameState: (state: Partial<GameState>) => void;
  setCurrentRoom: (room: Room | null) => void;
  addPuzzleResult: (result: { puzzleId: string; correct: boolean; xpEarned: number }) => void;
  resetGame: () => void;
}

const defaultGameState: GameState = {
  currentRoom: null,
  currentPuzzleIndex: 0,
  sessionToken: null,
  timeRemaining: 0,
  hintsUsed: 0,
  wrongAttempts: 0,
  userCode: '',
  isSubmitting: false,
  showHint: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: defaultGameState,
  currentRoom: null,
  puzzleResults: [],
  setGameState: (state) =>
    set((prev) => ({ gameState: { ...prev.gameState, ...state } })),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  addPuzzleResult: (result) =>
    set((prev) => ({ puzzleResults: [...prev.puzzleResults, result] })),
  resetGame: () =>
    set({ gameState: defaultGameState, currentRoom: null, puzzleResults: [] }),
}));

// ============================================================
// PERSONALITY TEST STORE
// ============================================================
interface PersonalityStore {
  answers: Record<number, string>;
  currentQuestion: number;
  isComplete: boolean;
  result: PersonalityType | null;
  score: number | null;
  setAnswer: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setResult: (type: PersonalityType, score: number) => void;
  reset: () => void;
}

export const usePersonalityStore = create<PersonalityStore>((set) => ({
  answers: {},
  currentQuestion: 1,
  isComplete: false,
  result: null,
  score: null,
  setAnswer: (questionId, answer) =>
    set((prev) => ({ answers: { ...prev.answers, [questionId]: answer } })),
  nextQuestion: () =>
    set((prev) => ({
      currentQuestion: Math.min(10, prev.currentQuestion + 1),
      isComplete: prev.currentQuestion >= 10,
    })),
  prevQuestion: () =>
    set((prev) => ({ currentQuestion: Math.max(1, prev.currentQuestion - 1) })),
  setResult: (result, score) => set({ result, score, isComplete: true }),
  reset: () =>
    set({ answers: {}, currentQuestion: 1, isComplete: false, result: null, score: null }),
}));

// ============================================================
// UI STORE
// ============================================================
interface UIStore {
  isThemePanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  isBootSequenceDone: boolean;
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  setThemePanelOpen: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setBootSequenceDone: (v: boolean) => void;
  addNotification: (n: { message: string; type: 'success' | 'error' | 'info' }) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isThemePanelOpen: false,
  isCommandPaletteOpen: false,
  isBootSequenceDone: false,
  notifications: [],
  setThemePanelOpen: (isThemePanelOpen) => set({ isThemePanelOpen }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setBootSequenceDone: (isBootSequenceDone) => set({ isBootSequenceDone }),
  addNotification: (n) =>
    set((prev) => ({
      notifications: [...prev.notifications, { ...n, id: Math.random().toString(36) }],
    })),
  removeNotification: (id) =>
    set((prev) => ({ notifications: prev.notifications.filter((n) => n.id !== id) })),
}));
