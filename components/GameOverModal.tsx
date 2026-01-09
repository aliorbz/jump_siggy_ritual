
import React from 'react';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  onRetry: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, bestScore, onRetry, onLeaderboard, onHome }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-[#39FF14] p-8 rounded-lg text-center shadow-[0_0_40px_rgba(57,255,20,0.4)]">
        <h2 className="ritual-font text-4xl text-red-600 mb-2 neon-glow tracking-tighter animate-pulse">
          RITUAL BROKEN
        </h2>
        <div className="h-px w-full bg-[#39FF14]/30 my-6"></div>
        
        <div className="flex justify-around mb-8">
            <div>
                <p className="text-zinc-500 uppercase text-xs tracking-widest mb-1">Score</p>
                <p className="ritual-font text-5xl text-white">{score}</p>
            </div>
            <div>
                <p className="text-zinc-500 uppercase text-xs tracking-widest mb-1">Eldest Record</p>
                <p className="ritual-font text-5xl text-[#39FF14]">{bestScore}</p>
            </div>
        </div>

        <div className="space-y-4">
            <button
                onClick={onRetry}
                className="w-full py-4 bg-[#39FF14] text-black font-black uppercase tracking-widest rounded hover:bg-white transition-all shadow-[0_0_15px_#39FF14]"
            >
                Resurrect
            </button>
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onLeaderboard}
                    className="py-3 border border-[#39FF14] text-[#39FF14] uppercase text-sm font-bold tracking-widest hover:bg-[#39FF14]/10 rounded"
                >
                    Ledger
                </button>
                <button
                    onClick={onHome}
                    className="py-3 border border-zinc-600 text-zinc-400 uppercase text-sm font-bold tracking-widest hover:text-white rounded"
                >
                    Escape
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
