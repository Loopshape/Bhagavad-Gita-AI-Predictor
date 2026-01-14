import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithThinking, searchGitaWisdom, generateSpeech, decode, decodeAudioData } from '../services/geminiService';

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
        setMessages(prev => [...prev, { role: 'model', text: reply || 'Silent Samadhi. No transmission established.' }]);
      } else {
        const result = await searchGitaWisdom(input);
        setMessages(prev => [...prev, { role: 'model', text: result.text || '', sources: result.sources }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Resonance lost. The neural bridge has collapsed." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/30 flex flex-col h-[80rem] border border-white/5 overflow-hidden shadow-2xl rounded-[3.5rem] w-full animate-in">
      {/* Header with Switcher */}
      <div className="p-10 border-b border-white/5 flex flex-wrap justify-between items-center gap-8 bg-black/40 w-full">
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-neon-magenta text-4xl animate-pulse">auto_awesome</span>
          <div>
            <h3 className="font-cinzel text-neon-magenta text-2xl font-black uppercase tracking-widest m-0">Sage Oracle</h3>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-black mt-1">AI-Vedic Predictive Layer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 flex-wrap">
          {/* Detailed/Concise Toggle */}
          <div className="flex bg-black/60 p-1.5 rounded-full border border-white/5 shadow-inner">
            <button 
              onClick={() => setIsConcise(false)} 
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isConcise ? 'bg-neon-magenta text-black shadow-lg shadow-neon-magenta/30' : 'text-white/40 hover:text-white/70'}`}
            >Detailed</button>
            <button 
              onClick={() => setIsConcise(true)} 
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isConcise ? 'bg-neon-magenta text-black shadow-lg shadow-neon-magenta/30' : 'text-white/40 hover:text-white/70'}`}
            >Concise</button>
          </div>

          <div className="bg-black/60 p-1.5 rounded-2xl flex gap-1.5 border border-white/5 shadow-inner">
            <button onClick={() => setMode('thinking')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'thinking' ? 'bg-neon-blue text-black' : 'text-white/30 hover:text-white/50'}`}>Logic</button>
            <button onClick={() => setMode('search')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'search' ? 'bg-neon-blue text-black' : 'text-white/30 hover:text-white/50'}`}>Search</button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 bg-black/10 w-full scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
            <span className="material-symbols-outlined text-[12rem]">hub</span>
            <p className="text-xl font-black uppercase tracking-[0.8em] italic">Establish Query Resonance</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in`}>
            <div className={`
              max-w-[90%] p-10 rounded-[3rem] text-2xl leading-relaxed shadow-xl
              ${m.role === 'user' 
                ? 'bg-neon-blue/10 text-white border border-neon-blue/30 rounded-br-none' 
                : 'bg-white/5 text-white/80 border border-white/5 rounded-bl-none'
              }
            `}>
              <div className="whitespace-pre-wrap font-light tracking-wide">{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 bg-black/20 p-6 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-magenta opacity-50">Grounding sources</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="text-neon-magenta hover:underline text-base truncate block opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">link</span> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 p-4 items-center text-neon-magenta">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-300"></div>
            <span className="text-[10px] uppercase font-black tracking-widest ml-4 opacity-50">Processing Divine Output...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-12 border-t border-white/5 bg-black/40 flex gap-6 w-full items-center">
        <div className="flex-1 w-full">
          <textarea 
            placeholder="Transmit query sequence..." 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            className="w-full h-auto min-h-[6rem] !important"
          />
        </div>
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="bg-neon-magenta text-black h-[6rem] px-12 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-20 flex items-center gap-4 group"
        >
          Send
          <span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform">send</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;