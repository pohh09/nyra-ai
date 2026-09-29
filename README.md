# Nyra AI

> A production-oriented full-stack AI workspace built with Next.js 16, React 19, TypeScript, Supabase, and multi-provider foundation models.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nyra--ai.vercel.app-E52A83?style=for-the-badge&logo=vercel)](https://nyra-ai.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-pohh09%2Fnyra--ai-181717?style=for-the-badge&logo=github)](https://github.com/pohh09/nyra-ai)

---

## 🔗 Live Demo & Links

- **Live Application**: [https://nyra-ai.vercel.app](https://nyra-ai.vercel.app)
- **Source Code**: [https://github.com/pohh09/nyra-ai](https://github.com/pohh09/nyra-ai)
- **Guest Access**: Instant demo evaluation available via **✦ Continue as Guest** on the login page (no registration required).

---

## 🌟 Features

### 1. Multi-Provider AI Foundation Engine
- **Provider Flexibility**: Real-time routing across **Groq** (Llama 3.3 70B, Qwen 2.5 72B), **OpenAI** (GPT-4o, GPT-4o Mini), **Google Gemini** (Gemini 2.0 Flash), **Anthropic** (Claude 3.5 Sonnet), and **OpenRouter** (DeepSeek R1/V3).
- **Streaming & Reasoning**: Low-latency token streaming with deep reasoning extraction (`<think>...</think>`).
- **Interactive Controls**: AbortController-based instant stream stopping, message editing, branch regeneration, and dynamic follow-up prompts.

### 2. Multimodal Vision & PDF Document Intelligence
- **In-Browser PDF Parsing**: Client-side document parsing and chunking via PDF.js for multi-page documents (up to 5 PDFs, 20MB limit) with zero server-side file retention.
- **Vision Analysis**: Multi-image attachments with drag-and-drop, clipboard paste (`Ctrl+V`), and full-screen image inspection lightbox.
- **Context-Aware Suggestions**: Automatic prompt recommendations tailored to uploaded images or document types.

### 3. Real-Time Web Search Grounding
- **Live Internet Retrieval**: Grounded research synthesis powered by Tavily Search API.
- **Inline Citations**: Domain verification badges, numbered reference chips, and source URLs.

### 4. Specialized Workspace Modules
- **Tasks & Roadmap**: Project roadmaps, daily checklists, status filtering, and AI goal breakdown.
- **Documentation**: Document management with search and responsive reading views.
- **AI Memory**: Persistent user preferences, career goals, and project context with category filters.
- **Career & Resume Studio**: Resume strength audit, ATS keyword matching, tailored cover letters, and interview preparation.
- **Prompt Library**: User-created prompt management, AI prompt generation, search, and category categorization.

### 5. Responsive Mobile UX
- **Mobile-First Layouts**: Standardized mobile dropdowns (`ResponsiveDropdown`) replacing horizontal option scrolling across viewports (`390px`, `430px`, `768px`).
- **Touch-Friendly Controls**: Minimum ~44px tap targets, bottom-anchored actions, and full-width card layouts.

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Glassmorphic System |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) + [GSAP 3](https://greensock.com/gsap/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (`@supabase/ssr` + PostgreSQL RLS) |
| **AI Providers** | Groq SDK, OpenAI SDK, Google GenAI SDK, Anthropic SDK, OpenRouter |
| **Search Engine** | [Tavily Search API](https://tavily.com/) |
| **Document Processing** | Client-side `pdfjs-dist` parser |
| **Deployment** | [Vercel](https://vercel.com/) |

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
│  /api/suggestions /api/tasks │ │  (Profiles, Conversations,  │
│  (Usage Limits + Admin Auth) │ │   Messages, Daily Usage)    │
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

## 🔒 Authentication & Security

- **Row Level Security (RLS)**: PostgreSQL Row Level Security policies enforce strict isolation across `profiles`, `conversations`, `messages`, `prompts`, and `usage_records`.
- **Zero Client Credential Leaks**: All provider API keys (`GROQ_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY`) and service keys reside strictly in server-side environment variables.
- **Server-Side Admin Authorization**: Dedicated admin capabilities (`ADMIN_EMAILS`) are verified server-side via `verifyAdminUser()` with no client-side trust assumptions.
- **Security Headers**: Configured with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

---

## ⚙️ Key Engineering Decisions

1. **Multi-Model Streaming Architecture**: Unified streaming pipeline supporting Server-Sent Events (SSE) and ReadableStream parsing across heterogeneous AI provider APIs.
2. **Client-Side Document Parsing**: Evaluates and vector-chunks PDF documents directly in the client browser using `pdfjs-dist`, ensuring sensitive documents are never stored permanently on backend servers.
3. **Unified Responsive Dropdown Standard**: Built a custom, accessible `ResponsiveDropdown` component with keyboard navigation and theme tokens to eliminate mobile horizontal scrolling anti-patterns.
4. **Resilient Guest Experience**: Implemented a local storage fallback mechanism with automatic migration to Supabase cloud storage when a guest decides to register an account.

---

## ⚡ Local Setup & Development

### 1. Clone the Repository
```bash
git clone https://github.com/pohh09/nyra-ai.git
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

Configure your API keys in `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Auth & Cloud Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Foundation Providers (At least one required)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Real-Time Web Search
TAVILY_API_KEY=tvly-...

# Admin Accounts
ADMIN_EMAILS=your-admin@email.com
```

### 4. Setup Database Schema
Execute the SQL statements in [`lib/supabase/schema.sql`](lib/supabase/schema.sql) in your Supabase SQL Editor to provision tables, triggers, and Row Level Security policies.

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
