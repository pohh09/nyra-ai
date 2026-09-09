import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nyra AI — Intelligent Workspace',
    short_name: 'Nyra AI',
    description: 'Next-Generation Intelligent AI Workspace with Multi-Model Reasoning, Live Web Search, Multi-PDF Analysis, and Multimodal Vision.',
    start_url: '/chat-ui',
    display: 'standalone',
    background_color: '#040a17',
    theme_color: '#040a17',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
