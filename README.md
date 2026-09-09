# Nyra AI — Futuristic Intelligent Workspace

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-SSR%20%2B%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Nyra AI** is a production-grade, full-stack AI workspace application combining multi-model foundation intelligence, real-time web search with source attribution, multi-PDF document analysis, multimodal vision understanding, voice input & speech synthesis, persistent cloud sync with Supabase RLS, and responsive dark glassmorphism.

---

## 🌟 Key Features & Capabilities

### 1. 🧠 Multi-Model AI Foundation Engine
- Dynamic foundation switching across **Groq**, **OpenAI (GPT-4o, GPT-4o Mini)**, **Anthropic (Claude 3.5 Sonnet)**, **Google Gemini (Gemini 2.0 Flash)**, and **OpenRouter (DeepSeek R1, DeepSeek V3)**.
- Ultra-low latency streaming with non-destructive `<think>...</think>` deep reasoning filters.
- AI response controls: **Isolated Retry**, **Continue Generation**, and **Instant AbortController Stopping**.
- Real-time dynamic **Suggested Follow-up Questions**.

### 2. 🌐 Real-Time Web Search & Citation Attribution
- Live web ground-truth retrieval powered by the Tavily Search API.
- Cites referenced web sources with domain badges and numbered snippet attribution cards.

### 3. 📄 Advanced Multi-PDF Document Intelligence
- Client-side text parsing for up to 5 simultaneous PDF documents per message (20MB limit).
- Structured prompt formatting for comparative analysis, data extraction, and page-specific citations.
- Full upload lifecycle with status tracking (`Processing`, `Ready`, `Failed`) and one-click retry.

### 4. 👁️ Multimodal Image Vision Understanding
- Multi-image attachments (up to 4 images per message) with drag-and-drop and clipboard paste (`Ctrl+V` / `Cmd+V`).
- Automatic vision capability verification that warns if a text-only model is selected.
- Image previews with hover zoom overlays and a full-screen enlarged lightbox view.

### 5. 🎙️ Complete Voice & Speech System
- **Speech-to-Text (STT)**: Browser Speech Recognition capturing live interim transcripts into the composer without auto-submitting.
- **Read Aloud (TTS)**: Clean SpeechSynthesis that strips markdown formatting, raw URLs, and code blocks before speaking.
- Dynamic device voice enumeration with 0.75x–2x playback speed customization.
- Strict one-speech-at-a-time enforcement and immediate cancellation on navigation or unmount.

### 6. 🔒 Authentication & Cloud Chat Sync (Supabase)
- SSR Authentication via `@supabase/ssr` with transparent session refreshing across page reloads.
- 100% Row Level Security (RLS) policies protecting `profiles`, `conversations`, `messages`, `prompts`, and `usage_records`.
- Optimistic non-blocking streaming with batch persistence on stream completion.
- Seamless local-to-cloud migration of guest conversations upon user sign-in.
- Atomic PostgreSQL `FOR UPDATE` RPC daily usage limits across AI requests, Web Searches, Vision, and PDFs.

### 7. 🛠️ Workspace & Productivity Tools
- **Prompt Library**: Categorized templates with real-time search, custom prompt creation, and recent prompt tracking.
- **Chat Management**: One-click message favoriting/bookmarking, in-conversation search with smooth scrolling, and non-destructive conversation branching.
- **Export & Share**: Conversation export to PDF, Markdown (`.md`), and Plain Text (`.txt`), plus a dedicated read-only SSR share viewer (`/share/[id]`).
- **Personalized Settings**: Dark/Light/System theme modes, 6-color accent palette, font size scaling, default model selection, and complete JSON workspace data export.

---

