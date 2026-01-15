
import React, { useState, useEffect } from 'react';

const VERSES = [
  "Whatever action a great man performs, common men follow.",
  "The soul can never be cut to pieces by any weapon.",
  "One who has control over the mind is already in Samadhi.",
  "Perform your duty equipoised, abandoning all attachment to success or failure.",
  "For the soul there is neither birth nor death at any time."
];

const NeuralLoader: React.FC<{ loading: boolean }> = ({ loading }) => {
  const [verse, setVerse] = useState(VERSES[0]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setVerse(VERSES[Math.floor(Math.random() * VERSES.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050508]/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in">
      <div className="relative w-64 h-64 mb-16">
        <div className="absolute inset-0 border-[2px] border-[#ff00ff] rounded-full animate-spin-slow opacity-20"></div>
        <div className="absolute inset-4 border-[1px] border-[#00f2ff] rounded-full animate-spin opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_20px_#fff]"></div>
        </div>
        <svg className="absolute inset-0 w-full h-full rotate-[-45deg]" viewBox="0 0 100 100">
           <rect x="25" y="25" width="50" height="50" fill="none" stroke="#ffcc00" strokeWidth="0.5" className="animate-pulse" />
        </svg>
      </div>
      
      <div className="max-w-2xl text-center px-12">
        <h2 className="text-[#ff00ff] font-cinzel text-3xl uppercase tracking-[0.4em] mb-4">Neural Mesh Synchronizing</h2>
        <p className="text-[#00f2ff] font-code text-[11px] uppercase tracking-widest opacity-40 mb-12">Protocol 0xSHA256 :: Akashic Fetching</p>
        <div className="h-[1px] w-48 bg-white/10 mx-auto mb-12"></div>
        <p className="text-white text-xl font-cinzel italic leading-relaxed opacity-70 animate-pulse">"{verse}"</p>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NeuralLoader;
