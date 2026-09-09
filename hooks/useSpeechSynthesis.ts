'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cleanTextForSpeech, splitTextIntoSpeechChunks } from '@/lib/speechText';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chunkIndexRef = useRef(0);
  const chunksRef = useRef<string[]>([]);
  const activeMessageIdRef = useRef<string | null>(null);

  // Initialize and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);

        const savedVoice = localStorage.getItem('nyra_selected_voice');
        if (savedVoice && available.some((v) => v.name === savedVoice)) {
          setSelectedVoiceName(savedVoice);
        } else if (available.length > 0) {
          const defaultVoice =
            available.find((v) => v.default) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0];
          if (defaultVoice) {
            setSelectedVoiceName(defaultVoice.name);
          }
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      const savedRate = localStorage.getItem('nyra_voice_rate');
      if (savedRate) {
        const parsedRate = parseFloat(savedRate);
        if (!isNaN(parsedRate) && parsedRate >= 0.5 && parsedRate <= 2) {
          setRate(parsedRate);
        }
      }
    }
  }, []);

  const handleSetVoice = useCallback((voiceName: string) => {
    setSelectedVoiceName(voiceName);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyra_selected_voice', voiceName);
    }
  }, []);

  const handleSetRate = useCallback((newRate: number) => {
    setRate(newRate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyra_voice_rate', String(newRate));
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    activeMessageIdRef.current = null;
    setSpeakingMessageId(null);
  }, []);

  const speakNextChunk = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (chunkIndexRef.current >= chunksRef.current.length) {
      // Completed reading all chunks
      stop();
      return;
    }

    const chunkText = chunksRef.current[chunkIndexRef.current];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    // Apply voice
    if (selectedVoiceName) {
      const voiceObj = voices.find((v) => v.name === selectedVoiceName);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.rate = rate;

    utterance.onend = () => {
      chunkIndexRef.current += 1;
      speakNextChunk();
    };

    utterance.onerror = (e) => {
      // Interrupted error happens on cancel, which is normal
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      stop();
    };

    window.speechSynthesis.speak(utterance);
  }, [rate, selectedVoiceName, voices, stop]);

  const speak = useCallback(
    (messageId: string, markdownContent: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Always cancel any active speech first (strictly one speech at a time)
      stop();

      const cleanedText = cleanTextForSpeech(markdownContent);
      if (!cleanedText) return;

      const chunks = splitTextIntoSpeechChunks(cleanedText);
      if (chunks.length === 0) return;

      chunksRef.current = chunks;
      chunkIndexRef.current = 0;
      activeMessageIdRef.current = messageId;
      setSpeakingMessageId(messageId);

      speakNextChunk();
    },
    [speakNextChunk, stop]
  );

  // Stop speech if page unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    voices,
    selectedVoiceName,
    setVoice: handleSetVoice,
    rate,
    setRate: handleSetRate,
    speak,
    stop,
    isSpeaking: speakingMessageId !== null,
    speakingMessageId,
  };
}
