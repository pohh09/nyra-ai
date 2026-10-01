'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Globe,
  Cpu,
  Workflow,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const STEPS = [
  {
    number: '01',
    id: 'ask',
    title: 'ASK',
    subtitle: 'Input prompt or file',
    description: 'Start with a question, coding task, or PDF document.',
    icon: MessageSquare,
    tag: 'Input',
  },
  {
    number: '02',
    id: 'ground',
    title: 'GROUND',
    subtitle: 'Retrieve real context',
    description: 'Pulls live web search, document text, and saved memory.',
    icon: Globe,
    tag: 'Context',
  },
  {
    number: '03',
    id: 'reason',
    title: 'REASON',
    subtitle: 'Model inference',
    description: 'Processes your request with Groq, Gemini, or OpenAI models.',
    icon: Cpu,
    tag: 'Reasoning',
  },
  {
    number: '04',
    id: 'act',
    title: 'ACT',
    subtitle: 'Actionable output',
    description: 'Delivers clean code, task checklists, and verified citations.',
    icon: Workflow,
    tag: 'Output',
  },
];

export default function HowNyraWorksSection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full bg-transparent py-20 sm:py-28 lg:py-32 overflow-hidden transition-colors"
    >
      {/* Anchor alias */}
      <span id="architecture" className="scroll-mt-28 absolute top-0" />

      {/* Ambient Spotlight */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#B31372]/[0.05] rounded-full blur-3xl" />

      <div className="w-[94%] sm:w-[90%] max-w-[1800px] mx-auto px-2 sm:px-4 space-y-14 sm:space-y-20 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-[#16091F]/70 px-3.5 py-1.5 text-xs font-semibold text-pink-200 shadow-sm backdrop-blur-xl mb-3.5">
            <Cpu className="h-3.5 w-3.5 text-pink-400" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-pink-300">
              WORKFLOW TIMELINE
            </span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How Nyra{' '}
            <span className="bg-gradient-to-r from-white via-pink-200 to-rose-200 bg-clip-text text-transparent">
              works.
            </span>
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#A7A7B0] max-w-2xl leading-relaxed">
            From input to verified execution in four simple steps.
          </p>
        </motion.div>

        {/* Connected Visual Timeline */}
        <div className="relative">
          
          {/* Desktop Connected Illuminating Line */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-white/[0.08] z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-[#E52A83] to-cyan-400"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </div>

          {/* Timeline Grid (Horizontal on Desktop, Vertical on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 relative z-10">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isHovered = activeStep === idx;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group cursor-default ${
                    isHovered
                      ? 'border border-pink-500/40 bg-[#140620]/90 shadow-[0_12px_40px_rgba(229,42,131,0.15)] -translate-y-1'
                      : 'border border-white/[0.08] bg-[#0A0512]/80 hover:border-white/20 hover:bg-[#100518]'
                  }`}
                >
                  <div>
                    {/* Top: Large Number Node */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center font-mono text-base font-bold transition-all ${
                          isHovered
                            ? 'bg-gradient-to-tr from-[#E52A83] to-[#B31372] text-white shadow-lg shadow-pink-950/60 scale-105'
                            : 'bg-white/[0.06] text-pink-300 border border-white/10 group-hover:border-pink-500/30'
                        }`}
                      >
                        {step.number}
                      </div>
                      
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-pink-300/80 group-hover:text-white transition-colors">
                        <StepIcon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-pink-400">
                        {step.subtitle}
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-pink-100 transition-colors">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs sm:text-[13.5px] text-[#A7A7B0] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Layer Indicator */}
                  <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8E8E98] group-hover:text-pink-300/80 transition-colors">
                    <span>{step.tag}</span>
                    <span className="text-white/30 group-hover:text-pink-300 transition-colors">&rarr;</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
