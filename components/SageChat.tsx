
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
        setMessages(prev => [...prev, { role: 'model', text: reply || 'The sage remains in silent samadhi...' }]);
      } else {
        const result = await searchGitaWisdom(input);
        setMessages(prev => [...prev, { role: 'model', text: result.text || '', sources: result.sources }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Spiritual connection interrupted. The Sage is momentarily unreachable." }]);
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
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `✨ Divine Self-Reflection Prompt:\n\n"${promptText}"\n\nTake a moment to breathe and internalize this inquiry.` 
      }]);
    } catch (e) {
       setMessages(prev => [...prev, { role: 'model', text: "Inner eye clouded. Attempt resonance synchronization again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m3-card flex flex-col h-[700px] border border-white/5 overflow-hidden shadow-2xl p-0 bg-black/60 rounded-[3rem] w-full">
      {/* Chat Header */}
      <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-black/40">
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-accent text-3xl">auto_awesome</span>
            <div>
              <h3 className="font-cinzel text-accent text-lg tracking-[0.2em] font-bold uppercase">Sage Consultation</h3>
              <p className="text-[9px] uppercase tracking-widest text-subtext opacity-40 font-black">AI-Vedic Predictive Model</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <button 
            onClick={handleReflection} 
            disabled={loading}
            className="flex items-center gap-3 px-6 py-2 border border-accent/30 rounded-full text-[11px] font-black uppercase tracking-widest text-accent hover:bg-accent/10 transition-all active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">psychology</span>
            Reflect
          </button>
          
          <div className="flex gap-4 items-center bg-white/5 px-4 py-1.5 rounded-2xl border border-white/5">
            <label className="text-[10px] uppercase font-black tracking-widest text-subtext opacity-50">Concise</label>
            <div 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${isConcise ? 'bg-accent shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isConcise ? 'left-[22px]' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex gap-2 bg-black/90 p-1 rounded-xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setMode('thinking')} 
              className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'thinking' ? 'bg-accent text-black' : 'text-subtext hover:text-white'}`}
            >Logic</button>
            <button 
              onClick={() => setMode('search')} 
              className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'search' ? 'bg-accent text-black' : 'text-subtext hover:text-white'}`}
            >Search</button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-gradient-to-b from-transparent to-black/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8">
            <span className="material-symbols-outlined text-8xl">forum</span>
            <p className="text-[14px] uppercase tracking-[0.6em] font-black text-center leading-relaxed italic">Inquire for divine clarity</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
            <div className={`
              max-w-[85%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-xl relative
              ${m.role === 'user' 
                ? 'bg-[#4f378b] text-[#eaddff] border border-white/10' 
                : 'bg-[#2a2a2e] text-[#cac4d0] border border-white/5'
              }
            `}>
              <div className="whitespace-pre-wrap font-light tracking-wide">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 bg-black/30 p-4 rounded-xl">
                  <span className="text-[9px] font-black text-accent uppercase block mb-3 tracking-widest opacity-40">Sources</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent hover:underline text-[12px] mb-2 font-medium">
                      → {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <div className="mt-4 flex items-center gap-3">
                   <button 
                    onClick={() => playAudio(m.text)}
                    className="p-2 bg-white/5 rounded-full hover:bg-accent hover:text-black transition-all shadow-md active:scale-90"
                   >
                      <span className="material-symbols-outlined text-lg">volume_up</span>
                   </button>
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Sonic Resonance</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-300"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-white/5 flex gap-4 bg-black/60 items-center">
        <div className="flex-1 relative">
          <input 
            placeholder="Transmit your query to the Sage..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-base focus:outline-none focus:border-accent transition-all text-white shadow-inner"
          />
        </div>
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          className="
            flex items-center gap-3 bg-accent hover:bg-orange-500 text-black 
            px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest 
            transition-all shadow-xl active:scale-95 disabled:opacity-20
          "
        >
          Send
          <span className="material-symbols-outlined text-base">send</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;
