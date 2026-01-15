
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, NeuralStep } from '../types';
import { chatWithThinkingMesh } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface Props {
  focusDimension: string;
  emotionLevel: number;
}

const SageChat: React.FC<Props> = ({ focusDimension, emotionLevel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    soundService.playClick();
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { text, hash } = await chatWithThinkingMesh(input, focusDimension);
      const steps: NeuralStep[] = [
        { agent: 'Sattva-Logic', hash: 'SHA256_'+Math.random().toString(16).slice(2,6), content: 'Analyzing spiritual implications...', timestamp: Date.now() },
        { agent: 'Rajas-Action', hash: 'SHA256_'+Math.random().toString(16).slice(2,6), content: 'Synthesizing material responses...', timestamp: Date.now() }
      ];
      setMessages(prev => [...prev, { role: 'model', text, steps }]);
      soundService.playBell(660, 0.3);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error: Mesh desynchronized.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel flex flex-col h-[40rem] relative">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
        <h4 className="font-cinzel text-[#ff00ff] text-sm tracking-widest uppercase">Sage Neural Proxy</h4>
        <span className="text-[8px] font-code text-white/30">OLLAMA_SLIM_EMULATED</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
            <span className="material-symbols-outlined text-5xl">stream</span>
            <p className="text-[10px] font-code uppercase tracking-widest">Query Stream Empty</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full layer-transition`}>
            <div className={`max-w-[90%] p-6 rounded-2xl ${m.role === 'user' ? 'bg-[#00f2ff]/10 border border-[#00f2ff]/20' : 'bg-white/5 border border-white/5'}`}>
              <p className="text-sm font-light text-white/80 leading-relaxed">{m.text}</p>
              {m.steps && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                    {m.steps.map((s, si) => (
                        <div key={si} className="flex gap-2 text-[8px] font-code text-white/20">
                            <span className="text-[#ffcc00] shrink-0">{s.agent}</span>
                            <span className="truncate">{s.content}</span>
                        </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center p-4">
            <div className="w-1.5 h-1.5 bg-[#ff00ff] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#ff00ff] rounded-full animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 bg-[#ff00ff] rounded-full animate-bounce delay-200"></div>
            <span className="text-[10px] font-code text-white/30 uppercase tracking-widest ml-4">Processing Entropic Logic...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 flex gap-4 bg-black/40">
        <textarea 
          placeholder="Input Query..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          rows={1}
          className="flex-1 !p-3 !text-sm !bg-transparent border-none focus:ring-0 resize-none h-12"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="bg-[#ff00ff] text-black w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-20">
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </div>
    </div>
  );
};

export default SageChat;