## 🏗️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│   Next.js 16 + React 19 + Tailwind CSS + Framer Motion      │
│  (ChatInput, ImagePreview, FilePreview, Speech STT/TTS)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               │ Fetch / Streaming             │ Auth & Cloud Sync
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      Next.js App Router      │ │      Supabase Cloud         │
│  /api/chat    /api/usage     │ │  PostgreSQL + RLS Policies  │
│  /api/suggestions            │ │  (Profiles, Conversations,  │
│  (Usage Limits + Env Checks) │ │   Messages, Daily Usage)    │
└──────────────┬───────────────┘ └─────────────────────────────┘
               │
               ├────────────────────────┬─────────────────────┐
               ▼                        ▼                     ▼
      ┌──────────────────┐    ┌──────────────────┐   ┌──────────────────┐
      │  AI Providers    │    │ Tavily Web API   │   │ Cloudinary CDN   │
      │  Groq / OpenAI   │    │ (Live Web Search │   │ (Media Storage)  │
      │  Claude / Gemini │    │  & Citations)    │   │                  │
      │  OpenRouter      │    └──────────────────┘   └──────────────────┘
      └──────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Glassmorphism System |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (`@supabase/ssr` + PostgreSQL RLS) |
| **AI Inference** | Groq SDK, OpenAI SDK, Anthropic SDK, Google GenAI SDK, OpenRouter |
| **Search Engine** | [Tavily Search API](https://tavily.com/) |
| **Document Processing**| Client-side PDF Parser (`pdf-parse`) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
ai-chat-ui/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI Streaming & Multimodal Router
│   │   ├── suggestions/route.ts   # Contextual Follow-up Generator
│   │   └── usage/route.ts         # User Usage Metrics API
│   ├── chat-ui/page.tsx           # Main Interactive Workspace
│   ├── share/[id]/page.tsx        # Standalone Read-Only Shared Chat
│   ├── login/                     # Authentication (Sign In)
│   ├── signup/                    # Authentication (Sign Up)
│   ├── layout.tsx                 # Root Layout & SEO / OG Metadata
│   ├── manifest.ts                # PWA Web App Manifest
│   ├── robots.ts                  # SEO Robots.txt Crawler Instructions
│   └── sitemap.ts                 # Dynamic XML Sitemap
├── components/
│   ├── chat/                      # Chat UI (Bubbles, CodeBlock, Input, Attachments)
│   ├── modals/                    # Modals (Settings, Prompts, Export, Favorites)
│   ├── landing/                   # Landing Page Interactive Components
│   └── ui/                        # Reusable UI (Toast, Skeleton, Logo)
├── hooks/
│   ├── useSpeechRecognition.ts    # Browser STT Hook
│   └── useSpeechSynthesis.ts      # Clean TTS Synthesis Hook
├── lib/
│   ├── ai/                        # Multi-Provider AI Engine & Stream Resolvers
│   ├── auth/                      # AuthContext & Session Management
│   ├── supabase/                  # Supabase Client, Server SSR & Schema
│   ├── usage/                     # Daily Usage Tracking & Atomic Limits
│   ├── fileHandling.ts            # PDF & Image Validation & Sanitization
│   ├── formatTimestamp.ts         # Relative UTC Timestamp Calculator
│   └── speechText.ts              # Markdown/Code Syntax Stripper for TTS
├── public/                        # Static Assets & Icons
├── next.config.js                 # Security Response Headers & Image Patterns
└── tailwind.config.ts             # Theme Tokens & Glassmorphic Utilities
```

---

## ⚡ Quick Start & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nyra-ai.git
cd nyra-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your API keys in `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Auth & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers (At least one required)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
OPENROUTER_API_KEY=sk-or-...

# Real-Time Search
TAVILY_API_KEY=tvly-...
```

### 4. Setup Database Schema
Execute the SQL statements located in [lib/supabase/schema.sql](lib/supabase/schema.sql) in your Supabase SQL Editor to provision tables, triggers, and Row Level Security policies.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Production Security & Quality

- **Zero Client Credential Leaks**: All provider API keys and Supabase service keys are strictly isolated to server-side execution.
- **Row Level Security (RLS)**: Enforces database-level isolation ensuring users cannot query or mutate records belonging to other accounts.
- **Security Headers**: Configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Accessibility & Motion**: Fully keyboard accessible with `aria-label` tags, focus rings, and `@media (prefers-reduced-motion: reduce)` support.
- **Type Safety**: Strictly typed with TypeScript (`npx tsc --noEmit` passes with 0 errors).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
