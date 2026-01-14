import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithThinking, searchGitaWisdom, generateReflectionPrompt } from '../services/geminiService';

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
        setMessages(prev => [...prev, { role: 'model', text: reply || 'Silent Samadhi.' }]);
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

  const handleReflect = async () => {
    setLoading(true);
    try {
      const prompt = await generateReflectionPrompt(focusDimension, emotionLevel);
      setMessages(prev => [...prev, { role: 'model', text: `Deep Reflection Point: ${prompt}` }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/30 flex flex-col h-[70rem] border border-white/5 overflow-hidden shadow-2xl rounded-[3.5rem] w-full animate-in">
      <div className="p-10 border-b border-white/5 flex flex-wrap justify-between items-center gap-8 bg-black/40 w-full">
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-neon-magenta text-4xl">auto_awesome</span>
          <div>
            <h3 className="font-cinzel text-neon-magenta text-2xl font-black uppercase tracking-widest m-0">Sage Oracle</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleReflect} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Self-Reflect</button>
          <div className="flex bg-black/60 p-1 rounded-full border border-white/5">
            <button onClick={() => setIsConcise(false)} className={`px-4 py-1.5 rounded-full text-[9px] uppercase ${!isConcise ? 'bg-neon-magenta text-black' : 'text-white/40'}`}>Detailed</button>
            <button onClick={() => setIsConcise(true)} className={`px-4 py-1.5 rounded-full text-[9px] uppercase ${isConcise ? 'bg-neon-magenta text-black' : 'text-white/40'}`}>Concise</button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 bg-black/10 w-full scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-in`}>
            <div className={`max-w-[85%] p-8 rounded-[2.5rem] text-xl leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'bg-white/5 border border-white/5'}`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 border-t border-white/5 bg-black/40 flex gap-6 w-full items-center">
        <textarea 
          placeholder="Transmit query..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          className="flex-1 !important"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="h-[6rem] px-10 rounded-2xl font-black uppercase tracking-widest">Send</button>
      </div>
    </div>
  );
};

export default SageChat;