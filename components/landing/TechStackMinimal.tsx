'use client';

import React from 'react';

const TECHNOLOGIES = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Supabase',
  'OpenAI',
  'Google Gemini',
  'Groq',
  'Tavily',
  'Tailwind CSS',
];

export default function TechStackMinimal() {
  return (
    <div className="w-[94%] sm:w-[90%] max-w-4xl mx-auto py-12 sm:py-16 text-center border-t border-white/[0.06] relative z-10">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8E8E98] mb-3">
        Built with modern technology
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-[#C4C4CE]">
        {TECHNOLOGIES.map((tech, idx) => (
          <React.Fragment key={tech}>
            <span className="hover:text-pink-300 transition-colors cursor-default">
              {tech}
            </span>
            {idx < TECHNOLOGIES.length - 1 && (
              <span className="text-white/20 select-none">&bull;</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
