
import React, { useState, useRef } from 'react';
import { getAI, encode, decode, decodeAudioData } from '../services/geminiService';
import { Modality } from '@google/genai';

const LiveConversation: React.FC = () => {
  const [active, setActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    const ai = getAI();
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const data = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(data.length);
            for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
          setActive(true);
        },
        onmessage: async (msg: any) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
            const ctx = audioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (msg.serverContent?.outputTranscription) {
             setTranscription(prev => prev + ' ' + msg.serverContent.outputTranscription.text);
          }
        },
        onclose: () => setActive(false),
        onerror: (e) => console.error(e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: "You are the living voice of the Gita. Speak with profound depth and real-time clarity."
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setActive(false);
  };

  return (
    <div className="glass p-6 rounded-2xl flex flex-col items-center gap-4">
      <h3 className="font-cinzel text-accent">Real-time Gita Oracle</h3>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${active ? 'bg-accent animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-white/5'}`}>
         <button onClick={active ? stopSession : startSession} className="text-2xl">
            {active ? '🛑' : '🎙️'}
         </button>
      </div>
      <p className="text-[10px] text-subtext uppercase tracking-widest">
        {active ? 'Oracle Listening...' : 'Tap to Start Voice Session'}
      </p>
      {transcription && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg text-xs italic text-accent/70 max-h-24 overflow-y-auto">
          "{transcription}"
        </div>
      )}
    </div>
  );
};

export default LiveConversation;
