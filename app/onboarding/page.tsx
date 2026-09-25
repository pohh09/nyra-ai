'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  Palette,
  GraduationCap,
  Briefcase,
  TrendingUp,
  PenTool,
  Search,
  DollarSign,
  Gamepad2,
  Plane,
  Heart,
  HelpCircle,
  Lightbulb,
  Hammer,
  Zap,
  BookOpen,
  Compass,
  Rocket,
  Brain,
  Layers,
  Cpu,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

// STEP 1: INTERESTS (2x2 Grid)
const INTEREST_OPTIONS = [
  { id: 'tech_coding', label: 'Tech & Coding', tag: 'AI & Systems', icon: Code2, desc: 'Development, AI models, algorithms & systems' },
  { id: 'design_creativity', label: 'Design & Craft', tag: 'UI/UX & Art', icon: Palette, desc: 'Visual craft, product design & creative concepts' },
  { id: 'business_startups', label: 'Business & Startups', tag: 'Strategy', icon: Rocket, desc: 'Ventures, product building & go-to-market' },
  { id: 'learning_research', label: 'Learning & Research', tag: 'Mastery', icon: GraduationCap, desc: 'New skills, deep analysis & structured knowledge' },
];

// STEP 2: GOALS (2x2 Grid)
const GOAL_OPTIONS = [
  { id: 'build_projects', label: 'Build Projects', tag: 'Execution', icon: Hammer, desc: 'Turn ideas into software, apps, and workflows' },
  { id: 'learn_new', label: 'Learn & Deep Dive', tag: 'Knowledge', icon: BookOpen, desc: 'Master new topics, frameworks & concepts' },
  { id: 'get_work_done', label: 'Fast Execution', tag: 'Velocity', icon: Zap, desc: 'Fast problem-solving, debugging & tasks' },
  { id: 'brainstorm_ideas', label: 'Brainstorm & Plan', tag: 'Creativity', icon: Lightbulb, desc: 'Generate creative angles, ideas & roadmaps' },
];

// STEP 3: WORK STYLE (2x2 Grid)
const WORK_STYLE_OPTIONS = [
  { id: 'just_answer', label: 'Direct & Concise', tag: 'Fast Answers', icon: Zap, desc: 'Direct, clear answers without extra fluff' },
  { id: 'teach_step_by_step', label: 'Step-by-Step', tag: 'Mentorship', icon: GraduationCap, desc: 'Break down logic and teach core fundamentals' },
  { id: 'go_deeper', label: 'Deep Architectural', tag: 'Systems', icon: Brain, desc: 'Underlying mechanisms, edge cases & trade-offs' },
  { id: 'build_with_me', label: 'Pair Programmer', tag: 'Co-Pilot', icon: Hammer, desc: 'Iterative, collaborative problem-solving partner' },
];

