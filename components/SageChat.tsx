
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
        setMessages(prev => [...prev, { role: 'model', text: reply || 'Silent meditation...' }]);
      } else {
        const result = await searchGitaWisdom(input);
        setMessages(prev => [...prev, { role: 'model', text: result.text || '', sources: result.sources }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Resonance lost." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m3-card flex flex-col h-[700px] border border-white/5 overflow-hidden shadow-2xl p-0 w-full">
      <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-black/20 w-full">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-accent text-3xl">auto_awesome</span>
          <h3 className="font-cinzel text-accent text-lg font-bold uppercase tracking-widest">Sage</h3>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsConcise(!isConcise)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isConcise ? 'bg-accent text-black border-accent' : 'border-white/10 text-white/40'}`}>Concise</button>
          <div className="bg-black/40 p-1 rounded-xl flex gap-1 border border-white/5">
            <button onClick={() => setMode('thinking')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${mode === 'thinking' ? 'bg-accent text-black' : 'text-white/30'}`}>Logic</button>
            <button onClick={() => setMode('search')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${mode === 'search' ? 'bg-accent text-black' : 'text-white/30'}`}>Search</button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-black/10 w-full">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-10">
            <p className="text-sm font-black uppercase tracking-[0.5em] italic">Transmit Query</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in`}>
            <div className={`max-w-[90%] p-6 rounded-[1.5rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'} border border-white/5`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex gap-2 p-2"><div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div><div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div></div>}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/40 flex gap-4 w-full">
        <input 
          placeholder="Inquire..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="wide-input flex-1"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Send</button>
      </div>
    </div>
  );
};

export default SageChat;
