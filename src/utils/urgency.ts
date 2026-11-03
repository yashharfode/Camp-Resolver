import { Complaint, ComplaintCategory, EvaluatedComplaint, SummaryStats, UrgencyTier } from '@/types/complaint';
import { CATEGORY_WEIGHTS } from './constants';

/**
 * Calculates the age of a complaint in whole hours from its submittedAt timestamp.
 */
export function getAgeInHours(submittedAt: string, currentTimestamp: number = Date.now()): number {
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
 */
export function calculateUrgencyScore(category: ComplaintCategory, ageInHours: number): number {
  const categoryWeight = CATEGORY_WEIGHTS[category] ?? 1;
  const ageFactor = Math.floor(Math.max(0, ageInHours) / 24);
  return categoryWeight + ageFactor;
}

/**
 * Determines urgency classification tier.
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
 * Enriches a complaint with calculated age, category weight, urgency score, and tier.
 */
export function evaluateComplaint(complaint: Complaint, currentTimestamp: number = Date.now()): EvaluatedComplaint {
  const ageInHours = getAgeInHours(complaint.submittedAt, currentTimestamp);
  const categoryWeight = CATEGORY_WEIGHTS[complaint.category] ?? 1;
  const urgencyScore = calculateUrgencyScore(complaint.category, ageInHours);
  const urgencyTier = getUrgencyTier(urgencyScore);

  return {
    ...complaint,
    ageInHours,
    categoryWeight,
    urgencyScore,
    urgencyTier,
  };
}

/**
 * Returns the highest-priority unresolved complaints sorted using tie-breaking rules:
 * 1. Higher urgency score comes first.
 * 2. If scores are equal, the older complaint comes first (higher age in hours).
 * 3. If age is also equal, sort by complaint ID alphabetically (e.g. C01 before C02).
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

  const evaluated = unresolved.map((c) => evaluateComplaint(c, currentTimestamp));

  // Sort by tie-breaking rules
  evaluated.sort((a, b) => {
    // Rule 1: Higher urgency score first
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    // Rule 2: Older complaint first (higher ageInHours, or earlier submitted timestamp)
    if (b.ageInHours !== a.ageInHours) {
      return b.ageInHours - a.ageInHours;
    }
    // Rule 3: Alphabetical by complaint ID
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return limit > 0 ? evaluated.slice(0, limit) : evaluated;
}

/**
 * Computes dashboard summary counts:
 * 1. Total Complaints – Total number of submitted complaints
 * 2. Pending Complaints – Complaints whose status is Raised or In Progress
 * 3. Resolved Complaints – Complaints whose status is Resolved
 * 4. High Priority – Number of unresolved complaints classified as high priority (urgencyScore >= 4)
 */
export function getSummaryStats(
  complaints: Complaint[],
  currentTimestamp: number = Date.now()
): SummaryStats {
  let pending = 0;
  let resolved = 0;
  let highPriority = 0;

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
    }
  }

  return {
    total: complaints.length,
    pending,
    resolved,
    highPriority,
  };
}

