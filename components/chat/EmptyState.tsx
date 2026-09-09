'use client';

const PROMPTS = [
  'Explain React hooks with examples',
  'Write a Python script to sort a CSV',
  'Prep me for a system design interview',
  'Debug my TypeScript error',
];

export default function EmptyState({
  onSelect,
}: {
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center mt-24 space-y-6 px-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B6FC9] to-[#795BB8] dark:from-purple-600 dark:to-indigo-600 flex items-center justify-center text-2xl text-white shadow-md shadow-[#8B6FC9]/20">
        ✦
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold text-[#292633] dark:text-white">What can I help with?</h1>
        <p className="text-sm text-[#686477] dark:text-zinc-400">
          Ask anything — I'm ready to help
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="text-xs text-left p-3 rounded-xl border border-[#E8E4EF] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-transparent hover:bg-[#F5F3F9] dark:hover:bg-zinc-800 text-[#292633] dark:text-white shadow-sm transition"
          >
            {p} ↗
          </button>
        ))}
      </div>
    </div>
  );
}