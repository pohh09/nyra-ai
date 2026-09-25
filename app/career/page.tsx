'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Briefcase,
  FileText,
  Sparkles,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Target,
  FileEdit,
  MessageCircleQuestion,
  TrendingUp,
  X,
  RotateCcw,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { extractPdfText } from '@/lib/extractPdfText';
import {
  getCareerSessions,
  saveCareerSession,
  CareerSession,
} from '@/lib/services/careerService';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/AuthContext';

const SAMPLE_RESUME_TEXT = `ALEX MORGAN
Full Stack Software Engineer | San Francisco, CA | alex.morgan@email.com | (555) 234-5678 | github.com/alexmorgan | linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Results-driven Full Stack Engineer with 4+ years of experience designing and building high-performance web applications using React, Next.js, TypeScript, Node.js, and PostgreSQL. Experienced in building real-time collaboration features, optimizing database queries, and deploying scalable microservices to AWS and GCP.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3/TailwindCSS
- Frontend: React, Next.js, Redux Toolkit, WebSockets, Responsive Design
- Backend & Cloud: Node.js, Express, PostgreSQL, Redis, Docker, AWS (S3, Lambda, EC2), Supabase, GraphQL
- Tools & Practices: Git/GitHub, CI/CD (GitHub Actions), Jest, Agile/Scrum, RESTful APIs

PROFESSIONAL EXPERIENCE
Senior Full Stack Developer | NexaTech Solutions, San Francisco, CA | 2022 – Present
- Architected and delivered a real-time collaborative dashboard used by 45,000+ active enterprise users, reducing page load latency by 38%.
- Led the migration from monolithic backend to modular serverless API routes on Next.js and Node.js, cutting cloud infrastructure costs by $18,000 annually.
- Integrated PostgreSQL database with Redis caching layer, improving query response times by 45% under high traffic loads.
- Mentored 4 junior engineers and implemented automated CI/CD pipelines with GitHub Actions, increasing deployment frequency from weekly to daily.

Software Engineer | Apex Cloud Labs, Austin, TX | 2020 – 2022
- Developed interactive UI components and dashboards in React and TypeScript for cloud monitoring and analytics platform.
- Designed secure REST and GraphQL endpoints consumed by web and mobile client applications.
- Wrote comprehensive unit and integration test suites using Jest and React Testing Library, achieving 88% code coverage.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2016 – 2020`;

const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Engineer
Company: CloudScale AI
Location: Remote / San Francisco, CA

About the Role:
We are looking for a Senior Full Stack Engineer to build next-generation web applications and intelligent data interfaces. You will work across modern React/Next.js frontend and Node.js/PostgreSQL backend services.

