
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithThinking, searchGitaWisdom, generateSpeech, decode, decodeAudioData, generateReflectionPrompt } from '../services/geminiService';

interface Props {
  focusDimension: string;
  emotionLevel: number;
}

const SageChat: React.FC<Props> = ({ focusDimension, emotionLevel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'thinking' | 'search'>('thinking');
  const [isConcise, setIsConcise] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'thinking') {
        const reply = await chatWithThinking(input, isConcise);
        setMessages(prev => [...prev, { role: 'model', text: reply || 'The sage is silent...' }]);
      } else {
        const result = await searchGitaWisdom(input);
        setMessages(prev => [...prev, { role: 'model', text: result.text || '', sources: result.sources }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the infinite wisdom..." }]);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    const base64 = await generateSpeech(text);
    if (!base64) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const handleReflection = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const promptText = await generateReflectionPrompt(focusDimension, emotionLevel);
      setMessages(prev => [...prev, { role: 'model', text: `✨ Self-Reflection Guidance:\n\n${promptText}` }]);
    } catch (e) {
       setMessages(prev => [...prev, { role: 'model', text: "The inner eye is clouded. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[500px] border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-3 bg-black/60">
        <h3 className="font-cinzel text-accent text-sm tracking-widest">Sage Consultation</h3>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleReflection}
            disabled={loading}
            className="text-[9px] uppercase font-black text-accent border border-accent/40 px-3 py-2 rounded-lg hover:bg-accent/20 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            title="Generate a personalized reflection prompt"
          >
            <span className="text-[12px]">✨</span> Reflection
          </button>
          <div className="flex gap-2 items-center">
            <label className="text-[9px] uppercase font-black tracking-widest text-subtext opacity-70">Concise</label>
            <button 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-9 h-5 rounded-full transition-all relative ${isConcise ? 'bg-accent' : 'bg-white/10'}`}
              title={isConcise ? 'Concise Summary Active' : 'Detailed Thinking Active'}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isConcise ? 'left-[20px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-1 bg-black/80 p-1.5 rounded-xl border border-white/10">
            <button 
              onClick={() => setMode('thinking')}
              className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'thinking' ? 'bg-accent text-black shadow-xl' : 'text-subtext hover:text-white'}`}
            >Logic</button>
            <button 
              onClick={() => setMode('search')}
              className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'search' ? 'bg-accent text-black shadow-xl' : 'text-subtext hover:text-white'}`}
            >Search</button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-3">
            <div className="text-4xl">🕉️</div>
            <p className="text-[11px] uppercase tracking-[0.4em] font-black text-center">Establish resonance to inquire</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-400`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-lg ${
              m.role === 'user' ? 'bg-accent/15 border border-accent/40 text-accent-100' : 'bg-white/5 border border-white/10 text-slate-100'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 bg-black/20 p-3 rounded-lg">
                  <span className="text-[9px] uppercase font-black text-accent opacity-60 block mb-3 tracking-widest">Ancient Knowledge Repositories</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="block text-accent hover:underline text-[12px] mb-2 font-semibold">
                      → {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <button 
                  onClick={() => playAudio(m.text)}
                  className="mt-4 text-accent/70 hover:text-accent flex items-center gap-2 transition-all group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🔊</span> <span className="text-[10px] font-black uppercase tracking-widest">Resonate Voice</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-2 items-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_currentColor]"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_currentColor]"></div>
              <div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_currentColor]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-white/10 flex gap-3 bg-black/60">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Transmit your inquiry to the Gita Sage..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent/60 transition-all placeholder:opacity-30"
        />
        <button 
          onClick={handleSend}
          className="bg-accent hover:bg-orange-500 text-black px-8 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-2"
        >
          Send <span className="opacity-50">⚡</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;
