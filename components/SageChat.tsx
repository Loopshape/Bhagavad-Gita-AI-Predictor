
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
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the source of wisdom." }]);
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
    <div className="m3-card flex flex-col h-[600px] border border-white/10 overflow-hidden shadow-2xl p-0 bg-black/40">
      <div className="p-5 border-b border-white/10 flex flex-wrap justify-between items-center gap-4 bg-black/60">
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">auto_awesome</span>
            <h3 className="font-cinzel text-accent text-sm tracking-widest">Sage Consultation</h3>
        </div>
        <div className="flex gap-6 items-center">
          <button 
            onClick={handleReflection} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 border border-accent/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            Reflect
          </button>
          
          <div className="flex gap-3 items-center">
            <label className="text-[10px] uppercase font-black tracking-widest text-subtext opacity-70">Concise</label>
            <div 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${isConcise ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isConcise ? 'left-[22px]' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex gap-2 bg-black/80 p-1 rounded-xl border border-white/10">
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
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
            <span className="material-symbols-outlined text-6xl">chat_bubble</span>
            <p className="text-[11px] uppercase tracking-[0.4em] font-black text-center">Inquire for divine clarity</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-400`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-[14px] leading-relaxed shadow-lg ${
              m.role === 'user' ? 'bg-[#4f378b] text-[#eaddff] border border-white/10' : 'bg-[#49454f] text-[#cac4d0] border border-white/5'
            }`}>
              <div className="whitespace-pre-wrap font-light">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 bg-black/20 p-4 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-accent opacity-60 block mb-3 tracking-widest">Vedic Sources</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="block text-accent hover:underline text-[12px] mb-2 font-semibold">
                      → {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <div className="mt-4 flex items-center gap-2">
                   <button 
                    onClick={() => playAudio(m.text)}
                    className="p-2 rounded-full hover:bg-white/10 text-accent transition-colors"
                   >
                      <span className="material-symbols-outlined">volume_up</span>
                   </button>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Resonate Voice</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 flex gap-4 bg-black/60 items-end">
        <div className="flex-1 relative">
          <input 
            placeholder="Transmit your query to the Sage..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all text-white"
          />
        </div>
        <button 
          onClick={handleSend} 
          disabled={loading}
          className="flex items-center gap-2 bg-accent hover:bg-orange-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          Send
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;
