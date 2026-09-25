import './global.css';

import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth/AuthContext';
import Providers from './providers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8FB' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: {
    default: 'Nyra AI — Futuristic Intelligent Workspace',
    template: '%s | Nyra AI',
  },
  description:
    'High-capability AI workspace for deep reasoning, research, multimodal image vision, multi-PDF document analysis, and production-grade code synthesis.',
  keywords: [
    'AI Assistant',
    'Intelligent Workspace',
    'Multi-Model AI',
    'Groq',
    'OpenAI',
    'Claude 3.5 Sonnet',
    'Gemini 2.0',
    'DeepSeek R1',
    'PDF Chat',
    'Web Search',
    'Multimodal Vision',
  ],
  authors: [{ name: 'Nyra AI Team' }],
  creator: 'Nyra AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nyra-ai.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nyra-ai.vercel.app',
    title: 'Nyra AI — Futuristic Intelligent Workspace',
    description:
      'Next-generation AI workspace featuring multi-model reasoning, live web search, multi-PDF document analysis, vision, and voice interface.',
    siteName: 'Nyra AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nyra AI — Futuristic Intelligent Workspace',
    description:
      'Next-generation AI workspace featuring multi-model reasoning, live web search, multi-PDF analysis, and voice.',
    creator: '@nyra_ai',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico', '/logo.png'],
    apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}