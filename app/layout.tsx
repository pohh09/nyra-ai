import './global.css';

import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth/AuthContext';
import Providers from './providers';
import PwaRegister from '@/components/pwa/PwaRegister';
import AppStartupIntro from '@/components/startup/AppStartupIntro';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8FB' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0112' },
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
  applicationName: 'Nyra AI',
  manifest: '/manifest.webmanifest',
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
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/nyra-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg', '/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nyra AI',
    startupImage: [
      {
        url: '/splash/apple-splash.png',
        media: '(orientation: portrait)',
      },
      {
        url: '/splash/apple-splash-1290x2796.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
    ],
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
      <head>
        <link rel="apple-touch-startup-image" href="/splash/apple-splash.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme') || 'dark';
                var isLight = theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
                if (isLight) {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <Providers>
            <AppStartupIntro />
            <PwaRegister />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}