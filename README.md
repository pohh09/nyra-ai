# Nyra AI
A full-stack AI workspace for conversations, research, documents, tasks, memory, and productivity.

## Live Demo
[https://nyra-ai.vercel.app](https://nyra-ai.vercel.app/)

## GitHub Repository
[https://github.com/pohh09/nyra-ai](https://github.com/pohh09/nyra-ai)

## ✨ Features
- **Multi-model AI chat**: Powered by Groq, OpenAI, and Google Gemini.
- **Streaming responses**: Low-latency token streaming.
- **Web search**: Grounded internet research via Tavily Search API.
- **PDF/document analysis**: In-browser client-side PDF parsing and chunking.
- **Image understanding**: Multimodal support with drag-and-drop and clipboard capabilities.
- **Prompt Library**: Save, manage, and discover AI prompts.
- **AI Memory**: Persistent user context and preferences.
- **Tasks**: Project roadmaps, checklists, and AI goal breakdown.
- **Career & Resume tools**: Resume strength audit and cover letter generation.
- **Authentication**: Local storage fallback with seamless migration to Supabase cloud auth.
- **User-specific data isolation**: Complete data separation across sessions.
- **Admin dashboard**: Authorization-based administration features.
- **Responsive UI**: Seamlessly adapts to desktop, tablet, and mobile views.
- **Dark/light theme**: Robust custom styling for viewing preferences.

## 🛠️ Tech Stack

**Frontend**
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

**Backend / Data**
- Next.js API routes
- Supabase
- PostgreSQL (via Supabase)

**AI / Integrations**
- Groq SDK
- OpenAI SDK
- Google GenAI SDK
- Tavily (Web Search)
- PDF.js (Document Parsing)

## 🏗️ Architecture
User interactions in the Next.js UI are sent through the Next.js server/API layer, which routes requests to external AI providers (Groq, OpenAI, Google) or search integrations (Tavily). Responses are streamed directly back to the client interface for low-latency rendering, and conversations/preferences are persisted to Supabase (or local storage for guests).

## 🔐 Authentication & Security
- **Authentication**: Utilizes Supabase for cloud authentication alongside a robust local storage fallback for guest users.
- **Row Level Security**: Enforced via PostgreSQL RLS policies ensuring strict user data isolation.
- **Protected routes/API endpoints**: Server-side verification for admin capabilities and standard usage limits.

## 📁 Project Structure
```text
├── app/                  # Next.js App Router pages and API routes
├── components/           # Reusable UI, layout, and feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, types, API clients, and Supabase config
├── public/               # Static assets, PWA icons, and manifests
├── scripts/              # Utility scripts
├── store/                # State management configurations
└── tests/                # Automated testing files
```

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pohh09/nyra-ai.git
   cd nyra-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your keys to `.env.local` (see variables below).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

| Variable | Purpose | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes (for Cloud Auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key | Yes (for Cloud Auth) |
| `GROQ_API_KEY` | Access Groq's Llama/Qwen models | Yes (Primary AI) |
| `OPENAI_API_KEY` | Access OpenAI models | Optional |
| `GEMINI_API_KEY` | Access Google Gemini models | Optional |
| `TAVILY_API_KEY` | Powers real-time web search | Optional |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Image Hosting | Optional |
| `ADMIN_EMAILS` | Comma-separated admin accounts | Optional |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Alternative auth configuration | Optional |
| `CLERK_SECRET_KEY` | Alternative auth configuration | Optional |

## 📱 Responsive Design
Nyra is fully responsive, supporting seamless layouts across mobile, tablet, and desktop devices via Tailwind CSS breakpoints and custom modular components.

## 🧪 Testing / Validation
- Multimodal functionality tests (`tests/multimodal.test.ts`).
- Standard TypeScript type checking and Next.js linting configured.

## 🚀 Deployment
Deployed seamlessly on Vercel. 
Live Demo: [https://nyra-ai.vercel.app](https://nyra-ai.vercel.app/)

## 🗺️ Roadmap
- Broader integration of custom tool-calling agents.
- Expanded file format support for local analysis.
- Advanced visualization features for AI data outputs.

## 👨‍💻 Author
**Pooja Daki**
GitHub: [https://github.com/pohh09](https://github.com/pohh09)

## 📄 License
No license is currently configured.
