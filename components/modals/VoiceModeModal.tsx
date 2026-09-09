'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, X, Sparkles, Square, AlertCircle, RefreshCw } from 'lucide-react';
import NyraOrb from '@/components/NyraOrb';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptSubmitted?: (transcript: string) => void;
  onTranscript?: (transcript: string) => void;
  lastAssistantMessage?: string;
  isStreaming?: boolean;
}

export default function VoiceModeModal({
  isOpen,
  onClose,
  onTranscriptSubmitted,
  onTranscript,
  lastAssistantMessage,
}: VoiceModeModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState(1);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          const defaultVoice = voices.find((v) => v.lang.includes('en')) || voices[0];
          setSelectedVoice(defaultVoice);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Handle Web Speech API recognition
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      setPermissionError(null);
      return;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setPermissionError('Microphone access was denied. Please allow microphone permissions in your browser settings.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setPermissionError('Speech Recognition is not supported by your current browser. Try Chrome or Edge.');
      }
    }
  }, [isOpen]);

  const startListening = () => {
    setPermissionError(null);
    setTranscript('');
    setIsListening(true);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log(e);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.log(e);
    }
  };

  const handleSendVoiceQuery = () => {
    if (!transcript.trim()) return;
    const text = transcript;
    stopListening();
    setTranscript('');
    onClose();
    if (onTranscript) {
      onTranscript(text);
    } else if (onTranscriptSubmitted) {
      onTranscriptSubmitted(text);
    }
  };

  const handleCancelVoice = () => {
    stopListening();
    setTranscript('');
  };

  const speakText = (text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-blur-2xl text-[#292633] dark:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-xl flex flex-col items-center justify-between min-h-[480px] sm:min-h-[560px] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 rounded-3xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24] text-[#292633] dark:text-white shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between border-b border-[#E8E4EF] dark:border-purple-400/15 pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B6FC9] dark:text-purple-400" />
              <span className="font-bold text-xs sm:text-sm tracking-wide text-[#292633] dark:text-white">Nyra Voice Interaction</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Speed Selector */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#F5F3F9] dark:bg-[#07050d] border border-[#E8E4EF] dark:border-purple-400/20 rounded-xl p-1 text-xs">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded-lg font-semibold transition cursor-pointer text-[11px] sm:text-xs ${
                      speechRate === rate ? 'bg-[#8B6FC9] text-white' : 'text-[#686477] hover:text-[#292633] dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#686477] hover:text-[#292633] dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Visualizer Orb */}
          <div className="my-6 flex flex-col items-center justify-center relative">
            <div className={`transition-all duration-500 ${isListening || speaking ? 'scale-110' : 'scale-100'}`}>
              <NyraOrb size={200} />
            </div>

            {/* Live Audio Waveform Equalizer */}
            {isListening && (
              <div className="mt-4 flex items-center gap-1.5 h-8">
                {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [0.3, height / 100, 0.4],
                    }}
                    transition={{
                      duration: 0.5 + (i % 5) * 0.1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-gradient-to-t from-[#8B6FC9] via-[#7E9AC7] to-[#795BB8] rounded-full h-full origin-bottom"
                  />
                ))}
              </div>
            )}

            {/* Status Indicator & Timer */}
            <div className="mt-4 text-center">
              {permissionError ? (
                <div className="flex items-center gap-2 text-[#A85A5A] dark:text-rose-300 text-xs font-medium max-w-sm">
                  <AlertCircle size={16} className="text-[#C77B7B] dark:text-rose-400 shrink-0" />
                  <span>{permissionError}</span>
                </div>
              ) : isListening ? (
                <div className="flex flex-col items-center gap-1 text-[#8B6FC9] dark:text-purple-300 text-xs font-semibold font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C77B7B] animate-ping" />
                    <span>Listening... ({formatTimer(recordingSeconds)})</span>
                  </div>
                </div>
              ) : speaking ? (
                <div className="flex items-center gap-2 text-[#6FA58A] dark:text-emerald-400 text-xs font-semibold font-mono animate-pulse">
                  <Volume2 size={16} />
                  <span>Nyra is speaking...</span>
                </div>
              ) : (
                <p className="text-xs text-[#686477] dark:text-slate-400">Click the microphone to start talking</p>
              )}
            </div>
          </div>

          {/* Live Transcript / Speech Preview */}
          <div className="w-full bg-[#F5F3F9] dark:bg-[#090614] border border-[#E8E4EF] dark:border-purple-400/20 rounded-2xl p-4 min-h-[90px] max-h-[120px] overflow-y-auto mb-4 text-center text-sm font-medium scrollbar-thin">
            {transcript ? (
              <p className="text-[#292633] dark:text-purple-200">{transcript}</p>
            ) : (
              <p className="text-[#92909B] dark:text-slate-500 italic text-xs">
                {isListening ? 'Speak now...' : 'Your speech transcript will appear here'}
              </p>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-4">
            {/* Cancel voice */}
            {isListening && (
              <button
                onClick={handleCancelVoice}
                className="px-4 py-2 rounded-xl bg-[#EEE8FA] hover:bg-[#E8E4EF] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-xs text-[#292633] dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            {/* Mic Toggle Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-[#C77B7B] hover:bg-[#A85A5A] text-white shadow-rose-500/50 animate-pulse'
                  : 'bg-[#8B6FC9] hover:bg-[#795BB8] text-white font-bold shadow-[#8B6FC9]/30'
              }`}
            >
              {isListening ? <Square size={20} className="fill-white" /> : <Mic size={22} />}
            </button>

            {/* Send transcript button */}
            {transcript && (
              <button
                onClick={handleSendVoiceQuery}
                className="px-5 py-2.5 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white text-xs font-bold shadow-md shadow-[#8B6FC9]/25 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Send to Chat</span>
              </button>
            )}

            {/* Speak / Stop Assistant Response */}
            {lastAssistantMessage && !isListening && (
              <button
                onClick={speaking ? stopSpeaking : () => speakText(lastAssistantMessage)}
                className={`p-3 rounded-full border border-[#E8E4EF] dark:border-sky-400/20 text-[#8B6FC9] dark:text-white transition cursor-pointer ${
                  speaking ? 'bg-[#C49A5A] text-white' : 'bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-[#060e1e] dark:hover:bg-sky-500/20'
                }`}
                title={speaking ? 'Stop speaking' : 'Read last response aloud'}
              >
                {speaking ? <Square size={16} /> : <Volume2 size={16} />}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
