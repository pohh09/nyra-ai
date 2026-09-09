'use client';

import { motion } from 'framer-motion';

type Props = {
  onSelect: (prompt: string) => void;
};

const prompts = [

  {
    title: 'Build UI',
    text: 'Create a modern SaaS dashboard in React',
    icon: '✦',
  },

  {
    title: 'Debug Code',
    text: 'Fix my TypeScript state management issue',
    icon: '⚡',
  },

  {
    title: 'Learn Faster',
    text: 'Explain React hooks simply with examples',
    icon: '🧠',
  },

  {
    title: 'Creative Ideas',
    text: 'Give me startup ideas for AI products',
    icon: '🚀',
  },

];

export default function PromptCards({
  onSelect,
}: Props) {

  return (

    <div
      className="
        grid grid-cols-1
        md:grid-cols-2
        gap-3
        mt-10
      "
    >

      {prompts.map((prompt, index) => (

        <motion.button

          key={prompt.title}

          initial={{
            opacity: 0,
            y: 30,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: index * 0.08,
            duration: 0.5,
          }}

          whileHover={{
            scale: 1.02,
            y: -2,
          }}

          whileTap={{
            scale: 0.98,
          }}

          onClick={() =>
            onSelect(prompt.text)
          }

          className="
            group
            relative overflow-hidden
            rounded-2xl
            border border-[#E8E4EF] dark:border-white/10
            bg-[#FFFFFF] dark:bg-white/[0.03]
            hover:bg-[#F5F3F9] dark:hover:bg-white/[0.06]
            shadow-sm dark:shadow-none
            transition-all duration-300
            p-5 text-left
            backdrop-blur-xl
          "
        >

          {/* GLOW */}
          <div
            className="
              absolute inset-0
              opacity-0
              group-hover:opacity-100
              transition duration-500
              bg-gradient-to-br
              from-[#8B6FC9]/10
              to-[#7E9AC7]/10
              dark:from-sky-500/15
              dark:to-blue-600/15
            "
          />

          <div className="relative z-10">

            {/* ICON */}
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-gradient-to-br
                from-[#8B6FC9]
                to-[#795BB8]
                dark:from-sky-500
                dark:to-blue-600
                flex items-center justify-center
                text-lg mb-4
                shadow-md shadow-[#8B6FC9]/25 text-white
              "
            >
              {prompt.icon}
            </div>

            {/* TITLE */}
            <h3
              className="
                font-semibold
                text-[#292633] dark:text-white
                mb-2
              "
            >
              {prompt.title}
            </h3>

            {/* TEXT */}
            <p
              className="
                text-sm
                text-[#686477] dark:text-zinc-400
                leading-relaxed
              "
            >
              {prompt.text}
            </p>

          </div>

        </motion.button>

      ))}

    </div>
  );
}