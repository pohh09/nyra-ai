import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

function extractTopicSmartFallbacks(prompt: string, response: string, previousSuggestions: string[] = []): string[] {
  const p = prompt.toLowerCase();
  const r = response.toLowerCase();
  const prevSet = new Set(previousSuggestions.map((s) => s.toLowerCase().trim()));

  const candidates: string[] = [];

  if (p.includes('react') || r.includes('useeffect') || r.includes('usestate') || r.includes('hook') || r.includes('props')) {
    candidates.push(
      'How does useEffect handle cleanup on unmount?',
      'When should I prefer useReducer over useState?',
      'What are common dependency pitfalls in useCallback?',
      'How do I create a custom hook for data fetching?'
    );
  } else if (p.includes('javascript') || p.includes('js') || r.includes('closure') || r.includes('prototype') || r.includes('event loop')) {
    candidates.push(
      'How does the microtask queue interact with the event loop?',
      'Can you explain closures with a practical example?',
      'What is the difference between let, const, and var scoping?',
      'How does async/await work under the hood with Promises?'
    );
  } else if (p.includes('resume') || p.includes('cv') || p.includes('pooja') || r.includes('candidate') || r.includes('ats') || r.includes('education') || r.includes('skills')) {
    candidates.push(
      'What are the strongest technical skills in this profile?',
      'How can this CV be optimized for ATS scanners?',
      'Which projects demonstrate the highest business impact?',
      'Can you rewrite the executive summary to be more punchy?'
    );
  } else if (p.includes('css') || p.includes('tailwind') || r.includes('flex') || r.includes('grid') || r.includes('styling')) {
    candidates.push(
      'How do I make this layout fully responsive across screen sizes?',
      'What are the best practices for organizing Tailwind tokens?',
      'How do CSS Grid and Flexbox differ in real projects?'
    );
  } else if (p.includes('database') || p.includes('mongo') || p.includes('sql') || r.includes('schema') || r.includes('query')) {
    candidates.push(
      'How should I structure indexing for high-traffic queries?',
      'What is the difference between SQL and NoSQL for this use case?',
      'How do I handle transactions and concurrency?'
    );
  } else {
    candidates.push(
      'Can you provide a concrete step-by-step example?',
      'What are the most common pitfalls to avoid here?',
      'What are the key trade-offs and alternative approaches?',
      'How would you apply this in a production environment?'
    );
  }

  const fresh = candidates.filter((c) => !prevSet.has(c.toLowerCase().trim()));
  return (fresh.length >= 3 ? fresh : candidates).slice(0, 3);
}

export async function POST(req: Request) {
  let reqBody: any = {};
  try {
    reqBody = await req.json();
    const prompt = (reqBody?.prompt || '').trim();
    const response = (reqBody?.response || '').trim();
    const recentMessages = Array.isArray(reqBody?.recentMessages) ? reqBody.recentMessages : [];
    const previousSuggestions = Array.isArray(reqBody?.previousSuggestions) ? reqBody.previousSuggestions : [];
    const documentName = (reqBody?.documentName || '').trim();

    if (!prompt && !response) {
      return Response.json({ suggestions: [] });
    }

    if (!groq) {
      return Response.json({
        suggestions: extractTopicSmartFallbacks(prompt, response, previousSuggestions),
      });
    }

    const prevSuggsText = previousSuggestions.length > 0
      ? `Previous suggestions already shown (DO NOT REPEAT ANY OF THESE):\n${previousSuggestions.map((s: string) => `- ${s}`).join('\n')}`
      : 'No previous suggestions.';

    const contextSnippet = recentMessages.length > 0
      ? `Recent Conversation Context:\n${recentMessages.slice(-4).map((m: any) => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`).join('\n')}`
      : '';

    const docContext = documentName ? `Attached Document: ${documentName}` : '';

    const systemPrompt = `You are a helpful assistant generating 2 to 4 ultra-concise, highly relevant follow-up action chips for the user based on the latest interaction.
Requirements:
1. Generate 2 to 4 concise, natural action phrases (e.g. "Explain useEffect", "Show custom hook example", "Improve CV for ATS", "Compare async/await and promises", "Analyze the projects").
2. Keep each suggestion short and punchy (between 2 to 7 words, under 50 characters).
3. Do NOT repeat any previous suggestions or what the user already asked.
4. Deepen the conversation naturally on the exact topic discussed.
5. Return ONLY a JSON object in this exact format:
{
  "suggestions": [
    "action 1",
    "action 2",
    "action 3"
  ]
}`;

    const userPrompt = `${docContext ? docContext + '\n\n' : ''}${contextSnippet ? contextSnippet + '\n\n' : ''}Latest User Message:
"${prompt.slice(0, 500)}"

Latest Assistant Response:
"${response.slice(0, 800)}"

${prevSuggsText}

Generate 2-4 distinct, concise follow-up action chips:`;

    const candidateModels = ['groq/compound-mini', 'openai/gpt-oss-20b', 'groq/compound'];
    let rawContent = '{}';

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 300,
        });
        rawContent = completion.choices[0]?.message?.content || '{}';
        if (rawContent && rawContent.includes('suggestions')) {
          break;
        }
      } catch (err) {
        console.warn(`[SUGGESTIONS] Model ${model} failed, trying next candidate:`, err);
      }
    }

    let suggestions: string[] = [];

    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed?.suggestions)) {
        suggestions = parsed.suggestions
          .filter((s: any) => typeof s === 'string' && s.trim().length > 2)
          .map((s: string) => s.trim().replace(/^["'`]|["'`]$/g, ''));
      }
    } catch {
      const matches = rawContent.match(/"([^"]{3,65})"/g);
      if (matches) {
        suggestions = matches
          .map((m) => m.replace(/"/g, '').trim())
          .filter((m) => !m.toLowerCase().includes('suggestions') && m.length > 3);
      }
    }

    const seen = new Set<string>();
    const prevSet = new Set(previousSuggestions.map((s: string) => s.toLowerCase().trim()));

    const uniqueSuggestions = suggestions.filter((s) => {
      const lower = s.toLowerCase();
      if (seen.has(lower) || prevSet.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    const finalSuggestions = uniqueSuggestions.length >= 2
      ? uniqueSuggestions.slice(0, 4)
      : extractTopicSmartFallbacks(prompt, response, previousSuggestions);

    return Response.json({ suggestions: finalSuggestions });
  } catch (err: any) {
    console.error('Follow-up suggestions error:', err);
    return Response.json({
      suggestions: extractTopicSmartFallbacks(
        reqBody?.prompt || '',
        reqBody?.response || '',
        reqBody?.previousSuggestions || []
      ),
    });
  }
}
