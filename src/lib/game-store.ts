import { create } from 'zustand';
import { toast } from 'sonner';
export type GameStatus = 'playing' | 'loading' | 'results' | 'error';
export interface Challenge {
  id: string;
  imageUrl: string;
  date?: string;
}
export interface ScoreResult {
  score: number;
  matchedWords: string[];
  totalWords: number;
  originalPrompt: string;
}
export interface LeaderboardEntry {
  name: string;
  score: number;
}
export interface PastChallenge extends Challenge {
  prompt: string;
}
interface GameState {
  gameStatus: GameStatus;
  gameMode: 'daily' | 'past' | 'tryAgain';
  dailyChallenge: Challenge | null;
  activeChallenge: Challenge | null; // Can be daily or a past challenge
  score: ScoreResult | null;
  error: string | null;
  leaderboard: LeaderboardEntry[] | null;
  pastChallenges: PastChallenge[] | null;
  isSubmittingScore: boolean;
  hints: string[];
  hintPenalty: number;
  fetchDailyChallenge: () => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  startNewGame: () => void;
  fetchLeaderboard: () => Promise<void>;
  fetchPastChallenges: () => Promise<void>;
  openSubmitScoreDialog: () => void;
  closeSubmitScoreDialog: () => void;
  submitScore: (name: string) => Promise<void>;
  getHint: () => Promise<void>;
  playPastChallenge: (challenge: PastChallenge) => void;
  tryAgain: () => void;
}
export const useGameStore = create<GameState>((set, get) => ({
  gameStatus: 'loading',
  gameMode: 'daily',
  dailyChallenge: null,
  activeChallenge: null,
  score: null,
  error: null,
  leaderboard: null,
  pastChallenges: null,
  isSubmittingScore: false,
  hints: [],
  hintPenalty: 0,
  fetchDailyChallenge: async () => {
    set({ gameStatus: 'loading', error: null, hints: [], hintPenalty: 0, gameMode: 'daily' });
    try {
      const response = await fetch('/api/game/daily');
      if (!response.ok) throw new Error('Failed to fetch the daily challenge.');
      const data: Challenge = await response.json();
      set({ dailyChallenge: data, activeChallenge: data, gameStatus: 'playing' });
    } catch (error) {
      console.error(error);
      set({ gameStatus: 'error', error: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
  },
  submitGuess: async (guess: string) => {
    const { activeChallenge, hintPenalty, hints } = get();
    if (!activeChallenge) return;
    set({ gameStatus: 'loading', error: null });
    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, challengeId: activeChallenge.id, hintPenalty, hints }),
      });
      if (!response.ok) throw new Error('Failed to submit your guess.');
      const data: ScoreResult = await response.json();
      set({ score: data, gameStatus: 'results' });
      // Only open submit score dialog for the daily challenge
      if (data.score > 50 && activeChallenge.id === get().dailyChallenge?.id) {
        set({ isSubmittingScore: true });
      }
    } catch (error) {
      console.error(error);
      set({ gameStatus: 'error', error: error instanceof Error ? error.message : 'An unknown error occurred.' });
    }
  },
  startNewGame: () => {
    set({ gameStatus: 'loading', score: null, error: null, activeChallenge: null, gameMode: 'daily' });
    get().fetchDailyChallenge();
  },
  fetchLeaderboard: async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/game/leaderboard/${date}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard.');
      const data: LeaderboardEntry[] = await response.json();
      set({ leaderboard: data });
    } catch (error) {
      console.error(error);
      toast.error("Could not load today's leaderboard.");
    }
  },
  fetchPastChallenges: async () => {
    try {
      const response = await fetch('/api/game/archive');
      if (!response.ok) throw new Error('Failed to fetch past challenges.');
      const data: PastChallenge[] = await response.json();
      set({ pastChallenges: data });
    } catch (error) {
      console.error(error);
      toast.error('Could not load past challenges.');
    }
  },
  openSubmitScoreDialog: () => set({ isSubmittingScore: true }),
  closeSubmitScoreDialog: () => set({ isSubmittingScore: false }),
  submitScore: async (name: string) => {
    const score = get().score?.score;
    if (score === undefined) return;
    try {
      const response = await fetch('/api/game/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score }),
      });
      if (!response.ok) throw new Error('Failed to submit score.');
      toast.success('Your score has been submitted!');
      get().closeSubmitScoreDialog();
      get().fetchLeaderboard(); // Refresh leaderboard
    } catch (error) {
      console.error(error);
      toast.error('Could not submit your score.');
    }
  },
  getHint: async () => {
    const { activeChallenge, hints } = get();
    if (!activeChallenge) return;
    try {
      const response = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: activeChallenge.id, usedHints: hints }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a hint.');
      }
      const { hint } = await response.json();
      if (hint) {
        set(state => ({
          hints: [...state.hints, hint],
          hintPenalty: state.hintPenalty + 5, // 5% penalty per hint
        }));
        toast.info(`Hint revealed! -5% score penalty.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred while getting a hint.');
    }
  },
  playPastChallenge: (challenge: PastChallenge) => {
    set({
      activeChallenge: { id: challenge.id, imageUrl: challenge.imageUrl },
      gameStatus: 'playing',
      score: null,
      error: null,
      hints: [],
      hintPenalty: 0,
      gameMode: 'past',
    });
  },
  tryAgain: () => {
    set({
      gameStatus: 'playing',
      score: null,
      error: null,
      hints: [],
      hintPenalty: 0,
      gameMode: 'tryAgain',
    });
  },
}));