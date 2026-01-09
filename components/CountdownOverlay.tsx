
import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return 'GO!';
        clearInterval(timer);
        onComplete();
        return '';
      });
    }, 800);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!count) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 pointer-events-none">
      <div className="ritual-font text-[10rem] md:text-[15rem] text-[#39FF14] neon-glow drop-shadow-[0_0_20px_rgba(57,255,20,0.8)] animate-bounce select-none">
        {count}
      </div>
    </div>
  );
};