Key Requirements:
- 4+ years of professional full-stack web development experience.
- Strong proficiency in TypeScript, React, and Next.js.
- Strong experience with relational databases (PostgreSQL), Redis caching, and REST/GraphQL APIs.
- Experience with cloud platforms (AWS or GCP) and containerization (Docker).
- Excellent communication skills and passion for building clean, user-centric software architectures.`;

type CareerTab = 'audit' | 'job_match' | 'cover_letter' | 'interview';

export default function CareerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<CareerTab>('audit');

  // Input states
  const [resumeName, setResumeName] = useState('My Resume.pdf');
  const [resumeText, setResumeText] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('Senior Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');

  // Generation / Loading states
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result states
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<string | null>(null);
  const [coverLetterResult, setCoverLetterResult] = useState<string | null>(null);
  const [interviewResult, setInterviewResult] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loaded = getCareerSessions();
    if (loaded.length > 0) {
      const latest = loaded[0];
      setResumeName(latest.resumeName || 'My Resume.pdf');
      setResumeText(latest.resumeText || '');
      setTargetJobTitle(latest.targetJobTitle || 'Senior Full Stack Engineer');
      setJobDescription(latest.jobDescription || '');
    }
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsExtracting(true);
    setErrorMessage(null);

    try {
      let extracted = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const res = await extractPdfText(file);
        extracted = res.text;
      } else {
        extracted = await file.text();
      }

      if (!extracted || extracted.trim().length === 0) {
        throw new Error('Could not extract text from the uploaded resume file. Please ensure it is a text-based PDF or text document.');
      }

      setResumeName(file.name);
      setResumeText(extracted);
      addToast({ type: 'success', title: `Resume uploaded: ${file.name}` });
    } catch (err: any) {
      console.error('Resume upload error:', err);
      addToast({ type: 'error', title: err.message || 'Failed to parse resume' });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    setResumeName('Sample_FullStack_Resume.pdf');
    setResumeText(SAMPLE_RESUME_TEXT);
    setTargetJobTitle('Senior Full Stack Engineer');
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    addToast({ type: 'success', title: 'Sample resume & job loaded! Click "Run Analysis".' });
  };

  const handleStreamAIAction = async (prompt: string, setResult: (val: string) => void) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setResult('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          modelId: 'balanced',
        }),
      });

      if (res.status === 429) {
        const errText = await res.text();
        throw new Error(errText || 'Daily AI request allowance reached.');
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => 'AI analysis request failed');
        throw new Error(errText || 'Failed to generate analysis');
      }

      console.log('[CAREER API STREAM START]', { promptLength: prompt.length, status: res.status });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream response available from AI engine');

      const decoder = new TextDecoder();
      let streamed = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            streamed += chunk;
            setResult(streamed);
          }
        }
      }

      const finalRemaining = decoder.decode();
      if (finalRemaining) {
        streamed += finalRemaining;
        setResult(streamed);
      }

      console.log('[CAREER API STREAM COMPLETE]', { totalChars: streamed.length });

      if (!streamed || streamed.trim().length === 0) {
        throw new Error('Received an empty response from the AI assistant. Please try running the analysis again.');
      }

      if (streamed.includes('✦ Error:')) {
        const cleanErr = streamed.replace(/\n*✦ Error:\s*/g, '').trim();
        setErrorMessage(cleanErr);
      } else {
        // Persist session to local storage
        const newSession: CareerSession = {
          id: `career_${Date.now()}`,
          resumeName,
          resumeText,
          targetJobTitle,
          jobDescription,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveCareerSession(newSession);
        addToast({ type: 'success', title: 'Analysis completed successfully!' });
      }
    } catch (err: any) {
      console.error('AI analysis error:', err);
      const errStr = err.message || 'An unexpected error occurred during analysis.';
      setErrorMessage(errStr);
      setResult(`⚠️ **Analysis Error**: ${errStr}\n\nPlease check your connection or API configuration and click **Run Analysis** again.`);
      addToast({ type: 'error', title: errStr });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAudit = () => {
    if (!resumeText.trim()) {
      addToast({ type: 'error', title: 'Please upload or paste your resume text first' });
      return;
    }

    const prompt = `You are a Senior Technical Recruiter, ATS Specialist, and Executive Career Coach. Perform a comprehensive, structured resume audit:

=== CANDIDATE RESUME ===
${resumeText.trim()}
========================

Provide a structured, actionable evaluation in clean Markdown:
1. **Executive Impression & Profile Summary**: (High-level assessment of candidate background, clarity, and seniority).
2. **Estimated Resume Strength Score**: (Provide a score from 0-100 with clear rationale).
3. **Core Technical & Professional Strengths**: (Key skills, frameworks, and achievements detected).
4. **Critical Gaps & Areas for Improvement**: (Quantified impact metrics, missing tech stack keywords, leadership signals).
5. **High-Impact Bullet Point Rewrites**: (Pick 2-3 specific bullet points from the resume and rewrite them using the Google X-Y-Z formula: "Accomplished [X], measured by [Y], by doing [Z]").
6. **Top 3 Immediate Recommendations**: (Clear, actionable steps to instantly improve interview callback rates).`;

    handleStreamAIAction(prompt, setAuditResult);
  };

  const handleRunJobMatch = () => {
    if (!resumeText.trim()) {
      addToast({ type: 'error', title: 'Please upload or paste your resume text first' });
      return;
    }
    if (!jobDescription.trim()) {
      addToast({ type: 'error', title: 'Please paste the target Job Description to compare against' });
      return;
    }

    const prompt = `You are an Applicant Tracking System (ATS) Expert and Hiring Manager. Compare this candidate's resume against the target job requirements:

