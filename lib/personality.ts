/**
 * NYRA PERSONALITY SYSTEM
 * Curated, tasteful microcopy and personality phrases that make Nyra feel alive,
 * creative, warm, and human while maintaining a smart, modern aesthetic.
 */

export const THINKING_PHRASES = [
  'Thinking...',
  'Cooking up an answer...',
  'Connecting the dots...',
  'Let me work that out...',
  'On it...',
  'Putting this together...',
  'Exploring that...',
  'One sec — I’m thinking...',
];

export function getThinkingPhrase(seed?: string | number): string {
  if (seed !== undefined) {
    const num = typeof seed === 'number' ? seed : seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return THINKING_PHRASES[Math.abs(num) % THINKING_PHRASES.length];
  }
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];
}

export const PLAYFUL_GREETINGS = [
  'What’s on your mind?',
  'Let’s make something.',
  'Got an idea?',
  'Give Nyra something interesting.',
  'Ready when you are.',
  'Let’s build.',
  'Hey! What are we working on?',
  'What are we creating today?',
];

export const PLAYFUL_SUBTITLES = [
  'Ask a question, analyze a document, or build a project.',
  'Drop an idea, paste some code, or explore a concept.',
  'Turn thoughts into real progress.',
  'Ready to collaborate whenever you are.',
  'Your creative AI partner is all ears.',
];

export interface PlayfulStarter {
  icon: string;
  title: string;
  desc: string;
  prompt: string;
  isDeepResearch?: boolean;
}

export const PLAYFUL_STARTER_PROMPTS: PlayfulStarter[] = [
  {
    icon: '🚀',
    title: 'Turn an idea into a real project',
    desc: 'Roadmap, architecture & step-by-step plan',
    prompt: 'I have an idea for a project. Help me structure it into a clear architecture, tech stack, and step-by-step roadmap.',
  },
  {
    icon: '💡',
    title: 'Explain something I’m stuck on',
    desc: 'Break down complex logic with intuitive examples',
    prompt: 'I am stuck on a concept. Explain it step-by-step with clear real-world examples and analogies.',
  },
  {
    icon: '✨',
    title: 'Help me brainstorm something weird',
    desc: 'Creative angles, unexpected solutions & ideas',
    prompt: 'Help me brainstorm fresh, unconventional, and creative ideas for: ',
  },
  {
    icon: '💻',
    title: 'Let’s build something',
    desc: 'Modern code, clean components & robust logic',
    prompt: 'Write a clean, production-grade implementation for: ',
  },
  {
    icon: '⚡',
    title: 'Make this better',
    desc: 'Refactor, polish, optimize & level-up',
    prompt: 'Review and improve this, optimizing for clarity, performance, and best practices: ',
  },
  {
    icon: '🔍',
    title: 'Help me figure this out',
    desc: 'Structured deep analysis & problem solving',
    prompt: 'Help me investigate and break down this problem systematically: ',
    isDeepResearch: true,
  },
];

export const SUCCESS_SNIPPETS = [
  'Saved.',
  'Nice — saved.',
  'You’re all set.',
  'Done.',
  'That’s ready.',
];

export function getSuccessSnippet(action?: string): string {
  switch (action) {
    case 'save':
      return 'Nice — saved.';
    case 'complete':
      return 'You’re all set.';
    case 'ready':
      return 'That’s ready.';
    case 'done':
      return 'Done.';
    default:
      return SUCCESS_SNIPPETS[Math.floor(Math.random() * SUCCESS_SNIPPETS.length)];
  }
}

export const RESPONSE_STATUS_PHRASES = {
  thinking: 'Nyra is thinking...',
  typing: 'Nyra is typing...',
  connected: 'Nyra connected the dots',
  ready: 'Nyra is ready',
};

export function formatFriendlyError(errorMsg?: string): { title: string; description: string } {
  const defaultError = 'An unexpected issue occurred. Please try again.';
  const msg = errorMsg || defaultError;

  return {
    title: 'Hmm, Nyra hit a snag.',
    description: msg,
  };
}
