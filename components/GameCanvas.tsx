
import React, { useEffect, useRef, useState } from 'react';
import { GameState, Particle } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const GRAVITY = 0.38;
const JUMP = -7.2;
const MAX_FALL = 10;
const INITIAL_SPEED = 3.2;
const SPAWN_INTERVAL = 1600; 
const GAP_SIZE = 190;
const SIGGY_SIZE = 44;
const SCREEN_PADDING = 80;
const SYMBOL_URL = 'https://pbs.twimg.com/profile_images/1912582510631858176/-Xbw2AcT_400x400.jpg';

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, gameState, setGameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const symbolImg = useRef<HTMLImageElement | null>(null);
  
  const scoreRef = useRef(0);
  const siggyY = useRef(0);
  const siggyV = useRef(0);
  const siggyRot = useRef(0);
  const obstacles = useRef<{ x: number; gapTop: number; passed: boolean }[]>([]);
  const lastSpawnTime = useRef(0);
  const frameCount = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);

  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = SYMBOL_URL;
    img.onload = () => { symbolImg.current = img; };
  }, []);

  const initGame = (width: number, height: number) => {
    siggyY.current = height / 2;
    siggyV.current = 0;
    siggyRot.current = 0;
    obstacles.current = [];
    scoreRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    lastSpawnTime.current = performance.now();
    setCurrentScore(0);
  };

  const spawnObstacle = (width: number, height: number) => {
    const minGapY = SCREEN_PADDING;
    const maxGapY = height - GAP_SIZE - SCREEN_PADDING;
    const gapTop = minGapY + Math.random() * (maxGapY - minGapY);
    obstacles.current.push({ x: width, gapTop, passed: false });
  };

  const update = (width: number, height: number) => {
    if (gameState !== 'running') return;
    
    frameCount.current++;
    siggyV.current += GRAVITY;
    if (siggyV.current > MAX_FALL) siggyV.current = MAX_FALL;
    siggyY.current += siggyV.current;
    
    siggyRot.current = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, siggyV.current * 0.05));

    if (siggyY.current < -50 || siggyY.current + SIGGY_SIZE > height + 50) {
      handleCollision();
    }

    const now = performance.now();
    if (now - lastSpawnTime.current > SPAWN_INTERVAL) {
      spawnObstacle(width, height);
      lastSpawnTime.current = now;
    }

    const siggyRect = { 
      left: 40 + 5, 
      right: 40 + SIGGY_SIZE - 5, 
      top: siggyY.current + 5, 
      bottom: siggyY.current + SIGGY_SIZE - 5 
    };

    obstacles.current.forEach((obs) => {
      obs.x -= speedRef.current;
      speedRef.current += 0.0001;
      
      const obsWidth = 60;
      if (siggyRect.right > obs.x && siggyRect.left < obs.x + obsWidth) {
        if (siggyRect.top < obs.gapTop || siggyRect.bottom > obs.gapTop + GAP_SIZE) {
          handleCollision();
        }
      }
      
      if (!obs.passed && obs.x + obsWidth < siggyRect.left) {
        obs.passed = true;
        scoreRef.current += 1;
        setCurrentScore(scoreRef.current);
      }
    });

    obstacles.current = obstacles.current.filter(obs => obs.x > -100);
  };

  const handleCollision = () => {
    setGameState('gameover');
    onGameOver(scoreRef.current);
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 40; i++) {
      const sX = ((i * 123.45) % 1) * width;
      const sY = ((i * 456.78) % 1) * height;
      const size = Math.abs(Math.sin(frameCount.current * 0.02 + i)) * 1.2;
      ctx.beginPath(); ctx.arc(sX, sY, size, 0, Math.PI * 2); ctx.fill();
    }

    // Obstacles
    obstacles.current.forEach(obs => {
      ctx.save();
      const obsWidth = 60;
      ctx.fillStyle = '#0a0a0a';
      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = 2;
      
      const drawPart = (y: number, h: number) => {
        ctx.fillRect(obs.x, y, obsWidth, h);
        if (symbolImg.current) {
          ctx.save();
          ctx.beginPath(); ctx.rect(obs.x, y, obsWidth, h); ctx.clip();
          const patternSize = 40;
          ctx.globalAlpha = 0.8; // Changed from 0.15 to 0.8 (80% opacity)
          for(let px = 0; px < obsWidth; px += patternSize) {
            for(let py = 0; py < h; py += patternSize) {
              ctx.drawImage(symbolImg.current, obs.x + px, y + py, patternSize, patternSize);
            }
          }
          ctx.restore();
        }
        ctx.strokeRect(obs.x, y, obsWidth, h);
      };

      drawPart(0, obs.gapTop);
      drawPart(obs.gapTop + GAP_SIZE, height - (obs.gapTop + GAP_SIZE));

      // Flames
      ctx.fillStyle = '#39FF14';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#39FF14';
      ctx.beginPath(); ctx.ellipse(obs.x + obsWidth/2, obs.gapTop, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(obs.x + obsWidth/2, obs.gapTop + GAP_SIZE, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Siggy
    ctx.save();
    ctx.translate(40 + SIGGY_SIZE/2, siggyY.current + SIGGY_SIZE/2);
    ctx.rotate(siggyRot.current);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#39FF14';
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;

    // Draw Ears
    const drawEar = (xOffset: number, angle: number) => {
      ctx.save();
      ctx.translate(xOffset, -SIGGY_SIZE/2 + 8);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(0, -15);
      ctx.lineTo(8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawEar(-12, -0.3); // Left ear
    drawEar(12, 0.3);   // Right ear

    // Draw Head
    ctx.beginPath(); 
    ctx.arc(0, 0, SIGGY_SIZE/2, 0, Math.PI * 2); 
    ctx.fill(); 
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(-10, -5, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -5, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(-10, -5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -5, 4, 0, Math.PI * 2); ctx.fill();
    
    if (symbolImg.current) {
      ctx.save();
      ctx.beginPath(); ctx.arc(0, -18, 8, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(symbolImg.current, -8, -26, 16, 16);
      ctx.restore();
    }
    ctx.restore();
  };

  const jumpAction = (e?: any) => {
    if (e && e.cancelable) e.preventDefault();
    if (gameState === 'running') {
      siggyV.current = JUMP;
    } else if (gameState === 'idle') {
      setGameState('countdown');
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.code === 'Space') jumpAction(e); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderLoop = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      update(w, h);
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, w, h);
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initGame(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', resize);
    resize();
    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden touch-none" 
      onPointerDown={jumpAction}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      <div className="absolute top-12 left-0 right-0 text-center pointer-events-none">
        <div className="ritual-font text-6xl text-white neon-glow">{currentScore}</div>
      </div>

      {gameState === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white pointer-events-none">
          <div className="ritual-font text-4xl neon-glow animate-pulse text-center px-6">
            TAP TO BEGIN THE RITUAL
          </div>
          <p className="mt-6 text-zinc-400 tracking-[0.3em] text-sm">SPACE OR CLICK</p>
        </div>
      )}
    </div>
  );
};
