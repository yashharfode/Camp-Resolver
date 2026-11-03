import { NextRequest, NextResponse } from 'next/server';


// List of free OpenRouter models with 3-tier fallback redundancy
const FALLBACK_MODELS = [
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'dots-studio/dots-3-note-preview:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
];

const SYSTEM_PROMPT = `You are the Camp Resolver Campus Helpdesk Advisor, helping students and faculty navigate campus complaint resolution.

Key Guidelines:
1. Speak in a warm, natural, professional human tone. Never start with robotic disclaimers like "As an AI language model".
2. Explain the official urgency scoring formula clearly when asked:
   Urgency Score = Category Weight + floor(Age in Hours / 24)
   - Laboratory = 3
   - Wi-Fi = 2
   - Hostel = 2
   - Classroom = 1
   - Other = 1
   Priority Tiers: High Priority (Score >= 4), Medium (Score = 3), Standard (Score <= 2).
3. Tie-Breaking Rules:
   1. Highest urgency score first.
   2. Older complaint first if scores match.
   3. Alphabetical by complaint ID if age also matches.
4. Status Workflow:
   Raised -> In Progress -> Resolved. Resolved issues are removed from the priority queue.
5. Provide practical, helpful advice for campus issues (Wi-Fi disconnections, hostel maintenance, classroom AV equipment, lab workstations).
6. Write concise, well-spaced responses with clean bullet points.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured in environment variables.' },
        { status: 500 }
      );
    }

    const conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10), // keep recent context
    ];

    let lastError: any = null;
    let successfulResponse: { text: string; model: string; fallbackCount: number } | null = null;

    // Iterate through fallback models if primary model fails
    for (let i = 0; i < FALLBACK_MODELS.length; i++) {
      const model = FALLBACK_MODELS[i];

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/yashharfode/Camp-Resolver',
            'X-Title': 'Camp Resolver Campus Complaint Management',
          },
          body: JSON.stringify({
            model,
            messages: conversationHistory,
            max_tokens: 600,
            temperature: 0.7,
            reasoning: { enabled: false }, // Direct answer mode
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.warn(`OpenRouter model ${model} failed (status ${response.status}):`, errBody);
          lastError = `Model ${model} returned HTTP ${response.status}`;
          continue; // Try next backup model
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const content =
          choice?.message?.content?.trim() ||
          choice?.message?.reasoning?.trim() ||
          '';

        if (content) {
          successfulResponse = {
            text: content,
            model,
            fallbackCount: i,
          };
          break; // Succeeded!
        } else {
          console.warn(`Model ${model} returned empty content, trying fallback...`);
          lastError = `Model ${model} returned empty content`;
        }
      } catch (err: any) {
        console.warn(`Exception calling model ${model}:`, err.message);
        lastError = err.message;
      }
    }

    if (successfulResponse) {
      return NextResponse.json(successfulResponse);
    }

    return NextResponse.json(
      {
        error: `All ${FALLBACK_MODELS.length} AI models failed or rate-limited. Last error: ${lastError}`,
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('Chat API unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
