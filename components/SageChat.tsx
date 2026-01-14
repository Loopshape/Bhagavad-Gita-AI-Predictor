
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
    <div className="glass rounded-2xl flex flex-col h-[500px] border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-3 bg-black/20">
        <h3 className="font-cinzel text-accent text-sm tracking-widest">Sage Consultation</h3>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleReflection}
            disabled={loading}
            className="text-[9px] uppercase font-black text-accent border border-accent/40 px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-[11px]">✨</span> Reflection
          </button>
          <div className="flex gap-2 items-center">
            <label className="text-[8px] uppercase font-black tracking-widest text-subtext">Concise</label>
            <button 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-8 h-4 rounded-full transition-all relative ${isConcise ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isConcise ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setMode('thinking')}
              className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${mode === 'thinking' ? 'bg-accent text-black shadow-lg' : 'text-subtext hover:text-white'}`}
            >Logic</button>
            <button 
              onClick={() => setMode('search')}
              className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${mode === 'search' ? 'bg-accent text-black shadow-lg' : 'text-subtext hover:text-white'}`}
            >Search</button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
            <div className="text-3xl">🕉️</div>
            <p className="text-[10px] uppercase tracking-widest">Inquire about your current alignment</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
              m.role === 'user' ? 'bg-accent/10 border border-accent/30 text-accent-100' : 'bg-white/5 border border-white/10 text-slate-200'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-[8px] uppercase font-bold text-accent opacity-50 block mb-2">Knowledge Sources</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="block text-accent hover:underline text-[11px] mb-1">
                      → {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <button 
                  onClick={() => playAudio(m.text)}
                  className="mt-3 text-accent/60 hover:text-accent flex items-center gap-1.5 transition-colors"
                >
                  <span className="text-sm">🔊</span> <span className="text-[9px] font-bold uppercase tracking-widest">Speak Wisdom</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-1 items-center animate-pulse">
              <div className="w-1 h-1 bg-accent rounded-full"></div>
              <div className="w-1 h-1 bg-accent rounded-full"></div>
              <div className="w-1 h-1 bg-accent rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2 bg-black/20">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the Gita Sage..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          className="bg-accent hover:bg-orange-500 text-black px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >Send</button>
      </div>
    </div>
  );
};

export default SageChat;
