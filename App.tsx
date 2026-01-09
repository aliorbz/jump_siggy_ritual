
import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { NameModal } from './components/NameModal';
import { CountdownOverlay } from './components/CountdownOverlay';
import { GameOverModal } from './components/GameOverModal';
import { GameState, Player } from './types';
import { supabaseService } from './services/supabase';

const SYMBOL_URL = 'https://pbs.twimg.com/profile_images/1912582510631858176/-Xbw2AcT_400x400.jpg';

const UniversalFooter: React.FC = () => (
  <footer className="fixed bottom-4 left-0 right-0 z-[60] flex items-center justify-center gap-3 pointer-events-none">
    <div className="flex items-center gap-3 pointer-events-auto bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 shadow-xl">
      <img 
        src="https://pbs.twimg.com/profile_images/1801955577763094529/5qtIvl5X_400x400.jpg" 
        alt="void" 
        className="w-6 h-6 rounded-full border border-[#39FF14]/30"
      />
      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-medium">
        EVOKED FROM THE VOID BY 
        <a 
          href="https://x.com/aliorbz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 text-zinc-300 hover:text-[#39FF14] transition-all duration-300 hover:neon-glow cursor-pointer inline-block"
        >
          aliorbz
        </a>
      </p>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'game' | 'leaderboard'>('landing');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [showNameModal, setShowNameModal] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    const sessionId = localStorage.getItem('jumpsiggy_sessionId') || crypto.randomUUID();
    localStorage.setItem('jumpsiggy_sessionId', sessionId);
    const init = async () => {
        const p = await supabaseService.getPlayer(sessionId);
        if (p) setPlayer(p);
    };
    init();
  }, []);

  const handleStartPlay = () => {
    if (!player) {
      setShowNameModal(true);
    } else {
      setView('game');
      setGameState('idle');
    }
  };

  const handleNameSave = async (name: string) => {
    const sessionId = localStorage.getItem('jumpsiggy_sessionId')!;
    const p = await supabaseService.upsertPlayer(name, sessionId);
    setPlayer(p);
    setShowNameModal(false);
    setView('game');
    setGameState('idle');
  };

  const handleGameOver = async (score: number) => {
    setLastScore(score);
    if (player) {
        await supabaseService.submitScore(player.session_id, player.name, score);
        const updated = await supabaseService.getPlayer(player.session_id);
        if (updated) setPlayer(updated);
    }
  };

  const handleShowLeaderboard = async () => {
    const lb = await supabaseService.getLeaderboard();
    setLeaderboard(lb);
    setView('leaderboard');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {view === 'landing' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center overflow-hidden">
             <img 
               src={SYMBOL_URL} 
               className="w-[80vw] h-[80vw] max-w-[600px] animate-[spin_60s_linear_infinite] rounded-full blur-sm"
               alt="background ritual"
             />
          </div>
          
          <div className="z-10 text-center px-6">
            <h1 className="text-6xl md:text-8xl ritual-font neon-glow mb-4 tracking-tighter">
              JumpSIGGY
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl italic mb-12 max-w-md mx-auto">
              “Leap through the candles. Survive the night. Etch your score.”
            </p>
            
            <div className="flex flex-col space-y-4 w-64 mx-auto">
              <button
                onClick={handleStartPlay}
                className="py-4 bg-[#39FF14] text-black font-bold ritual-font text-2xl uppercase tracking-widest rounded-md hover:bg-white transition-all shadow-[0_0_20px_#39FF14]"
              >
                Begun Ritual
              </button>
            </div>
          </div>
          {showNameModal && <NameModal onSave={handleNameSave} />}
        </div>
      )}

      {view === 'leaderboard' && (
        <div className="w-full h-full overflow-y-auto bg-black text-white p-6 md:p-12 pb-32">
          <div className="max-w-2xl mx-auto">
            <header className="flex justify-between items-end mb-12 border-b border-[#39FF14]/20 pb-6">
              <h1 className="ritual-font text-4xl md:text-6xl neon-glow">The Ledger</h1>
              <button 
                  onClick={() => setView('landing')}
                  className="text-zinc-500 hover:text-white uppercase text-xs tracking-widest border border-zinc-800 px-4 py-2 rounded"
              >
                  Return
              </button>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 uppercase text-xs tracking-[0.2em] border-b border-zinc-800">
                    <th className="pb-4 font-normal">Rank</th>
                    <th className="pb-4 font-normal">Mystic</th>
                    <th className="pb-4 font-normal text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.session_id} className={`group ${player?.session_id === entry.session_id ? 'bg-[#39FF14]/5' : ''}`}>
                      <td className="py-4 ritual-font text-zinc-600 group-hover:text-[#39FF14]">#{idx + 1}</td>
                      <td className="py-4 ritual-font text-xl group-hover:neon-glow">{entry.name}</td>
                      <td className="py-4 text-right ritual-font text-2xl text-[#39FF14]">{entry.best_score}</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-20 text-center text-zinc-600 italic">No souls have etched their names yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view === 'game' && (
        <div className="w-full h-full relative">
          <GameCanvas 
            onGameOver={handleGameOver} 
            gameState={gameState} 
            setGameState={setGameState} 
          />
          {gameState === 'countdown' && (
            <CountdownOverlay onComplete={() => setGameState('running')} />
          )}
          {gameState === 'gameover' && (
            <GameOverModal 
              score={lastScore}
              bestScore={player?.best_score || 0}
              onRetry={() => setGameState('idle')}
              onLeaderboard={handleShowLeaderboard}
              onHome={() => setView('landing')}
            />
          )}
        </div>
      )}

      <UniversalFooter />
    </div>
  );
};

export default App;
