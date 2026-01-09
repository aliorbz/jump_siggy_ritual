
import React, { useState } from 'react';

interface NameModalProps {
  onSave: (name: string) => void;
}

export const NameModal: React.FC<NameModalProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 16) {
      setError('Name must be 2-16 characters.');
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-max-w-md bg-zinc-900 border-2 border-[#39FF14] p-8 rounded-lg shadow-[0_0_30px_rgba(57,255,20,0.3)]">
        <h2 className="ritual-font text-3xl text-white text-center mb-6 neon-glow uppercase tracking-widest">
          Inscribe Your Name
        </h2>
        <p className="text-zinc-400 text-center mb-8 italic">
          Your journey begins here. Speak your name to the stars.
        </p>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="E.g. VoidWalker"
          maxLength={16}
          className="w-full bg-black border border-[#39FF14]/50 text-[#39FF14] p-4 rounded focus:outline-none focus:border-[#39FF14] text-xl ritual-font mb-2"
        />
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <button
          onClick={handleSave}
          className="w-full py-4 mt-4 bg-[#39FF14] text-black font-bold uppercase tracking-widest text-lg rounded-md hover:bg-white transition-colors duration-300 neon-bg shadow-[0_0_15px_#39FF14]"
        >
          Seal It
        </button>
      </div>
    </div>
  );
};
