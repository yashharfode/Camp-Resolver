import { NextRequest, NextResponse } from 'next/server';
import { AIAnalysisResult, AISeverity, AIPriority, ComplaintCategory } from '@/types/complaint';

const FALLBACK_MODELS = [
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'dots-studio/dots-3-note-preview:free',
];

/**
 * Deterministic fallback rule-based analyzer ensuring zero downtime
 * if OpenRouter is rate-limited or offline.
 */
function analyzeWithDeterministicRules(data: {
  category: ComplaintCategory;
  title?: string;
  description: string;
  emergencyDetails?: string;
  location?: string;
  isEmergency?: boolean;
}): AIAnalysisResult {
  const fullText = `${data.title || ''} ${data.description} ${data.emergencyDetails || ''} ${data.location || ''}`.toLowerCase();
  const nowStr = new Date().toISOString();

  // 1. Extreme safety / emergency keywords
  const emergencyKeywords = [
    'fire',
    'smoke',
    'spark',
    'electric shock',
    'live wire',
    'burning smell',
    'blast',
    'explosion',
    'ceiling collapse',
    'structural crack',
    'gas leak',
    'chemical spill',
    'flood',
    'flooding',
    'intruder',
    'physical threat',
    'short circuit',
  ];

  const hasEmergencyWord = emergencyKeywords.some((word) => fullText.includes(word));

  if (data.isEmergency || data.category === 'Emergency' || hasEmergencyWord) {
    const matched = emergencyKeywords.filter((w) => fullText.includes(w)).join(', ') || 'immediate safety risk';
    return {
      summary: data.title || (data.description.length > 60 ? data.description.slice(0, 60) + '...' : data.description),
      issueType: fullText.includes('electric') || fullText.includes('spark') || fullText.includes('wire')
        ? 'Electrical Safety Hazard'
        : fullText.includes('fire') || fullText.includes('smoke')
        ? 'Fire / Life Safety Hazard'
        : fullText.includes('flood') || fullText.includes('leak')
        ? 'Severe Flooding / Infrastructure Risk'
        : 'Emergency Safety Incident',
      severity: 'Critical',
      suggestedPriority: data.isEmergency || data.category === 'Emergency' ? 'Emergency' : 'Critical',
      recommendedDepartment: fullText.includes('electric')
        ? 'Electrical Maintenance & Safety'
        : fullText.includes('hostel')
        ? 'Hostel Administration'
        : 'Campus Security & Emergency Response',
      immediateAttention: true,
      reason: `Potential critical safety risk detected (${matched}). Dispatched for urgent inspection.`,
      analyzedAt: nowStr,
    };
  }

  // 2. High severity campus keywords
  const highKeywords = ['no water', 'power outage', 'blackout', 'exam', 'broken pipe', 'sewage', 'lock broken', 'theft'];
  const hasHighWord = highKeywords.some((word) => fullText.includes(word));

  // Category specific routing
  if (data.category === 'Wi-Fi' || fullText.includes('wifi') || fullText.includes('wi-fi') || fullText.includes('internet')) {
    const isWidespread = fullText.includes('entire') || fullText.includes('whole block') || fullText.includes('exam') || fullText.includes('lab');
    return {
      summary: data.title || 'Wi-Fi connection outage or frequent disconnection',
      issueType: isWidespread ? 'Wide-Area Network Disruption' : 'Network Connectivity Issue',
      severity: isWidespread ? 'High' : 'Medium',
      suggestedPriority: isWidespread ? 'High' : 'Medium',
      recommendedDepartment: 'IT Department & NOC',
      immediateAttention: isWidespread,
      reason: isWidespread
        ? 'High student density area experiencing network interruption.'
        : 'Wireless connectivity disruption affecting academic work.',
      analyzedAt: nowStr,
    };
  }

  if (data.category === 'Laboratory' || fullText.includes('lab') || fullText.includes('experiment')) {
    return {
      summary: data.title || 'Laboratory equipment or workstation issue',
      issueType: 'Laboratory Equipment & Facilities',
      severity: hasHighWord ? 'High' : 'Medium',
      suggestedPriority: hasHighWord ? 'High' : 'Medium',
      recommendedDepartment: 'Laboratory Maintenance & Safety',
      immediateAttention: hasHighWord,
      reason: 'Specialized lab facility issue affecting academic practical sessions.',
      analyzedAt: nowStr,
    };
  }

  if (data.category === 'Hostel' || fullText.includes('hostel') || fullText.includes('room') || fullText.includes('mess')) {
    const isWater = fullText.includes('water') || fullText.includes('tap') || fullText.includes('tank');
    return {
      summary: data.title || (isWater ? 'Hostel water supply disruption' : 'Hostel accommodation maintenance'),
      issueType: isWater ? 'Plumbing & Water Supply' : 'Hostel Facilities Maintenance',
      severity: isWater || hasHighWord ? 'High' : 'Medium',
      suggestedPriority: isWater || hasHighWord ? 'High' : 'Medium',
      recommendedDepartment: 'Hostel Administration',
      immediateAttention: isWater,
      reason: isWater
        ? 'Essential living amenity disrupted for hostel residents.'
        : 'Residential facility maintenance issue.',
      analyzedAt: nowStr,
    };
  }

  if (data.category === 'Classroom' || fullText.includes('projector') || fullText.includes('audio') || fullText.includes('lecture')) {
    return {
      summary: data.title || 'Classroom AV equipment or lecture hall maintenance',
      issueType: 'Academic Audio-Visual Facilities',
      severity: hasHighWord ? 'High' : 'Low',
      suggestedPriority: hasHighWord ? 'High' : 'Medium',
      recommendedDepartment: 'Academic & AV Support',
      immediateAttention: false,
      reason: 'Instructional infrastructure requiring maintenance technician check.',
      analyzedAt: nowStr,
    };
  }

  // Default 'Other'
  return {
    summary: data.title || data.description.slice(0, 60),
    issueType: 'General Campus Facility Issue',
    severity: hasHighWord ? 'High' : 'Low',
    suggestedPriority: hasHighWord ? 'High' : 'Low',
    recommendedDepartment: 'Estate & General Maintenance',
    immediateAttention: false,
    reason: 'Standard campus grievance ticket.',
    analyzedAt: nowStr,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, category, title, description, emergencyDetails, location, isEmergency } = body;

    if (!description && !title) {
      return NextResponse.json(
        { error: 'Description or title is required for complaint analysis.' },
        { status: 400 }
      );
    }

    const deterministic = analyzeWithDeterministicRules({
      category: category || 'Other',
      title,
      description: description || '',
      emergencyDetails,
      location,
      isEmergency,
    });

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    // If no API key configured, instantly return deterministic analysis
    if (!apiKey) {
      return NextResponse.json(deterministic);
    }

    const promptText = `You are the AI Complaint Intelligence Engine for Camp Resolver campus grievance system.
Analyze the following student complaint and return a strictly valid JSON response.

Complaint Details:
- ID: ${id || 'NEW'}
- Category: ${category || 'Other'}
- Title: ${title || 'N/A'}
- Description: ${description}
- Emergency Details: ${emergencyDetails || 'None'}
- Location: ${location || 'Campus Facilities'}
- Student Flagged Emergency: ${isEmergency ? 'YES' : 'NO'}

Your JSON response MUST strictly follow this exact structure without markdown code blocks:
{
  "summary": "Concise 1-sentence summary of the actual problem",
  "issueType": "Specific category/issue type (e.g., Electrical Safety Hazard, Network Connectivity, Plumbing & Sanitation, AV Hardware, Structural Damage)",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "suggestedPriority": "Emergency" | "Critical" | "High" | "Medium" | "Low",
  "recommendedDepartment": "Exact campus department (e.g., IT Department, Electrical Maintenance, Hostel Administration, Laboratory Safety, Academic AV Support, Campus Security)",
  "immediateAttention": true | false,
  "reason": "Clear justification for the assigned severity and priority"
}

Rules:
1. If the student reported fire, sparks, exposed wiring, smoke, structural collapse risk, chemical hazard or violence, severity MUST be "Critical", suggestedPriority MUST be "Emergency" or "Critical", and immediateAttention MUST be true.
2. Conservative emergency detection: Do not hallucinate safety hazards if it's a routine issue like slow Wi-Fi or squeaky chair.
3. Be transparent and accurate. Output ONLY valid JSON.`;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/yashharfode/Camp-Resolver',
            'X-Title': 'Camp Resolver AI Intelligence',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: promptText }],
            max_tokens: 450,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || '';

        // Clean any markdown formatting if present
        if (content.startsWith('```json')) {
          content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
        }

        const parsed = JSON.parse(content);

        // Validate essential fields
        if (parsed.summary && parsed.severity && parsed.recommendedDepartment) {
          const validSeverities: AISeverity[] = ['Low', 'Medium', 'High', 'Critical'];
          const validPriorities: AIPriority[] = ['Emergency', 'Critical', 'High', 'Medium', 'Low'];

          const severity: AISeverity = validSeverities.includes(parsed.severity)
            ? parsed.severity
            : deterministic.severity;

          const suggestedPriority: AIPriority = validPriorities.includes(parsed.suggestedPriority)
            ? parsed.suggestedPriority
            : deterministic.suggestedPriority;

          const result: AIAnalysisResult = {
            summary: String(parsed.summary).slice(0, 150),
            issueType: String(parsed.issueType || deterministic.issueType).slice(0, 60),
            severity,
            suggestedPriority,
            recommendedDepartment: String(parsed.recommendedDepartment).slice(0, 60),
            immediateAttention: Boolean(parsed.immediateAttention),
            reason: String(parsed.reason || deterministic.reason).slice(0, 250),
            analyzedAt: new Date().toISOString(),
          };

          return NextResponse.json(result);
        }
      } catch (e) {
        // Try next fallback model
        continue;
      }
    }

    // If all models failed or returned non-JSON, return deterministic analysis
    return NextResponse.json(deterministic);
  } catch (error) {
    console.error('Error in analyze-complaint route:', error);
    return NextResponse.json(
      { error: 'Failed to process complaint analysis.' },
      { status: 500 }
    );
  }
}