=== CANDIDATE RESUME ===
${resumeText.trim()}
========================

=== TARGET JOB DESCRIPTION (${targetJobTitle || 'Target Role'}) ===
${jobDescription.trim()}
========================

Provide a structured, actionable gap analysis in clean Markdown:
1. **Estimated Match Score**: (Provide a score from 0-100 with detailed rationale).
2. **Directly Matching Skills & Experience**: (What matches the job description perfectly).
3. **Missing Keywords & Skill Gaps**: (Critical terms, frameworks, and requirements in the job description that are absent or under-emphasized in the resume).
4. **Seniority & Experience Alignment**: (How well the candidate's years of experience and project scope align with the role).
5. **Step-by-Step ATS Optimization Checklist**: (Exact keyword additions and phrasing changes to maximize ATS ranking and pass screening).`;

    handleStreamAIAction(prompt, setJobMatchResult);
  };

  const handleRunCoverLetter = () => {
    if (!resumeText.trim()) {
      addToast({ type: 'error', title: 'Please upload or paste your resume text first' });
      return;
    }

    const prompt = `You are an Executive Career Coach and Professional Resume Writer. Write a tailored, persuasive, and modern Cover Letter:

=== CANDIDATE RESUME ===
${resumeText.trim()}
========================

=== TARGET ROLE & JOB DESCRIPTION ===
Role: ${targetJobTitle || 'Software Engineer'}
${jobDescription.trim() || 'Modern high-growth software engineering role.'}
========================

Write a modern, authentic cover letter:
- Avoid generic filler and clichés.
- Highlight 2-3 specific, quantified achievements from the resume that directly solve the employer's needs.
- Maintain an enthusiastic, professional, and confident tone.
- Format cleanly with standard professional letter sections.`;

    handleStreamAIAction(prompt, setCoverLetterResult);
  };

  const handleRunInterviewPrep = () => {
    if (!resumeText.trim()) {
      addToast({ type: 'error', title: 'Please upload or paste your resume text first' });
      return;
    }

    const prompt = `You are a Senior Engineering Hiring Manager and Technical Interviewer. Create a personalized Interview Preparation Guide based on this candidate's resume:

=== CANDIDATE RESUME ===
${resumeText.trim()}
========================

Role: ${targetJobTitle || 'Software Engineer'}
${jobDescription.trim() ? `Job Context:\n${jobDescription.trim()}` : ''}

Generate:
1. **Top 5 Technical & Architecture Questions**: Tailored specifically to the projects and tools listed in their resume, including brief model answer frameworks.
2. **Top 3 Behavioral & Leadership Questions**: Structured around the STAR method (Situation, Task, Action, Result) referencing their past roles.
3. **5 Smart Questions the Candidate Should Ask the Interviewer**: Demonstrating strategic competence, curiosity, and technical depth.`;

    handleStreamAIAction(prompt, setInterviewResult);
  };

  const handleRunCurrentAnalysis = () => {
    if (activeTab === 'audit') handleRunAudit();
    if (activeTab === 'job_match') handleRunJobMatch();
    if (activeTab === 'cover_letter') handleRunCoverLetter();
    if (activeTab === 'interview') handleRunInterviewPrep();
  };

  const handleCopy = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({ type: 'success', title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const activeResult =
    activeTab === 'audit'
      ? auditResult
      : activeTab === 'job_match'
      ? jobMatchResult
      : activeTab === 'cover_letter'
      ? coverLetterResult
      : interviewResult;

  const currentTabName =
    activeTab === 'audit'
      ? 'Resume Strength Audit'
      : activeTab === 'job_match'
      ? 'Resume vs. Job Match'
      : activeTab === 'cover_letter'
      ? 'Tailored Cover Letter'
      : 'Interview Prep & Q&A';

  return (
    <div className="career-page-root min-h-screen w-full bg-[#FAF8FB] dark:bg-[#050505] text-[#261827] dark:text-slate-100 flex flex-col p-3 sm:p-6 md:p-8 select-text transition-colors duration-200">
      {/* Workspace Container matching Tasks & Documents */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-5 pb-16">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/chat-ui"
            className="career-nav-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-purple-400/20 text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={13} className="text-purple-400" />
            <span>Back to Chat</span>
          </Link>

          <div className="flex items-center gap-2">
            {!resumeText && (
              <button
                onClick={handleLoadSample}
                className="career-sample-btn px-3 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={12} className="text-purple-400" />
                <span>Load Sample Resume</span>
              </button>
            )}

            {resumeText && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Resume Loaded</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1 pt-1">
          <p className="text-[11px] uppercase tracking-wider text-purple-400 font-medium font-mono">
            Career Intelligence
          </p>
          <h1 className="career-header-title text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase size={26} className="text-purple-500" />
            <span>Resume Analysis & Job Matching</span>
          </h1>
          <p className="career-header-desc text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed pt-0.5">
            Audit your resume strength, compute ATS job match scores, rewrite bullet points with quantified impact, and generate interview prep guides.
          </p>
        </div>

        {/* Studio Inputs: Resume & Target Role */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Candidate Resume Card */}
          <div className="career-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#130c26]/90 border border-purple-400/25 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <h3 className="career-card-title text-sm font-bold text-white">Candidate Resume</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    className="career-upload-btn px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud size={13} />
                    <span>{isExtracting ? 'Reading...' : 'Upload PDF'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,text/plain"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </div>

              {isExtracting ? (
                <div className="career-textarea py-12 text-center rounded-2xl bg-black/40 border border-purple-400/20 text-xs text-purple-300 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-purple-400" />
                  <span>Parsing resume text from document...</span>
                </div>
              ) : (
                <textarea
                  rows={8}
                  placeholder="Upload your resume PDF above or paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="career-textarea w-full px-3.5 py-3 rounded-2xl bg-black/40 border border-purple-400/20 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition resize-none font-mono leading-relaxed"
                />
              )}
            </div>

            <div className="career-border-subtle flex items-center justify-between text-[11px] text-zinc-400 career-text-subtle pt-1 border-t border-purple-400/10">
              <span className="truncate max-w-[200px]">{resumeName}</span>
              <span>{resumeText ? `${resumeText.length} characters` : 'No text loaded'}</span>
            </div>
          </div>

          {/* Target Job Description Card */}
          <div className="career-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#130c26]/90 border border-purple-400/25 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <Target size={16} className="text-purple-400" />
                  <h3 className="career-card-title text-sm font-bold text-white">Target Job</h3>
                </div>

                <input
                  type="text"
                  placeholder="Job Title (e.g. Senior Frontend Engineer)"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  className="career-input px-3 py-1 rounded-xl bg-black/40 border border-purple-400/20 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition flex-1 max-w-[240px]"
                />
              </div>

              <textarea
                rows={8}
                placeholder="Paste the target job description, qualifications, and role requirements here (required for Job Match)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="career-textarea w-full px-3.5 py-3 rounded-2xl bg-black/40 border border-purple-400/20 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition resize-none font-mono leading-relaxed"
              />
            </div>

            <div className="career-border-subtle flex items-center justify-between text-[11px] text-zinc-400 career-text-subtle pt-1 border-t border-purple-400/10">
              <span>{jobDescription ? `${jobDescription.length} characters` : 'Optional for general audit'}</span>
              <span className="text-purple-400 font-medium">ATS Match Ready</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE RESPONSIVE SECTION (Active strictly on mobile < 640px)
        ========================================================= */}
        <div className="block sm:hidden space-y-0">
          {/* 1. Mobile Section Header */}
          <h2 className="career-card-title text-[17px] font-semibold text-white tracking-tight mb-3.5">
            Resume Analysis
          </h2>

          {/* 2. Analysis Mode Selector (Segmented Control) */}
          <div className="w-full p-1 rounded-xl bg-black/40 border border-purple-400/20 career-input h-[42px] mb-3">
            <div className="grid grid-cols-3 gap-1 w-full h-full">
              {[
                { id: 'audit', label: 'Resume Strength' },
                { id: 'job_match', label: 'Job Match' },
                { id: 'cover_letter', label: 'Tailor' },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CareerTab)}
                    className={`h-full rounded-lg text-xs transition-all flex items-center justify-center px-1 truncate cursor-pointer ${
                      isSelected
                        ? 'career-tab-active bg-purple-600 text-white font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200 font-medium career-text-subtle'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If interview prep was active, show graceful indicator so user is informed */}
          {activeTab === 'interview' && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-400/30 flex items-center justify-between text-xs text-purple-200">
              <span className="truncate font-medium">Mode: Interview Prep & Q&A</span>
              <button
                onClick={() => setActiveTab('job_match')}
                className="text-purple-300 font-semibold underline text-[11px] ml-2 shrink-0 cursor-pointer"
              >
                Switch
              </button>
            </div>
          )}

          {/* 3. Run Analysis Button (Primary Action) */}
          <button
            onClick={handleRunCurrentAnalysis}
            disabled={isAnalyzing}
            className="career-btn-primary w-full h-[46px] rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer active:scale-[0.98] mb-6"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
          </button>

          {/* 4. Section Divider & Analysis Results Header */}
          <div className="border-t border-purple-400/15 career-border-subtle pt-5 mb-3">
            <h3 className="career-card-title text-[15px] font-semibold text-white tracking-tight">
              Analysis Results
            </h3>
          </div>

          {/* 5. Mobile Results Card */}
          <div className="career-card p-4 rounded-2xl bg-[#130c26]/90 border border-purple-400/25 shadow-lg space-y-3.5">
            {/* Card Header: ✓ {currentTabName} */}
            <div className="career-border-subtle flex items-center justify-between pb-3 border-b border-purple-400/15">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <h4 className="career-card-title text-sm font-semibold text-white truncate">
                  {currentTabName}
                </h4>
              </div>

              {activeResult && (
                <button
                  onClick={() => handleCopy(activeResult)}
                  className="career-copy-btn px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Analysis Content & State Displays */}
            <div>
              {isAnalyzing && (
                <div className="career-loading-banner p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center gap-2.5 text-xs text-purple-200">
                  <Loader2 size={15} className="animate-spin text-purple-400 shrink-0" />
                  <span className="leading-snug">AI is analyzing your resume structure & computing match...</span>
                </div>
              )}

              {errorMessage && !isAnalyzing && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                    <span className="truncate">{errorMessage}</span>
                  </div>
                  <button
                    onClick={handleRunCurrentAnalysis}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {activeResult ? (
                <div className="career-markdown-body max-w-none text-xs text-zinc-200 leading-relaxed space-y-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-sm font-bold text-white mt-3 mb-1.5 pb-1 border-b border-purple-400/20">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xs font-bold text-purple-200 mt-3 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-semibold text-purple-300 mt-2 mb-1">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2.5">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-purple-400 pl-2.5 italic text-purple-200 my-2 bg-purple-500/5 py-1 rounded-r">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {activeResult}
                  </ReactMarkdown>
                </div>
              ) : !isAnalyzing ? (
                /* Empty State (Requirement 5 & 6) */
                <div className="career-empty-box py-5 px-2 text-center flex flex-col items-center justify-center">
                  <div className="career-empty-icon w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300 mb-2.5">
                    <FileText size={18} />
                  </div>

                  <h5 className="career-card-title text-sm font-semibold text-white mb-1">
                    Ready for {currentTabName}
                  </h5>

                  <p className="career-text-subtle text-xs text-zinc-400 max-w-[260px] mx-auto leading-relaxed mb-4">
                    {resumeText
                      ? 'Tap "Run Analysis" above to generate your evaluation.'
                      : 'Upload your resume or load a sample to start the analysis.'}
                  </p>

                  {!resumeText && (
                    <button
                      onClick={handleLoadSample}
                      className="career-btn-primary h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-purple-600/25 inline-flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Sparkles size={14} />
                      <span>Load Sample Resume & Test</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* =========================================================
            DESKTOP VIEW: Feature Tabs & Action Button (100% Unchanged)
        ========================================================= */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin w-auto">
            {[
              { id: 'audit', label: 'Resume Strength Audit', icon: <TrendingUp size={13} /> },
              { id: 'job_match', label: 'Resume vs. Job Match', icon: <Target size={13} /> },
              { id: 'cover_letter', label: 'Tailored Cover Letter', icon: <FileEdit size={13} /> },
              { id: 'interview', label: 'Interview Prep & Q&A', icon: <MessageCircleQuestion size={13} /> },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as CareerTab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'career-tab-active bg-purple-600 border-purple-500 text-white shadow-sm'
                      : 'career-tab-inactive bg-purple-950/40 border-purple-400/20 text-purple-200 hover:bg-purple-900/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRunCurrentAnalysis}
            disabled={isAnalyzing}
            className="career-btn-primary w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 cursor-pointer active:scale-95 shrink-0"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
          </button>
        </div>

        {/* =========================================================
            DESKTOP VIEW: Results Card (100% Unchanged)
        ========================================================= */}
        <div className="hidden sm:block career-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#130c26]/90 border border-purple-400/25 shadow-xl space-y-4">
          <div className="career-border-subtle flex items-center justify-between pb-3 border-b border-purple-400/15">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h3 className="career-card-title text-sm font-bold text-white">
                {currentTabName} — Analysis Results
              </h3>
            </div>

            {activeResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeResult)}
                  className="career-copy-btn px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Analysis Content & State Displays */}
          <div className="min-h-[200px]">
            {isAnalyzing && (
              <div className="career-loading-banner mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center gap-2.5 text-xs text-purple-200">
                <Loader2 size={15} className="animate-spin text-purple-400 shrink-0" />
                <span>AI is analyzing your resume structure, computing keyword match, and formatting recommendations...</span>
              </div>
            )}

            {errorMessage && !isAnalyzing && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={handleRunCurrentAnalysis}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {activeResult ? (
              <div className="career-markdown-body max-w-none text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-3.5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-purple-400/20">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-purple-200 mt-4 mb-1.5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mt-3 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-3">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-purple-400 pl-3 italic text-purple-200 my-2 bg-purple-500/5 py-1 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {activeResult}
                </ReactMarkdown>
              </div>
            ) : !isAnalyzing ? (
              <div className="career-empty-box py-12 text-center space-y-3">
                <div className="career-empty-icon w-10 h-10 mx-auto rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h4 className="career-card-title text-sm font-semibold text-white mb-1">
                    Ready for {currentTabName}
                  </h4>
                  <p className="career-text-subtle text-xs text-zinc-400 max-w-md mx-auto">
                    {resumeText
                      ? 'Click "Run Analysis" above to generate structured evaluation and recommendations.'
                      : 'Upload your resume PDF, paste your resume text, or load a sample resume to start.'}
                  </p>
                </div>

                {!resumeText && (
                  <button
                    onClick={handleLoadSample}
                    className="career-btn-primary px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={13} />
                    <span>Load Sample Resume & Test</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
