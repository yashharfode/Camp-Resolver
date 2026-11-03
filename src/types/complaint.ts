export type ComplaintCategory =
  | 'Wi-Fi'
  | 'Hostel'
  | 'Classroom'
  | 'Laboratory'
  | 'Other'
  | 'Emergency';

export type ComplaintStatus = 'Raised' | 'In Progress' | 'Resolved';

export type UrgencyTier = 'High' | 'Medium' | 'Low';

export type AISeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type AIPriority = 'Emergency' | 'Critical' | 'High' | 'Medium' | 'Low';

export interface AIAnalysisResult {
  summary: string;
  issueType: string;
  severity: AISeverity;
  suggestedPriority: AIPriority;
  recommendedDepartment: string;
  immediateAttention: boolean;
  reason: string;
  analyzedAt: string;
}

export interface StatusUpdateRecord {
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  submittedAt: string; // ISO 8601 string
  status: ComplaintStatus;
  title?: string;
  studentName?: string;
  email?: string;
  scholarNumber?: string;
  location?: string;
  gpsLocation?: string;
  adminRemarks?: string;
  statusUpdates?: StatusUpdateRecord[];
  createdAt?: string;
  resolvedAt?: string;

  // Privacy & Anonymous Submission
  isAnonymous?: boolean;

  // AI-Powered Intelligence Fields
  isEmergency?: boolean;
  emergencyDetails?: string;
  aiSeverity?: AISeverity;
  aiIssueType?: string;
  aiSummary?: string;
  aiSuggestedPriority?: AIPriority;
  aiReason?: string;
  aiRecommendedDepartment?: string;
  aiImmediateAttention?: boolean;
  aiAnalyzedAt?: string;
  aiReviewStatus?: 'pending' | 'completed' | 'overridden';
  priorityOverride?: AIPriority;
  priorityExplanation?: string;

  // Emergency & Notification Fields
  emergencyAcknowledged?: boolean;
  emergencyAcknowledgedAt?: string;
  emergencyAcknowledgedBy?: string;
}

export interface EvaluatedComplaint extends Complaint {
  ageInHours: number;
  categoryWeight: number;
  urgencyScore: number;
  urgencyTier: UrgencyTier;
  effectivePriority: AIPriority;
  priorityExplanation: string;
  similarComplaintCount?: number;
}

export interface EmergencyNotification {
  id: string;
  complaintId: string;
  studentName: string;
  scholarNumber?: string;
  email?: string;
  location?: string;
  description: string;
  emergencyDetails?: string;
  department: string;
  submittedAt: string;
  severity: AISeverity;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface SummaryStats {
  total: number;
  pending: number;
  resolved: number;
  highPriority: number;
  emergencyCount?: number;
  criticalCount?: number;
}

export interface FilterState {
  searchQuery: string;
  category: ComplaintCategory | 'ALL';
  status: ComplaintStatus | 'ALL';
  priority?: AIPriority | 'ALL';
}

export interface CampusReportData {
  title: string;
  generatedAt: string;
  period: string;
  summary: string;
  topIssue: string;
  problematicDepartment: string;
  recurringIncidents: string[];
  safetyEmergencyReview: string;
  recommendations: string[];
  fullReportMarkdown: string;
}
