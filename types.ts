
export type GameState = 'idle' | 'countdown' | 'running' | 'gameover';

export interface Player {
  session_id: string;
  name: string;
  best_score: number;
  updated_at: string;
}

export interface ScoreEntry {
  id: string;
  session_id: string;
  name: string;
  score: number;
  created_at: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}
