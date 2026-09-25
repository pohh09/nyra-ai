import { NextResponse } from 'next/server';

interface PlanDayItem {
  day: number;
  topic: string;
  description: string;
  learningFocus: string;
  tasks: {
    title: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  chatQuery: string;
}

interface PlanResponse {
  goalTitle: string;
  totalDays: number;
  overview: string;
  roadmap: PlanDayItem[];
}

function extractDurationInDays(text: string): number {
  const clean = text.toLowerCase();

  // Matches "7 days", "14-day", "30 day", "1 day"
  const dayMatch = clean.match(/(\d+)\s*(?:-| )*(?:day|days)/);
  if (dayMatch && dayMatch[1]) {
    const days = parseInt(dayMatch[1], 10);
    if (!isNaN(days) && days > 0) return Math.min(Math.max(days, 1), 30);
  }

  // Matches "2 weeks", "1 week"
  const weekMatch = clean.match(/(\d+)\s*(?:-| )*(?:week|weeks)/);
  if (weekMatch && weekMatch[1]) {
    const weeks = parseInt(weekMatch[1], 10);
    if (!isNaN(weeks) && weeks > 0) return Math.min(Math.max(weeks * 7, 1), 30);
  }

  // Matches "1 month"
  const monthMatch = clean.match(/(\d+)\s*(?:-| )*(?:month|months)/);
  if (monthMatch && monthMatch[1]) {
    const months = parseInt(monthMatch[1], 10);
    if (!isNaN(months) && months > 0) return Math.min(Math.max(months * 30, 1), 30);
  }

  // Default to 7 days if unspecified
  return 7;
}

function cleanJsonText(raw: string): string {
  let text = raw.trim();
  // Remove markdown json fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  return text;
}

// Fallback dynamic generator if AI provider is unreachable
function generateFallbackPlan(goal: string, days: number): PlanResponse {
  const goalClean = goal
    .replace(/(?:in\s+)?\d+\s*(?:days?|weeks?|months?)/i, '')
    .replace(/^(learn|master|build|study|prepare for)\s+/i, '')
    .trim() || 'Core Skills';

  const titleCasedGoal = goalClean.charAt(0).toUpperCase() + goalClean.slice(1);

  const progressiveSteps = [
    {
      topic: `Foundations & Core Principles of ${titleCasedGoal}`,
      description: `Understand what ${titleCasedGoal} is, why it matters, and set up your initial development environment.`,
      learningFocus: `Key terminology, architecture overview, and first hands-on commands.`,
      tasks: [
        { title: `Read introductory overview and mental model of ${titleCasedGoal}`, priority: 'high' as const },
        { title: `Install required tools, CLI, or starter template`, priority: 'medium' as const },
        { title: `Run a basic 'Hello World' example and verify setup`, priority: 'high' as const },
      ],
      chatQuery: `Explain ${titleCasedGoal} basics to a beginner with clear analogies and step-by-step setup instructions.`,
    },
    {
      topic: `Core Building Blocks & Configuration`,
      description: `Explore the fundamental syntax, configuration files, and core abstractions.`,
      learningFocus: `Configuration patterns, essential options, and understanding common pitfalls.`,
      tasks: [
        { title: `Experiment with primary configuration parameters`, priority: 'medium' as const },
        { title: `Build a small interactive test module or component`, priority: 'high' as const },
        { title: `Inspect terminal output and debug common beginner errors`, priority: 'low' as const },
      ],
      chatQuery: `What are the most essential concepts and syntax rules to understand in ${titleCasedGoal}?`,
    },
    {
      topic: `Practical Workflows & Hands-on Application`,
      description: `Put concepts into practice by constructing a realistic small project or workflow.`,
      learningFocus: `How pieces connect together in a realistic workflow.`,
      tasks: [
        { title: `Implement core logic for a mini-project`, priority: 'high' as const },
        { title: `Connect inputs, outputs, and storage / state`, priority: 'medium' as const },
        { title: `Review best practices for structure and organization`, priority: 'medium' as const },
      ],
      chatQuery: `Guide me through building a beginner-friendly mini-project using ${titleCasedGoal} step by step.`,
    },
    {
      topic: `Debugging, Error Handling & Inspection`,
      description: `Learn how to diagnose issues, read logs, and inspect runtime behavior efficiently.`,
      learningFocus: `Debugging tools, inspection commands, and resolving common errors.`,
      tasks: [
        { title: `Learn top 5 troubleshooting techniques for ${titleCasedGoal}`, priority: 'high' as const },
        { title: `Test failure cases and practice fixing errors`, priority: 'medium' as const },
      ],
      chatQuery: `What are the most common mistakes beginners make in ${titleCasedGoal} and how do you debug them?`,
    },
    {
      topic: `Advanced Features & Optimization`,
      description: `Level up with performance optimizations, security tips, and intermediate patterns.`,
      learningFocus: `Efficiency, modularity, and production-grade techniques.`,
      tasks: [
        { title: `Explore intermediate features and shortcuts`, priority: 'medium' as const },
        { title: `Refactor code or configuration for clarity and speed`, priority: 'medium' as const },
      ],
      chatQuery: `What are the best practices and optimization tips for ${titleCasedGoal}?`,
    },
    {
      topic: `Testing & Integration`,
      description: `Ensure stability by learning testing patterns, CI/CD, or multi-service integration.`,
      learningFocus: `Automated checks, test workflows, and integration methods.`,
      tasks: [
        { title: `Write or run basic test suites / validation checks`, priority: 'high' as const },
        { title: `Verify end-to-end flow from start to finish`, priority: 'medium' as const },
      ],
      chatQuery: `How do you properly test and validate projects built with ${titleCasedGoal}?`,
    },
    {
      topic: `Capstone Project & Real-World Review`,
      description: `Solidify your knowledge by completing a comprehensive project and reviewing everything learned.`,
      learningFocus: `Full end-to-end mastery and practical confidence.`,
      tasks: [
        { title: `Complete capstone mini-project showcasing your skills`, priority: 'high' as const },
        { title: `Review all notes and test your knowledge with NYRA quiz`, priority: 'medium' as const },
        { title: `Document your project and outline next learning steps`, priority: 'low' as const },
      ],
      chatQuery: `Quiz me on ${titleCasedGoal} with 5 practical scenario questions and give feedback on my answers.`,
    },
  ];

  const roadmap: PlanDayItem[] = [];
  for (let i = 0; i < days; i++) {
    const template = progressiveSteps[i % progressiveSteps.length];
    const dayNum = i + 1;
    roadmap.push({
      day: dayNum,
      topic: days > 7 ? `Day ${dayNum}: ${template.topic}` : template.topic,
      description: template.description,
      learningFocus: template.learningFocus,
      tasks: template.tasks.map((t) => ({ ...t })),
      chatQuery: template.chatQuery,
    });
  }

  return {
    goalTitle: `${titleCasedGoal} (${days}-Day Learning Roadmap)`,
    totalDays: days,
    overview: `A structured ${days}-day roadmap designed to guide you step-by-step from foundations to practical mastery.`,
    roadmap,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawGoal = body?.goal?.trim();

    if (!rawGoal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const requestedDays = body.days ? Number(body.days) : extractDurationInDays(rawGoal);
    const totalDays = Math.min(Math.max(requestedDays || 7, 1), 30);

    const prompt = `You are an expert curriculum designer and AI mentor.
The user wants a structured, day-by-day learning roadmap for: "${rawGoal}".
Duration: exactly ${totalDays} days.

Create a clear, progressive day-by-day learning roadmap tailored for a learner.
Each day must be achievable and not overwhelming.

Requirements for each day:
1. "day": integer (1 to ${totalDays})
2. "topic": concise, engaging main milestone/topic title (e.g. "Docker Architecture & First Container")
3. "description": 1-2 beginner-friendly sentences explaining what the user will do and focus on today
4. "learningFocus": concise summary of what the user will understand (e.g. "Containers vs VMs, basic Docker CLI commands, and image layers")
5. "tasks": 2 to 4 specific, actionable tasks for this day. Each task has:
   - "title": clear action item (e.g. "Install Docker Desktop and verify with docker --version")
   - "priority": "high", "medium", or "low"
6. "chatQuery": a targeted prompt the user can click to "Learn more in Chat" with NYRA (e.g. "Explain Docker containers vs VMs with simple real-world examples and guide me through my first run command")

Output MUST be strictly valid JSON matching this exact schema:
{
  "goalTitle": "string (e.g. Docker Learning Roadmap)",
  "totalDays": ${totalDays},
  "overview": "string (1 sentence summary of the learning journey)",
  "roadmap": [
    {
      "day": 1,
      "topic": "string",
      "description": "string",
      "learningFocus": "string",
      "tasks": [
        { "title": "string", "priority": "high" }
      ],
      "chatQuery": "string"
    }
  ]
}

Return ONLY the raw JSON object. Do not include markdown code block backticks (\`\`\`json), explanations, or surrounding text.`;

    let generatedPlan: PlanResponse | null = null;

    // Try Gemini API first if configured
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey && !generatedPlan) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleaned = cleanJsonText(candidateText);
            const parsed = JSON.parse(cleaned);
            if (parsed?.roadmap && Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0) {
              generatedPlan = parsed;
            }
          }
        }
      } catch (err) {
        console.warn('Gemini roadmap generation error:', err);
      }
    }

    // Try OpenAI API if Gemini failed or unconfigured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !generatedPlan) {
      try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert learning roadmap generator that outputs strictly valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          }),
        });

        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const cleaned = cleanJsonText(content);
            const parsed = JSON.parse(cleaned);
            if (parsed?.roadmap && Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0) {
              generatedPlan = parsed;
            }
          }
        }
      } catch (err) {
        console.warn('OpenAI roadmap generation error:', err);
      }
    }

    // Try Groq API if still not generated
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && !generatedPlan) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              { role: 'system', content: 'You are an expert curriculum designer that outputs strictly valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const cleaned = cleanJsonText(content);
            const parsed = JSON.parse(cleaned);
            if (parsed?.roadmap && Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0) {
              generatedPlan = parsed;
            }
          }
        }
      } catch (err) {
        console.warn('Groq roadmap generation error:', err);
      }
    }

    // Fallback if AI providers failed
    if (!generatedPlan) {
      generatedPlan = generateFallbackPlan(rawGoal, totalDays);
    }

    // Ensure valid structure & sanitize
    const sanitizedPlan: PlanResponse = {
      goalTitle: generatedPlan.goalTitle || `${rawGoal} (${totalDays} Days)`,
      totalDays: generatedPlan.totalDays || generatedPlan.roadmap.length,
      overview: generatedPlan.overview || `Step-by-step roadmap to achieve your goal in ${totalDays} days.`,
      roadmap: generatedPlan.roadmap.map((dayItem: any, idx: number) => ({
        day: Number(dayItem.day) || idx + 1,
        topic: dayItem.topic || `Day ${idx + 1}`,
        description: dayItem.description || `Milestone focus for Day ${idx + 1}`,
        learningFocus: dayItem.learningFocus || `Understand core concepts and techniques for this day.`,
        tasks: Array.isArray(dayItem.tasks)
          ? dayItem.tasks.map((t: any) => ({
              title: typeof t === 'string' ? t : (t.title || 'Complete daily action item'),
              priority: t.priority === 'high' || t.priority === 'low' ? t.priority : 'medium',
            }))
          : [{ title: `Complete milestone for Day ${idx + 1}`, priority: 'medium' }],
        chatQuery:
          dayItem.chatQuery ||
          `Explain ${dayItem.topic || rawGoal} with beginner examples, key takeaways, and practical exercises.`,
      })),
    };

    return NextResponse.json({ success: true, plan: sanitizedPlan });
  } catch (err: any) {
    console.error('Plan generation route failure:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate roadmap' }, { status: 500 });
  }
}
