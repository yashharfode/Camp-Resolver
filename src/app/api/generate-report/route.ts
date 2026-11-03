import { NextRequest, NextResponse } from 'next/server';
import { Complaint, CampusReportData } from '@/types/complaint';

const FALLBACK_MODELS = [
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
];

/**
 * Deterministically synthesizes an executive intelligence report from real metrics
 * when offline or when OpenRouter limits are reached.
 */
function synthesizeReportFromMetrics(
  complaints: Complaint[],
  period: string
): CampusReportData {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const pending = complaints.filter((c) => c.status !== 'Resolved').length;
  const emergencies = complaints.filter((c) => c.isEmergency || c.category === 'Emergency');
  const critical = complaints.filter((c) => c.aiSeverity === 'Critical' && !c.isEmergency);

  // Category counts
  const catCounts: Record<string, number> = {};
  for (const c of complaints) {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  }
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0] || ['General Facilities', 0];

  // Department counts
  const deptCounts: Record<string, { total: number; pending: number }> = {};
  for (const c of complaints) {
    const dept = c.aiRecommendedDepartment || `${c.category} Maintenance`;
    if (!deptCounts[dept]) {
      deptCounts[dept] = { total: 0, pending: 0 };
    }
    deptCounts[dept].total++;
    if (c.status !== 'Resolved') {
      deptCounts[dept].pending++;
    }
  }

  const topDept = Object.entries(deptCounts).sort((a, b) => b[1].pending - a[1].pending)[0] || [
    'Campus Facilities Office',
    { total: 0, pending: 0 },
  ];

  // Recurring incidents detection
  const recurring: string[] = [];
  if (catCounts['Wi-Fi'] && catCounts['Wi-Fi'] >= 2) {
    recurring.push(
      `Repeated Wi-Fi disconnections reported across library and academic zones (${catCounts['Wi-Fi']} tickets).`
    );
  }
  if (catCounts['Hostel'] && catCounts['Hostel'] >= 2) {
    recurring.push(
      `Hostel utility irregularities (water/electrical) affecting resident comfort (${catCounts['Hostel']} tickets).`
    );
  }
  if (catCounts['Laboratory'] && catCounts['Laboratory'] >= 1) {
    recurring.push(
      `Laboratory workstation and equipment maintenance issues requiring technical calibration.`
    );
  }
  if (recurring.length === 0) {
    recurring.push('No critical recurrence clusters detected in the selected period.');
  }

  // Safety review
  let safetyReview = 'No active critical safety hazards recorded during this reporting cycle.';
  if (emergencies.length > 0) {
    safetyReview = `URGENT: ${emergencies.length} emergency ticket(s) recorded. Immediate verification and contractor safety follow-up required.`;
  } else if (critical.length > 0) {
    safetyReview = `${critical.length} complaint(s) flagged with Critical AI severity. Priority queue monitoring recommended.`;
  }

  // Recommendations
  const recommendations: string[] = [
    `Direct primary engineering resources to ${topDept[0]} to clear the ${topDept[1].pending} unresolved backlog ticket(s).`,
    `Conduct preventive audit on ${topCat[0]} infrastructure which accounts for the largest proportion of student grievances.`,
    'Ensure all pending emergency and high-priority tickets are verified by designated campus safety marshals within 2 hours.',
    'Maintain daily cross-department resolution status reviews to keep pending age below 24 hours.',
  ];

  const fullReportMarkdown = `# Campus Grievance Intelligence Report
**Reporting Window**: ${period}  
**Generated On**: ${dateStr}  
**System**: Camp Resolver AI Intelligence Engine  

---

### 1. Executive Summary
During **${period}**, a total of **${total} campus complaints** were logged across faculties and residential blocks.  
- **Resolved Tickets**: ${resolved} (${total > 0 ? Math.round((resolved / total) * 100) : 0}% clearance rate)  
- **Active Pending Backlog**: ${pending} complaints currently in progress or raised  
- **Emergency Incidents**: ${emergencies.length} critical safety emergencies  

### 2. Department Hotspots & Bottlenecks
- **Most Impacted Department**: **${topDept[0]}** with **${topDept[1].pending} unresolved tickets** (Total volume: ${topDept[1].total}).
- **Highest Volume Category**: **${topCat[0]}** (${topCat[1]} reported issues).

### 3. Safety & Emergency Assessment
> ${safetyReview}

### 4. Detected Recurring Patterns
${recurring.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 5. Actionable Administrator Directives
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*Report certified by Camp Resolver Executive Governance System.*
`;

  return {
    title: `Campus Grievance Intelligence Report (${period})`,
    generatedAt: now.toISOString(),
    period,
    summary: `Logged ${total} complaints in ${period} (${resolved} resolved, ${pending} pending). Primary driver is ${topCat[0]} with ${topDept[0]} carrying the largest pending queue.`,
    topIssue: `${topCat[0]} (${topCat[1]} reports)`,
    problematicDepartment: `${topDept[0]} (${topDept[1].pending} pending tickets)`,
    recurringIncidents: recurring,
    safetyEmergencyReview: safetyReview,
    recommendations,
    fullReportMarkdown,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { complaints = [], period = 'Last 7 Days' } = await req.json();

    const fallbackReport = synthesizeReportFromMetrics(complaints, period);

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey || complaints.length === 0) {
      return NextResponse.json(fallbackReport);
    }

    // Call OpenRouter with LLM synthesis prompt
    const promptText = `You are the Senior Campus Operations AI Director for Camp Resolver.
Generate an executive intelligence report analyzing real campus grievances for the period "${period}".

Here is the exact dataset of recorded complaints:
${JSON.stringify(
  complaints.map((c: any) => ({
    id: c.id,
    category: c.category,
    title: c.title,
    description: c.description,
    status: c.status,
    location: c.location,
    isEmergency: c.isEmergency,
    aiSeverity: c.aiSeverity,
    aiDepartment: c.aiRecommendedDepartment,
  })),
  null,
  2
)}

Return a strictly valid JSON object matching this schema:
{
  "title": "Campus Grievance Intelligence Report (${period})",
  "summary": "Executive summary paragraph explaining total volume, resolution rate, and primary campus challenges.",
  "topIssue": "Name of highest reported issue and count",
  "problematicDepartment": "Department with highest backlog and reason",
  "recurringIncidents": [
    "Specific recurring pattern 1 with actual location/category mentions",
    "Specific recurring pattern 2"
  ],
  "safetyEmergencyReview": "Detailed safety evaluation of all emergency and critical incidents.",
  "recommendations": [
    "Direct actionable administrative step 1",
    "Direct actionable administrative step 2",
    "Direct actionable administrative step 3"
  ],
  "fullReportMarkdown": "Complete executive report in GitHub-flavored markdown with clean headers, statistics table, safety review, and signed off footer."
}

Rules:
1. ONLY reference numbers and facts from the provided data. Do not fabricate issues not present in the data.
2. Return ONLY valid JSON without markdown wrapping.`;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/yashharfode/Camp-Resolver',
            'X-Title': 'Camp Resolver Intelligence Reports',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: promptText }],
            max_tokens: 1200,
            temperature: 0.4,
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || '';

        if (content.startsWith('```json')) {
          content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
        }

        const parsed = JSON.parse(content);
        if (parsed.summary && parsed.fullReportMarkdown) {
          return NextResponse.json({
            title: parsed.title || fallbackReport.title,
            generatedAt: new Date().toISOString(),
            period,
            summary: parsed.summary,
            topIssue: parsed.topIssue || fallbackReport.topIssue,
            problematicDepartment: parsed.problematicDepartment || fallbackReport.problematicDepartment,
            recurringIncidents: Array.isArray(parsed.recurringIncidents)
              ? parsed.recurringIncidents
              : fallbackReport.recurringIncidents,
            safetyEmergencyReview: parsed.safetyEmergencyReview || fallbackReport.safetyEmergencyReview,
            recommendations: Array.isArray(parsed.recommendations)
              ? parsed.recommendations
              : fallbackReport.recommendations,
            fullReportMarkdown: parsed.fullReportMarkdown,
          });
        }
      } catch (e) {
        continue;
      }
    }

    return NextResponse.json(fallbackReport);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate campus report.' },
      { status: 500 }
    );
  }
}

