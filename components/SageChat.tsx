
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
          <md-outlined-button onClick={handleReflection} disabled={loading} style={{ '--md-outlined-button-outline-color': 'rgba(245,158,11,0.3)', '--md-outlined-button-label-text-color': '#f59e0b' }}>
            <span slot="icon" className="material-symbols-outlined">psychology</span>
            Reflect
          </md-outlined-button>
          
          <div className="flex gap-2 items-center">
            <label className="text-[10px] uppercase font-black tracking-widest text-subtext opacity-70">Concise</label>
            <md-switch selected={isConcise} onInput={() => setIsConcise(!isConcise)} style={{ '--md-switch-selected-handle-color': '#f59e0b', '--md-switch-selected-track-color': 'rgba(245,158,11,0.3)' }}></md-switch>
          </div>

          <div className="flex gap-2 bg-black/80 p-1.5 rounded-2xl border border-white/10">
            <md-filled-tonal-button onClick={() => setMode('thinking')} disabled={mode === 'thinking'} style={{ '--md-filled-tonal-button-container-color': mode === 'thinking' ? '#f59e0b' : 'transparent', '--md-filled-tonal-button-label-text-color': mode === 'thinking' ? '#000' : '#94a3b8' }}>Logic</md-filled-tonal-button>
            <md-filled-tonal-button onClick={() => setMode('search')} disabled={mode === 'search'} style={{ '--md-filled-tonal-button-container-color': mode === 'search' ? '#f59e0b' : 'transparent', '--md-filled-tonal-button-label-text-color': mode === 'search' ? '#000' : '#94a3b8' }}>Search</md-filled-tonal-button>
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
              m.role === 'user' ? 'bg-primary-container text-on-primary-container border border-white/10' : 'bg-surface-variant text-on-surface-variant border border-white/5'
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
                <div className="mt-4 flex gap-2">
                   <md-icon-button onClick={() => playAudio(m.text)} style={{ '--md-icon-button-icon-color': '#f59e0b' }}>
                      <span className="material-symbols-outlined">volume_up</span>
                   </md-icon-button>
                   <span className="text-[10px] font-black uppercase tracking-widest self-center opacity-50">Resonate Voice</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <md-circular-progress indeterminate density="-1"></md-circular-progress>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 flex gap-4 bg-black/60 items-end">
        <md-outlined-text-field 
          label="Inquire to the Sage" 
          placeholder="Transmit your query..." 
          value={input} 
          onInput={(e: any) => setInput(e.target.value)} 
          onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, '--md-outlined-text-field-container-shape': '1rem' }}
        ></md-outlined-text-field>
        <md-filled-button onClick={handleSend} disabled={loading} style={{ '--md-filled-button-container-color': '#f59e0b', '--md-filled-button-label-text-color': '#000', height: '56px', borderRadius: '1rem' }}>
           Send
           <span slot="icon" className="material-symbols-outlined">send</span>
        </md-filled-button>
      </div>
    </div>
  );
};

export default SageChat;
