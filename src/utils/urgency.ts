import {
  AIPriority,
  Complaint,
  ComplaintCategory,
  EvaluatedComplaint,
  SummaryStats,
  UrgencyTier,
} from '@/types/complaint';
import { CATEGORY_WEIGHTS } from './constants';

export const PRIORITY_RANK: Record<AIPriority, number> = {
  Emergency: 0,
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
};

/**
 * Calculates the age of a complaint in whole hours from its submittedAt timestamp.
 */
export function getAgeInHours(
  submittedAt: string,
  currentTimestamp: number = Date.now()
): number {
  const submittedTime = new Date(submittedAt).getTime();
  if (isNaN(submittedTime)) {
    return 0;
  }
  const diffMs = currentTimestamp - submittedTime;
  if (diffMs <= 0) {
    return 0;
  }
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Formats complaint age in a human-readable format.
 * e.g., "48 hours ago", "1 hour ago", "Just now"
 */
export function formatAge(hours: number): string {
  if (hours <= 0) {
    return 'Just now';
  }
  if (hours === 1) {
    return '1 hour ago';
  }
  return `${hours} hours ago`;
}

/**
 * Calculates urgency score using the official formula:
 * Urgency Score = Category Weight + floor(Age in Hours / 24)
 * Laboratory = 3, Wi-Fi = 2, Hostel = 2, Classroom = 1, Other = 1, Emergency = 4
 */
export function calculateUrgencyScore(
  category: ComplaintCategory,
  ageInHours: number
): number {
  const categoryWeight = CATEGORY_WEIGHTS[category] ?? 1;
  const ageFactor = Math.floor(Math.max(0, ageInHours) / 24);
  return categoryWeight + ageFactor;
}

/**
 * Determines urgency classification tier based on mathematical score.
 * Urgency Score >= 4 is classified as High Priority.
 * Urgency Score === 3 is Medium Priority.
 * Urgency Score <= 2 is Low Priority.
 */
export function getUrgencyTier(score: number): UrgencyTier {
  if (score >= 4) return 'High';
  if (score === 3) return 'Medium';
  return 'Low';
}

/**
 * Helper to count similar unresolved complaints across campus
 * considering matching category or overlapping location keywords.
 */
export function countSimilarComplaints(
  target: Complaint,
  allComplaints: Complaint[] = []
): number {
  if (!allComplaints || allComplaints.length === 0) return 0;

  const targetLoc = (target.location || '').trim().toLowerCase();
  const targetDesc = (target.description || '').toLowerCase();

  return allComplaints.filter((c) => {
    if (c.id === target.id) return false;
    if (c.status === 'Resolved') return false;

    // Same category match
    if (c.category === target.category) {
      // If location matches or description shares significant words
      const cLoc = (c.location || '').trim().toLowerCase();
      if (targetLoc && cLoc && (targetLoc.includes(cLoc) || cLoc.includes(targetLoc))) {
        return true;
      }
      return true;
    }

    return false;
  }).length;
}

/**
 * Determines the effective priority level and human-readable explanation
 * by synthesizing administrator overrides, AI analysis, emergency flags,
 * mathematical urgency scores, and cluster patterns of similar complaints.
 */
export function getEffectivePriority(
  complaint: Complaint,
  allComplaints: Complaint[] = [],
  currentTimestamp: number = Date.now()
): {
  effectivePriority: AIPriority;
  priorityExplanation: string;
  similarComplaintCount: number;
} {
  const ageInHours = getAgeInHours(complaint.submittedAt, currentTimestamp);
  const mathScore = calculateUrgencyScore(complaint.category, ageInHours);
  const similarCount = countSimilarComplaints(complaint, allComplaints);

  // 1. Admin manual override takes precedence
  if (complaint.priorityOverride) {
    return {
      effectivePriority: complaint.priorityOverride,
      priorityExplanation: `Priority overridden by administrator to ${complaint.priorityOverride}`,
      similarComplaintCount: similarCount,
    };
  }

  // 2. Explicit Emergency flag or category
  if (complaint.isEmergency || complaint.category === 'Emergency') {
    return {
      effectivePriority: 'Emergency',
      priorityExplanation:
        complaint.emergencyDetails
          ? `Emergency safety hazard: ${complaint.emergencyDetails}`
          : 'Campus emergency flagged for immediate response',
      similarComplaintCount: similarCount,
    };
  }

  // 3. AI Analysis with similar complaint cluster escalation
  if (complaint.aiSuggestedPriority) {
    let finalPriority = complaint.aiSuggestedPriority;
    let explanation =
      complaint.aiReason ||
      `AI evaluated as ${complaint.aiSeverity || 'standard'} severity (${complaint.aiIssueType || complaint.category})`;

    // If multiple students report similar issues, escalate priority
    if (similarCount >= 2) {
      if (finalPriority === 'Low') finalPriority = 'Medium';
      else if (finalPriority === 'Medium') finalPriority = 'High';
      else if (finalPriority === 'High') finalPriority = 'Critical';

      explanation = `Priority escalated: ${similarCount + 1} students reported similar ${complaint.category.toLowerCase()} issues`;
    }

    return {
      effectivePriority: finalPriority,
      priorityExplanation: explanation,
      similarComplaintCount: similarCount,
    };
  }

  // 4. Heuristic / Mathematical fallback
  let fallbackPriority: AIPriority = 'Low';
  let fallbackExplanation = `Calculated from base weight (${CATEGORY_WEIGHTS[complaint.category] ?? 1}) + age factor`;

  if (complaint.aiSeverity === 'Critical') {
    fallbackPriority = 'Critical';
    fallbackExplanation = 'AI flagged critical severity: immediate danger or disruption';
  } else if (complaint.aiSeverity === 'High' || mathScore >= 4) {
    fallbackPriority = 'High';
    fallbackExplanation =
      mathScore >= 4
        ? `Urgency score ${mathScore} >= 4 (Category base: ${CATEGORY_WEIGHTS[complaint.category]}, Age: ${ageInHours}h)`
        : 'AI flagged high severity issue';
  } else if (complaint.aiSeverity === 'Medium' || mathScore === 3) {
    fallbackPriority = 'Medium';
    fallbackExplanation = `Urgency score ${mathScore} (Normal priority)`;
  } else {
    fallbackPriority = 'Low';
  }

  // Escalate if multiple similar complaints exist
  if (similarCount >= 2) {
    if (fallbackPriority === 'Low') fallbackPriority = 'Medium';
    else if (fallbackPriority === 'Medium') fallbackPriority = 'High';
    fallbackExplanation = `Priority increased because ${similarCount + 1} students reported similar issues`;
  }

  return {
    effectivePriority: fallbackPriority,
    priorityExplanation: fallbackExplanation,
    similarComplaintCount: similarCount,
  };
}

/**
 * Enriches a complaint with calculated age, category weight, urgency score, tier,
 * effective priority, and transparent rationale.
 */
export function evaluateComplaint(
  complaint: Complaint,
  currentTimestamp: number = Date.now(),
  allComplaints: Complaint[] = []
): EvaluatedComplaint {
  const ageInHours = getAgeInHours(complaint.submittedAt, currentTimestamp);
  const categoryWeight = CATEGORY_WEIGHTS[complaint.category] ?? 1;
  const urgencyScore = calculateUrgencyScore(complaint.category, ageInHours);
  const urgencyTier = getUrgencyTier(urgencyScore);

  const { effectivePriority, priorityExplanation, similarComplaintCount } =
    getEffectivePriority(complaint, allComplaints, currentTimestamp);

  return {
    ...complaint,
    ageInHours,
    categoryWeight,
    urgencyScore,
    urgencyTier,
    effectivePriority,
    priorityExplanation,
    similarComplaintCount,
  };
}

/**
 * Returns unresolved complaints sorted by strict priority hierarchy:
 * 1. Emergency complaints first
 * 2. Critical complaints next
 * 3. High-priority complaints
 * 4. Medium-priority complaints
 * 5. Low-priority complaints
 *
 * Within the same priority tier:
 * - Higher mathematical urgency score first
 * - Older complaint first (higher age in hours)
 * - Complaint ID alphabetically as tie-breaker
 *
 * Excludes all Resolved complaints.
 */
export function getPriorityQueue(
  complaints: Complaint[],
  limit: number = 3,
  currentTimestamp: number = Date.now()
): EvaluatedComplaint[] {
  // Only calculate priority for unresolved complaints (Raised or In Progress)
  const unresolved = complaints.filter(
    (c) => c.status === 'Raised' || c.status === 'In Progress'
  );

  const evaluated = unresolved.map((c) =>
    evaluateComplaint(c, currentTimestamp, unresolved)
  );

  // Sort by multi-tier rules
  evaluated.sort((a, b) => {
    // Rule 1: Priority Tier order (Emergency -> Critical -> High -> Medium -> Low)
    const rankDiff =
      PRIORITY_RANK[a.effectivePriority] - PRIORITY_RANK[b.effectivePriority];
    if (rankDiff !== 0) {
      return rankDiff;
    }

    // Rule 2: Higher mathematical urgency score first
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }

    // Rule 3: Older complaint first (higher ageInHours)
    if (b.ageInHours !== a.ageInHours) {
      return b.ageInHours - a.ageInHours;
    }

    // Rule 4: Alphabetical by complaint ID
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return limit > 0 ? evaluated.slice(0, limit) : evaluated;
}

/**
 * Computes dashboard summary counts with emergency & critical breakdown:
 * 1. Total Complaints – Total number of submitted complaints
 * 2. Pending Complaints – Complaints whose status is Raised or In Progress
 * 3. Resolved Complaints – Complaints whose status is Resolved
 * 4. High Priority – Number of unresolved complaints classified as high priority (urgencyScore >= 4)
 * 5. Emergency Count – Number of unresolved emergency complaints
 * 6. Critical Count – Number of unresolved critical complaints
 */
export function getSummaryStats(
  complaints: Complaint[],
  currentTimestamp: number = Date.now()
): SummaryStats {
  let pending = 0;
  let resolved = 0;
  let highPriority = 0;
  let emergencyCount = 0;
  let criticalCount = 0;

  for (const c of complaints) {
    if (c.status === 'Resolved') {
      resolved++;
    } else {
      pending++;
      const age = getAgeInHours(c.submittedAt, currentTimestamp);
      const score = calculateUrgencyScore(c.category, age);
      if (score >= 4) {
        highPriority++;
      }
      if (c.isEmergency || c.category === 'Emergency') {
        emergencyCount++;
      } else if (c.aiSeverity === 'Critical' || c.priorityOverride === 'Critical') {
        criticalCount++;
      }
    }
  }

  return {
    total: complaints.length,
    pending,
    resolved,
    highPriority,
    emergencyCount,
    criticalCount,
  };
}
