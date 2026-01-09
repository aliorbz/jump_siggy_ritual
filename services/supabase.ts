
import { Player } from '../types';

// Mock implementation using localStorage for immediate playability
export const supabaseService = {
  async getPlayer(sessionId: string): Promise<Player | null> {
    const data = localStorage.getItem(`jumpsiggy_player_${sessionId}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  async upsertPlayer(name: string, sessionId: string): Promise<Player> {
    const existing = await this.getPlayer(sessionId);
    const player: Player = {
      session_id: sessionId,
      name: name,
      best_score: existing ? existing.best_score : 0,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(`jumpsiggy_player_${sessionId}`, JSON.stringify(player));
    this.updateGlobalLeaderboard(player);
    return player;
  },

  async submitScore(sessionId: string, name: string, score: number): Promise<void> {
    const player = await this.getPlayer(sessionId);
    if (player && score > player.best_score) {
      player.best_score = score;
      player.updated_at = new Date().toISOString();
      localStorage.setItem(`jumpsiggy_player_${sessionId}`, JSON.stringify(player));
      this.updateGlobalLeaderboard(player);
    }
  },

  async getLeaderboard(): Promise<Player[]> {
    const data = localStorage.getItem('jumpsiggy_global_leaderboard');
    if (!data) return [];
    return JSON.parse(data);
  },

  // Helper for mock persistence of multiple players on same device
  updateGlobalLeaderboard(player: Player) {
    const data = localStorage.getItem('jumpsiggy_global_leaderboard');
    let lb: Player[] = data ? JSON.parse(data) : [];
    const index = lb.findIndex(p => p.session_id === player.session_id);
    if (index > -1) {
      lb[index] = player;
    } else {
      lb.push(player);
    }
    lb.sort((a, b) => b.best_score - a.best_score);
    localStorage.setItem('jumpsiggy_global_leaderboard', JSON.stringify(lb.slice(0, 50)));
  }
};
