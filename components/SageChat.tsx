
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
    setLoading(true);
    try {
      const prompt = await generateReflectionPrompt(focusDimension, emotionLevel);
      setMessages(prev => [...prev, { role: 'model', text: `✨ Self-Reflection Prompt: ${prompt}` }]);
    } catch (e) {
       setMessages(prev => [...prev, { role: 'model', text: "The inner eye is clouded. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-cinzel text-accent">Sage Consultation</h3>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleReflection}
            className="text-[9px] uppercase font-bold text-accent border border-accent/30 px-3 py-1 rounded hover:bg-accent/10 transition-all"
          >
            Reflect
          </button>
          <div className="flex gap-1 items-center">
            <label className="text-[9px] uppercase tracking-tighter text-subtext">Concise</label>
            <button 
              onClick={() => setIsConcise(!isConcise)}
              className={`w-8 h-4 rounded-full transition-colors relative ${isConcise ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isConcise ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
            <button 
              onClick={() => setMode('thinking')}
              className={`px-3 py-1 text-[10px] rounded ${mode === 'thinking' ? 'bg-accent text-black' : 'text-subtext'}`}
            >Thinking</button>
            <button 
              onClick={() => setMode('search')}
              className={`px-3 py-1 text-[10px] rounded ${mode === 'search' ? 'bg-accent text-black' : 'text-subtext'}`}
            >Search</button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
              m.role === 'user' ? 'bg-accent/20 border border-accent/30' : 'bg-white/5 border border-white/10'
            }`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-[8px] uppercase text-accent opacity-50 block mb-1">Sources</span>
                  {m.sources.map((s, si) => (
                    <a key={si} href={s.uri} target="_blank" rel="noreferrer" className="block text-accent hover:underline overflow-hidden text-ellipsis whitespace-nowrap">
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
              {m.role === 'model' && (
                <button 
                  onClick={() => playAudio(m.text)}
                  className="mt-2 text-accent opacity-50 hover:opacity-100 flex items-center gap-1"
                >
                  <span className="text-[10px]">Play Audio</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-subtext italic">The sage is contemplating...</div>}
      </div>

      <div className="p-4 border-t border-white/10 flex gap-2">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the Gita Sage..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent"
        />
        <button 
          onClick={handleSend}
          className="bg-accent hover:bg-orange-500 text-black px-4 rounded-xl text-xs font-bold"
        >Send</button>
      </div>
    </div>
  );
};

export default SageChat;
