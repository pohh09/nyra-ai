'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Zap, Brain, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  USER_FACING_MODELS,
  AI_MODELS,
  AIModelConfig,
  DEFAULT_MODEL_ID,
  getModelConfig,
} from '@/lib/models';
import { useToast } from '@/components/ui/Toast';

export { USER_FACING_MODELS, AI_MODELS, DEFAULT_MODEL_ID, getModelConfig };
export type { AIModelConfig };

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  dropUp?: boolean;
  compact?: boolean;
  variant?: 'navbar' | 'compact' | 'pill';
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  dropUp = false,
  compact = false,
  variant = 'pill',
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<Record<string, boolean>>({
    groq: true,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const selectedModel = getModelConfig(selectedModelId);

  // Fetch active provider availability from server
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configuredProviders) {
          setConfiguredProviders(data.configuredProviders);
        }
      })
      .catch((e) => console.warn('Provider check error:', e));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (model: AIModelConfig) => {
    if (model.id === 'fast' || model.modelIdentifier === 'llama-3.1-8b-instant') {
      return <Zap size={13} className="text-[#8B6FC9] dark:text-purple-400" />;
    }
    if (model.id === 'advanced' || model.modelIdentifier === 'llama-3.3-70b-versatile') {
      return <Brain size={13} className="text-[#7E9AC7] dark:text-violet-400" />;
    }
    if (model.id === 'reasoning' || model.modelIdentifier?.includes('r1')) {
      return <Cpu size={13} className="text-[#9F88D4] dark:text-fuchsia-400" />;
    }
    return <Sparkles size={13} className="text-[#8B6FC9] dark:text-purple-400" />;
  };

  const getDisplayName = (model: AIModelConfig) => {
    if (model.id === 'fast' || model.modelIdentifier === 'llama-3.1-8b-instant') return 'Fast';
    if (model.id === 'advanced' || model.modelIdentifier === 'llama-3.3-70b-versatile') return 'Advanced';
    if (model.id === 'reasoning' || model.modelIdentifier?.includes('r1')) return 'Reasoning';
    if (model.id === 'balanced' || model.modelIdentifier === 'qwen/qwen3.6-27b') return 'Balanced';
    return model.name || 'Balanced';
  };

  const handleSelect = (model: AIModelConfig) => {
    const isConfigured = configuredProviders[model.provider] ?? false;
    if (!isConfigured) {
      addToast({
        type: 'error',
        title: `${model.providerDisplayName} API key not configured in environment`,
      });
      return;
    }

    onSelectModel(model.id);
    setOpen(false);
    addToast({
      type: 'success',
      title: `AI Mode set to ${getDisplayName(model)}`,
    });
  };

  const isSelectedConfigured = configuredProviders[selectedModel.provider] ?? true;
  const effectiveModel = isSelectedConfigured ? selectedModel : getModelConfig(DEFAULT_MODEL_ID);

  return (
    <div ref={containerRef} className="relative z-30">
      {variant === 'navbar' ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl hover:bg-[#EEE8FA] dark:hover:bg-white/[0.08] text-[#292633] dark:text-white transition-all cursor-pointer select-none min-w-0"
          title={`AI Model: ${getDisplayName(effectiveModel)} - Click to switch`}
          aria-label={`AI Model: ${getDisplayName(effectiveModel)}`}
        >
          <span className="text-sm sm:text-base md:text-[17px] font-semibold text-[#292633] dark:text-slate-100 group-hover:text-[#8B6FC9] dark:group-hover:text-white tracking-tight flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span>Nyra</span>
            <span className="text-[#686477] dark:text-slate-400 font-normal text-xs sm:text-sm md:text-[15px] truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">
              {getDisplayName(effectiveModel)}
            </span>
          </span>
          <ChevronDown
            size={14}
            className={`text-[#92909B] dark:text-slate-400 group-hover:text-[#292633] dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
              open ? 'rotate-180 text-[#8B6FC9] dark:text-purple-400' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#F5F3F9] hover:bg-[#EEE8FA] dark:bg-purple-500/10 dark:hover:bg-purple-500/20 hover:border-[#8B6FC9]/40 transition-all font-semibold text-[#292633] dark:text-white shadow-xs cursor-pointer active:scale-95 ${
            compact ? 'px-2 sm:px-2.5 py-1 text-xs' : 'px-2.5 sm:px-3 py-1.5 text-xs'
          }`}
          title={`AI Mode: ${getDisplayName(effectiveModel)} ${
            effectiveModel.modelInfo ? `(${effectiveModel.modelInfo})` : ''
          } - Click to switch`}
          aria-label={`Current AI Mode: ${getDisplayName(effectiveModel)}`}
        >
          <span className="shrink-0">{getModelIcon(effectiveModel)}</span>
          <span className="truncate max-w-[90px] sm:max-w-[150px] text-[#292633] dark:text-purple-100 font-medium">
            {getDisplayName(effectiveModel)}
          </span>
          <ChevronDown
            size={12}
            className={`text-[#92909B] dark:text-purple-300/70 transition-transform duration-200 shrink-0 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              dropUp ? 'bottom-10 left-0' : 'top-10 right-0 sm:left-0 sm:right-auto'
            } w-[290px] sm:w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF] dark:bg-[#130f24]/98 backdrop-blur-2xl shadow-[0_10px_40px_rgba(41,38,51,0.08)] dark:shadow-[0_10px_40px_rgba(10,5,20,0.9),0_0_20px_rgba(168,85,247,0.15)] overflow-hidden p-2 z-50 animate-[fadeIn_0.1s_ease-out]`}
          >
            {/* Header */}
            <div className="px-2.5 py-1.5 border-b border-[#E8E4EF] dark:border-purple-400/15 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#92909B] dark:text-slate-400 font-mono">
                AI Workspace Mode
              </span>
              <span className="text-[10px] font-mono text-[#8B6FC9] dark:text-purple-400 font-bold uppercase">
                {USER_FACING_MODELS.length} Modes
              </span>
            </div>

            {/* Model Modes List */}
            <div className="space-y-1">
              {USER_FACING_MODELS.map((model) => {
                const isSelected =
                  model.id === selectedModelId ||
                  model.modelIdentifier === selectedModelId ||
                  (selectedModelId === 'qwen/qwen3.6-27b' && model.id === 'balanced') ||
                  (selectedModelId === 'llama-3.1-8b-instant' && model.id === 'fast') ||
                  (selectedModelId === 'llama-3.3-70b-versatile' && model.id === 'advanced') ||
                  (selectedModelId === 'deepseek-r1-distill-llama-70b' && model.id === 'reasoning');

                const isConfigured = configuredProviders[model.provider] ?? false;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelect(model)}
                    disabled={!isConfigured}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEE8FA] dark:bg-purple-600/25 border border-[#E8E4EF] dark:border-purple-400/50 text-[#292633] dark:text-white shadow-xs'
                        : 'hover:bg-[#F5F3F9] dark:hover:bg-white/[0.05] border border-transparent text-[#686477] dark:text-slate-300'
                    } ${!isConfigured ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">{getModelIcon(model)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs font-bold ${
                              isSelected ? 'text-[#292633] dark:text-white' : 'text-[#292633] dark:text-slate-200'
                            }`}
                          >
                            {getDisplayName(model)}
                          </p>
                          {model.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                                model.badgeColor || 'bg-[#EEE8FA] dark:bg-sky-950/80 text-[#6B52A3] dark:text-sky-300 border-[#E8E4EF] dark:border-sky-700/50'
                              }`}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>

                        {model.modelInfo && (
                          <span className="text-[9.5px] font-mono text-[#92909B] dark:text-slate-400/80">
                            {model.modelInfo}
                          </span>
                        )}
                      </div>

                      <p className="text-[10.5px] text-[#686477] dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                        {model.description}
                      </p>
                    </div>

                    {isSelected && (
                      <Check size={13} className="text-[#8B6FC9] dark:text-purple-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