// STEP 4: EXPERIENCE LEVEL (2x2 Grid)
const EXPERIENCE_OPTIONS = [
  { id: 'Beginner', label: 'Beginner', tag: 'Zero Jargon', icon: Compass, desc: 'Intuitive, simple, and friendly explanations' },
  { id: 'Comfortable', label: 'Comfortable', tag: 'Balanced Tech', icon: Zap, desc: 'Balanced technical clarity & practical code examples' },
  { id: 'Advanced', label: 'Advanced', tag: 'Architectural', icon: Layers, desc: 'High-level technical patterns & architectural depth' },
  { id: 'Expert', label: 'Expert', tag: 'Dense & Direct', icon: Brain, desc: 'Dense, concise insights assuming deep industry experience' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, saveOnboardingPreferences, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string[]>([]);
  const [selectedExpLevel, setSelectedExpLevel] = useState<string>('Comfortable');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if already completed onboarding or not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.onboardingCompleted) {
        router.push('/chat-ui');
      }
    }
  }, [user, profile, authLoading, router]);

  const toggleMultiSelect = (item: string, list: string[], setList: (vals: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedInterests.length > 0;
      case 2:
        return selectedGoals.length > 0;
      case 3:
        return selectedWorkStyle.length > 0;
      case 4:
        return Boolean(selectedExpLevel);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async (skip: boolean = false) => {
    setIsSaving(true);
    try {
      const payload = {
        interests: skip ? (selectedInterests.length > 0 ? selectedInterests : ['Tech & Coding', 'Learning & Research']) : selectedInterests,
        goals: skip ? (selectedGoals.length > 0 ? selectedGoals : ['Build Projects', 'Fast Execution']) : selectedGoals,
        workStyle: skip ? (selectedWorkStyle.length > 0 ? selectedWorkStyle : ['Pair Programmer']) : selectedWorkStyle,
        experienceLevel: selectedExpLevel || 'Comfortable',
      };

      const res = await saveOnboardingPreferences(payload);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Workspace Personalized',
          description: 'Your Nyra preferences are configured and ready.',
        });
        router.push('/chat-ui');
      } else {
        addToast({
          type: 'error',
          title: res.error || 'Failed to save preferences',
        });
        router.push('/chat-ui');
      }
    } catch {
      router.push('/chat-ui');
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic persona synthesis label for Step 5
  const getSynthesizedPersona = () => {
    if (selectedWorkStyle.includes('Pair Programmer') || selectedWorkStyle.includes('Build with me')) return 'Collaborative Pair-Architect';
    if (selectedWorkStyle.includes('Direct & Concise') || selectedWorkStyle.includes('Just give me the answer')) return 'High-Velocity Pragmatist';
    if (selectedWorkStyle.includes('Step-by-Step') || selectedWorkStyle.includes('Teach me step-by-step')) return 'Interactive Knowledge Mentor';
    if (selectedWorkStyle.includes('Deep Architectural') || selectedWorkStyle.includes('Go deeper')) return 'Deep Systems Explorer';
    return 'Adaptive AI Collaborator';
  };

  const totalSteps = 5;
  const progressPercent = Math.min(100, Math.round((step / totalSteps) * 100));

  if (authLoading) {
    return (
      <div className="min-h-screen dark:bg-[#07080D] bg-[#F8F7FB] dark:text-white text-[#292633] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B6FC9] mb-4" />
        <p className="text-sm dark:text-white/50 text-[#686477] tracking-wide font-medium">Calibrating your neural workspace...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen dark:bg-[#07080D] bg-[#F8F7FB] dark:text-white text-[#292633] flex flex-col selection:bg-[#8B6FC9]/30 overflow-x-hidden transition-colors">
      {/* Dynamic ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 dark:opacity-100 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 18%, rgba(139, 111, 201, 0.1) 0%, rgba(7, 8, 13, 0) 80%)',
        }}
      />

      {/* Main container occupying ~88% of screen width on desktop, full width with padding on mobile */}
      <div className="relative z-10 w-full sm:w-[92%] md:w-[88%] lg:w-[82%] max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-10 pt-5 sm:pt-10 pb-8 sm:pb-12 flex flex-col flex-1">
        
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-5 sm:pb-10">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="relative w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E8E4EF] dark:border-white/10 ring-1 ring-[#8B6FC9]/20 bg-[#120726]">
              <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" priority />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight dark:text-white text-[#292633]">Nyra AI</span>
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md dark:bg-[#8B6FC9]/20 bg-purple-100 dark:text-[#C4B5FD] text-purple-700 border dark:border-[#8B6FC9]/30 border-purple-200">
                Setup
              </span>
            </div>
          </div>

          {step < 5 && (
            <button
              type="button"
              onClick={() => handleFinish(true)}
              className="text-xs sm:text-sm font-medium dark:text-white/50 text-[#686477] dark:hover:text-white hover:text-[#292633] transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-[#EAE7F2] cursor-pointer"
            >
              Skip for now
            </button>
          )}
        </header>

        {/* Progress Section */}
        <div className="w-full mb-5 sm:mb-8">
          <div className="flex items-center justify-between text-xs sm:text-sm dark:text-white/50 text-[#686477] mb-2 font-medium">
            <span className="dark:text-white/70 text-[#292633] flex items-center gap-1.5 sm:gap-2">
              <span>{step === 5 ? 'Ready' : `Step ${step} of 4`}</span>
              {step < 5 && (
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full dark:bg-white/[0.05] bg-[#EAE7F2] border dark:border-white/[0.08] border-[#E8E4EF] dark:text-purple-300 text-purple-700 font-medium">
                  {step === 1 && (selectedInterests.length > 0 ? `${selectedInterests.length} selected` : 'Select topics')}
                  {step === 2 && (selectedGoals.length > 0 ? `${selectedGoals.length} selected` : 'Pick goals')}
                  {step === 3 && (selectedWorkStyle.length > 0 ? `${selectedWorkStyle.length} selected` : 'Pick style')}
                  {step === 4 && selectedExpLevel}
                </span>
              )}
            </span>
            <span className="dark:text-[#C4B5FD] text-purple-700 font-semibold text-xs sm:text-sm">{progressPercent}% configured</span>
          </div>
          <div className="w-full h-1.5 dark:bg-white/[0.08] bg-[#E8E4EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B6FC9] to-[#A78BFA] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="w-full flex-1">
          <AnimatePresence mode="wait">
            {/* STEP 1: INTERESTS (2x2 Grid) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-4 sm:mb-6 text-left">
                  <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider dark:text-[#C4B5FD] text-purple-700 dark:bg-[#8B6FC9]/15 bg-purple-100 px-2 py-0.5 rounded-md border dark:border-[#8B6FC9]/25 border-purple-200">
                      Domain Focus
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold tracking-tight dark:text-white text-[#292633] leading-tight">
                    What are you into?
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base dark:text-white/60 text-[#686477] mt-1 sm:mt-1.5 leading-relaxed">
                    Pick a few core topics you’d like Nyra to focus on.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-4.5">
                  {INTEREST_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedInterests.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMultiSelect(item.label, selectedInterests, setSelectedInterests)}
                        className={`group p-3 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[118px] sm:min-h-[135px] active:scale-[0.98] sm:hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[#8B6FC9] dark:bg-[#8B6FC9]/[0.14] bg-[#8B6FC9]/[0.08] shadow-[0_0_24px_rgba(139,111,201,0.2)] ring-1 ring-[#8B6FC9]/40'
                            : 'dark:border-white/[0.08] border-[#E8E4EF] dark:bg-white/[0.025] bg-white dark:hover:bg-white/[0.06] hover:bg-[#F5F3F9] dark:hover:border-white/[0.2] hover:border-[#8B6FC9]/40 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 w-full mb-2">
                          <div
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#8B6FC9] text-white shadow-md'
                                : 'dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-[#C4B5FD] text-[#8B6FC9] group-hover:text-[#8B6FC9] dark:group-hover:text-white border dark:border-white/[0.06] border-[#E8E4EF]'
                            }`}
                          >
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#8B6FC9] border-[#8B6FC9] text-white shadow-sm'
                                : 'dark:border-white/20 border-[#D1CBDD] bg-transparent text-transparent group-hover:border-[#8B6FC9]'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[13px] sm:text-[15.5px] font-semibold dark:text-white/95 text-[#292633] dark:group-hover:text-white leading-snug">
                              {item.label}
                            </p>
                            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 rounded dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/40 text-[#686477] border dark:border-white/[0.05] border-[#E8E4EF]">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs md:text-[13px] dark:text-white/50 text-[#686477] leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: GOALS (2x2 Grid) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-4 sm:mb-6 text-left">
                  <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider dark:text-[#C4B5FD] text-purple-700 dark:bg-[#8B6FC9]/15 bg-purple-100 px-2 py-0.5 rounded-md border dark:border-[#8B6FC9]/25 border-purple-200">
                      Core Objectives
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold tracking-tight dark:text-white text-[#292633] leading-tight">
                    What are we working towards?
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base dark:text-white/60 text-[#686477] mt-1 sm:mt-1.5 leading-relaxed">
                    Choose what you primarily want to achieve together.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-4.5">
                  {GOAL_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedGoals.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMultiSelect(item.label, selectedGoals, setSelectedGoals)}
                        className={`group p-3 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[118px] sm:min-h-[135px] active:scale-[0.98] sm:hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[#8B6FC9] dark:bg-[#8B6FC9]/[0.14] bg-[#8B6FC9]/[0.08] shadow-[0_0_24px_rgba(139,111,201,0.2)] ring-1 ring-[#8B6FC9]/40'
                            : 'dark:border-white/[0.08] border-[#E8E4EF] dark:bg-white/[0.025] bg-white dark:hover:bg-white/[0.06] hover:bg-[#F5F3F9] dark:hover:border-white/[0.2] hover:border-[#8B6FC9]/40 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 w-full mb-2">
                          <div
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#8B6FC9] text-white shadow-md'
                                : 'dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-[#C4B5FD] text-[#8B6FC9] group-hover:text-[#8B6FC9] dark:group-hover:text-white border dark:border-white/[0.06] border-[#E8E4EF]'
                            }`}
                          >
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#8B6FC9] border-[#8B6FC9] text-white shadow-sm'
                                : 'dark:border-white/20 border-[#D1CBDD] bg-transparent text-transparent group-hover:border-[#8B6FC9]'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[13px] sm:text-[15.5px] font-semibold dark:text-white/95 text-[#292633] dark:group-hover:text-white leading-snug">
                              {item.label}
                            </p>
                            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 rounded dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/40 text-[#686477] border dark:border-white/[0.05] border-[#E8E4EF]">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs md:text-[13px] dark:text-white/50 text-[#686477] leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: WORK STYLE (2x2 Grid) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-4 sm:mb-6 text-left">
                  <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider dark:text-[#C4B5FD] text-purple-700 dark:bg-[#8B6FC9]/15 bg-purple-100 px-2 py-0.5 rounded-md border dark:border-[#8B6FC9]/25 border-purple-200">
                      Collaboration Dynamic
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold tracking-tight dark:text-white text-[#292633] leading-tight">
                    How do you like to work?
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base dark:text-white/60 text-[#686477] mt-1 sm:mt-1.5 leading-relaxed">
                    Choose how Nyra should collaborate and communicate with you.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-4.5">
                  {WORK_STYLE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedWorkStyle.includes(item.label);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMultiSelect(item.label, selectedWorkStyle, setSelectedWorkStyle)}
                        className={`group p-3 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[118px] sm:min-h-[135px] active:scale-[0.98] sm:hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[#8B6FC9] dark:bg-[#8B6FC9]/[0.14] bg-[#8B6FC9]/[0.08] shadow-[0_0_24px_rgba(139,111,201,0.2)] ring-1 ring-[#8B6FC9]/40'
                            : 'dark:border-white/[0.08] border-[#E8E4EF] dark:bg-white/[0.025] bg-white dark:hover:bg-white/[0.06] hover:bg-[#F5F3F9] dark:hover:border-white/[0.2] hover:border-[#8B6FC9]/40 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 w-full mb-2">
                          <div
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#8B6FC9] text-white shadow-md'
                                : 'dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-[#C4B5FD] text-[#8B6FC9] group-hover:text-[#8B6FC9] dark:group-hover:text-white border dark:border-white/[0.06] border-[#E8E4EF]'
                            }`}
                          >
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#8B6FC9] border-[#8B6FC9] text-white shadow-sm'
                                : 'dark:border-white/20 border-[#D1CBDD] bg-transparent text-transparent group-hover:border-[#8B6FC9]'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[13px] sm:text-[15.5px] font-semibold dark:text-white/95 text-[#292633] dark:group-hover:text-white leading-snug">
                              {item.label}
                            </p>
                            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 rounded dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/40 text-[#686477] border dark:border-white/[0.05] border-[#E8E4EF]">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs md:text-[13px] dark:text-white/50 text-[#686477] leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: EXPERIENCE LEVEL (2x2 Grid) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-4 sm:mb-6 text-left">
                  <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider dark:text-[#C4B5FD] text-purple-700 dark:bg-[#8B6FC9]/15 bg-purple-100 px-2 py-0.5 rounded-md border dark:border-[#8B6FC9]/25 border-purple-200">
                      Response Calibration
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-[30px] font-bold tracking-tight dark:text-white text-[#292633] leading-tight">
                    How should Nyra explain things?
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base dark:text-white/60 text-[#686477] mt-1 sm:mt-1.5 leading-relaxed">
                    Select your preferred depth and technical explanation style.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-4.5">
                  {EXPERIENCE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedExpLevel === item.label;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedExpLevel(item.label)}
                        className={`group p-3 sm:p-4.5 md:p-5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[118px] sm:min-h-[135px] active:scale-[0.98] sm:hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[#8B6FC9] dark:bg-[#8B6FC9]/[0.14] bg-[#8B6FC9]/[0.08] shadow-[0_0_24px_rgba(139,111,201,0.2)] ring-1 ring-[#8B6FC9]/40'
                            : 'dark:border-white/[0.08] border-[#E8E4EF] dark:bg-white/[0.025] bg-white dark:hover:bg-white/[0.06] hover:bg-[#F5F3F9] dark:hover:border-white/[0.2] hover:border-[#8B6FC9]/40 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 w-full mb-2">
                          <div
                            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#8B6FC9] text-white shadow-md'
                                : 'dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-[#C4B5FD] text-[#8B6FC9] group-hover:text-[#8B6FC9] dark:group-hover:text-white border dark:border-white/[0.06] border-[#E8E4EF]'
                            }`}
                          >
                            <Icon size={18} className="sm:w-5 sm:h-5" />
                          </div>
                          <div
                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#8B6FC9] bg-[#8B6FC9]/25 shadow-sm'
                                : 'dark:border-white/20 border-[#D1CBDD] bg-transparent group-hover:border-[#8B6FC9]'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#8B6FC9] shadow-[0_0_8px_#A78BFA]" />
                            )}
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <p className="text-[13px] sm:text-[15.5px] font-semibold dark:text-white/95 text-[#292633] dark:group-hover:text-white leading-snug">
                              {item.label}
                            </p>
                            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.2 rounded dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/40 text-[#686477] border dark:border-white/[0.05] border-[#E8E4EF]">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs md:text-[13px] dark:text-white/50 text-[#686477] leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: READY / WORKSPACE BLUEPRINT */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-[580px] mx-auto text-center py-1 sm:py-6"
              >
                {/* Completion Brand Icon with pulsing aura */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3.5 sm:mb-4.5">
                  <div className="absolute inset-0 rounded-2xl bg-[#8B6FC9]/40 blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,111,201,0.45)] ring-2 ring-purple-400/30 border border-white/20 bg-[#120726]">
                    <Image src="/logo.png" alt="Nyra AI Logo" fill className="object-cover" priority />
                  </div>
                </div>

                {/* Hero Heading & Subtitle */}
                <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold tracking-tight dark:text-white text-[#292633] mb-1 sm:mb-1.5 leading-tight">
                  Okay, I think I get your vibe.
                </h2>
                <p className="text-xs sm:text-sm dark:text-white/60 text-[#686477] max-w-md mx-auto leading-relaxed mb-4 sm:mb-6">
                  Your personalized Nyra neural workspace is configured and calibrated.
                </p>

                {/* Workspace Blueprint Summary Card */}
                <div className="w-full mb-5 sm:mb-7 p-4 sm:p-6 rounded-2xl dark:bg-white/[0.035] bg-white border dark:border-white/[0.09] border-[#E8E4EF] text-left shadow-lg shadow-black/5 dark:shadow-black/20 relative overflow-hidden">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3.5 border-b dark:border-white/[0.07] border-[#E8E4EF]">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="dark:text-[#C4B5FD] text-[#8B6FC9]" />
                      <p className="text-xs font-bold uppercase tracking-wider dark:text-[#C4B5FD] text-[#8B6FC9]">
                        Workspace Blueprint
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono dark:text-white/50 text-[#686477] dark:bg-white/[0.04] bg-[#F5F3F9] px-2 py-0.5 rounded border dark:border-white/[0.06] border-[#E8E4EF]">
                      SYNTH-AI
                    </span>
                  </div>

                  {/* Active Persona Profile Banner */}
                  <div className="mb-3.5 p-3 rounded-xl dark:bg-[#8B6FC9]/10 bg-purple-50/80 border dark:border-[#8B6FC9]/25 border-purple-200/80 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg dark:bg-[#8B6FC9]/20 bg-purple-100 flex items-center justify-center shrink-0">
                        <Cpu size={16} className="dark:text-[#C4B5FD] text-[#8B6FC9]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider dark:text-white/45 text-[#686477] font-semibold leading-none mb-1">
                          Active Persona Profile
                        </p>
                        <p className="text-xs sm:text-sm font-bold dark:text-white text-[#292633] truncate">
                          {getSynthesizedPersona()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 dark:bg-emerald-500/10 bg-emerald-50 px-2 py-1 rounded-md border dark:border-emerald-500/20 border-emerald-200">
                      <ShieldCheck size={13} />
                      <span>Ready</span>
                    </div>
                  </div>
                  
                  {/* Dynamic Traits List with Responsive Badges */}
                  <div className="space-y-2.5 sm:space-y-3 divide-y dark:divide-white/[0.05] divide-[#E8E4EF]/70 text-xs sm:text-sm">
                    {/* Interests */}
                    <div className="flex items-start justify-between gap-3 pt-1 first:pt-0">
                      <span className="dark:text-white/45 text-[#686477] text-xs sm:text-[13px] font-medium shrink-0 pt-0.5">
                        Interests
                      </span>
                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[72%]">
                        {(selectedInterests.length > 0 ? selectedInterests : ['Tech & Coding', 'Learning & Research']).map((item) => (
                          <span
                            key={item}
                            className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/90 text-[#292633] border dark:border-white/[0.06] border-[#E8E4EF] leading-tight"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="flex items-start justify-between gap-3 pt-2.5">
                      <span className="dark:text-white/45 text-[#686477] text-xs sm:text-[13px] font-medium shrink-0 pt-0.5">
                        Goals
                      </span>
                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[72%]">
                        {(selectedGoals.length > 0 ? selectedGoals : ['Build Projects', 'Fast Execution']).map((item) => (
                          <span
                            key={item}
                            className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/90 text-[#292633] border dark:border-white/[0.06] border-[#E8E4EF] leading-tight"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Work Style */}
                    <div className="flex items-start justify-between gap-3 pt-2.5">
                      <span className="dark:text-white/45 text-[#686477] text-xs sm:text-[13px] font-medium shrink-0 pt-0.5">
                        Work Style
                      </span>
                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[72%]">
                        {(selectedWorkStyle.length > 0 ? selectedWorkStyle : ['Pair Programmer']).map((item) => (
                          <span
                            key={item}
                            className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md dark:bg-white/[0.05] bg-[#F5F3F9] dark:text-white/90 text-[#292633] border dark:border-white/[0.06] border-[#E8E4EF] leading-tight"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Depth Level */}
                    <div className="flex items-center justify-between gap-3 pt-2.5">
                      <span className="dark:text-white/45 text-[#686477] text-xs sm:text-[13px] font-medium shrink-0">
                        Depth Level
                      </span>
                      <span className="text-[11.5px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-md dark:bg-[#8B6FC9]/15 bg-purple-100 dark:text-[#C4B5FD] text-[#8B6FC9] border dark:border-[#8B6FC9]/25 border-purple-200">
                        {selectedExpLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 w-full">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-12 px-5 rounded-xl border dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.03] bg-white dark:hover:bg-white/[0.08] hover:bg-[#F5F3F9] dark:text-white/70 text-[#686477] dark:hover:text-white hover:text-[#292633] font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ArrowLeft size={15} />
                    <span>Adjust Preferences</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleFinish(false)}
                    className="w-full sm:w-auto sm:min-w-[220px] order-1 sm:order-2 h-11 sm:h-12 px-8 rounded-xl bg-[#8B6FC9] hover:bg-[#795BB8] text-white font-semibold text-sm sm:text-base shadow-[0_4px_24px_rgba(139,111,201,0.35)] hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Entering Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Nyra</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Buttons (Steps 1 to 4) - Sticky on Mobile */}
        {step < 5 && (
          <footer className="sticky sm:static bottom-0 z-20 w-full pt-3.5 pb-2 sm:py-0 sm:pt-10 sm:pb-0 mt-6 sm:mt-8 border-t dark:border-white/[0.08] border-[#E8E4EF] bg-[#F8F7FB]/95 dark:bg-[#07080D]/95 backdrop-blur-xl sm:bg-transparent sm:dark:bg-transparent flex items-center justify-between gap-3 -mx-4 sm:mx-0 px-4 sm:px-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`h-10 sm:h-11 min-w-[76px] sm:min-w-[88px] px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                step === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'border dark:border-white/10 border-[#E8E4EF] dark:bg-white/[0.03] bg-white dark:hover:bg-white/[0.08] hover:bg-[#F5F3F9] dark:text-white/70 text-[#686477] dark:hover:text-white hover:text-[#292633] active:scale-95'
              }`}
            >
              <ArrowLeft size={15} className="sm:w-4 sm:h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`h-10 sm:h-11 flex-1 sm:flex-none sm:min-w-[130px] px-5 sm:px-7 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 ${
                isStepValid()
                  ? 'bg-[#8B6FC9] hover:bg-[#795BB8] text-white shadow-[0_4px_24px_rgba(139,111,201,0.35)] hover:scale-[1.01] active:scale-[0.99]'
                  : 'dark:bg-white/[0.05] bg-[#E8E4EF]/60 dark:text-white/30 text-[#686477]/50 border dark:border-white/[0.05] border-[#E8E4EF] cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight size={15} className="sm:w-4 sm:h-4" />
            </button>
          </footer>
        )}
      </div>
    </main>
  );
}
