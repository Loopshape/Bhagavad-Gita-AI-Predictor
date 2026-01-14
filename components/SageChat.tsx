
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
    <div className="m3-card flex flex-col h-[700px] border border-white/5 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-0 bg-black/60 rounded-[3rem]">
      {/* Chat Header */}
      <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-black/40">
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-accent text-3xl animate-pulse">auto_awesome</span>
            <div>
              <h3 className="font-cinzel text-accent text-lg tracking-[0.2em] font-bold uppercase">Sage Consultation</h3>
              <p className="text-[9px] uppercase tracking-widest text-subtext opacity-40 font-black">AI-Vedic Predictive Model</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-6 items-center">
          <button 
            onClick={handleReflection} 
            disabled={loading}
            className="flex items-center gap-3 px-6 py-2.5 border-2 border-accent/30 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-accent hover:bg-accent/10 transition-all active:scale-95 shadow-lg group"
            title="Generate custom reflection guidance"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">psychology</span>
            Reflect
          </button>
          
          <div className="flex gap-4 items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <label className="text-[10px] uppercase font-black tracking-widest text-subtext opacity-50">Concise Mode</label>
            <div 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-12 h-6 rounded-full cursor-pointer transition-all relative ${isConcise ? 'bg-accent shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isConcise ? 'left-[24px]' : 'left-1'}`} />
            </div>
          </div>

          <div className="flex gap-2 bg-black/90 p-1.5 rounded-[1.2rem] border border-white/5 shadow-inner">
            <button 
              onClick={() => setMode('thinking')} 
              className={`px-5 py-2 text-[10px] font-black uppercase rounded-[1rem] transition-all duration-300 ${mode === 'thinking' ? 'bg-accent text-black shadow-lg' : 'text-subtext hover:text-white'}`}
            >Logic Engine</button>
            <button 
              onClick={() => setMode('search')} 
              className={`px-5 py-2 text-[10px] font-black uppercase rounded-[1rem] transition-all duration-300 ${mode === 'search' ? 'bg-accent text-black shadow-lg' : 'text-subtext hover:text-white'}`}
            >Vedic Search</button>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth bg-gradient-to-b from-transparent to-black/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8">
            <span className="material-symbols-outlined text-9xl">forum</span>
            <p className="text-[14px] uppercase tracking-[0.6em] font-black text-center leading-relaxed italic">Inquire for divine clarity within the digital matrix</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
            <div className={`
              max-w-[85%] p-8 rounded-[2.5rem] text-[15px] leading-relaxed shadow-2xl relative
              ${m.role === 'user' 
                ? 'bg-[#4f378b] text-[#eaddff] border border-white/10 rounded-br-lg' 
                : 'bg-[#2a2a2e] text-[#cac4d0] border border-white/5 rounded-bl-lg'
              }
            `}>
              <div className="whitespace-pre-wrap font-light tracking-wide">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 bg-black/30 p-6 rounded-[1.5rem] shadow-inner">
                  <span className="text-[10px] font-black text-accent uppercase block mb-4 tracking-[0.4em] opacity-40">Verified Vedic Grounding</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-accent hover:underline text-[13px] mb-3 font-medium transition-all hover:translate-x-1">
                      <span className="material-symbols-outlined text-sm">link</span> {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <div className="mt-6 flex items-center gap-4">
                   <button 
                    onClick={() => playAudio(m.text)}
                    className="p-3 bg-white/5 rounded-full hover:bg-accent hover:text-black transition-all shadow-xl active:scale-90 group"
                    title="Synthesize Resonant Voice"
                   >
                      <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">volume_up</span>
                   </button>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Sonic Resonance Trace</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start pl-8">
             <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce delay-0"></div>
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce delay-150"></div>
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce delay-300"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-10 border-t border-white/5 flex gap-6 bg-black/60 items-center">
        <div className="flex-1 relative group">
          <input 
            placeholder="Transmit your deep inquiry to the Sage..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-5 text-base focus:outline-none focus:border-accent transition-all text-white shadow-inner group-hover:bg-white/[0.06]"
          />
        </div>
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          className="
            flex items-center gap-4 bg-accent hover:bg-orange-500 text-[#000] 
            px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] 
            transition-all shadow-2xl active:scale-95 disabled:opacity-20 
            disabled:cursor-not-allowed group
          "
        >
          Transmit
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">send</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;
