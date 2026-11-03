export type ComplaintCategory = 'Wi-Fi' | 'Hostel' | 'Classroom' | 'Laboratory' | 'Other';

export type ComplaintStatus = 'Raised' | 'In Progress' | 'Resolved';

export type UrgencyTier = 'High' | 'Medium' | 'Low';

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  submittedAt: string; // ISO 8601 string
  status: ComplaintStatus;
  createdAt?: string;
  resolvedAt?: string;
}

export interface EvaluatedComplaint extends Complaint {
  ageInHours: number;
  categoryWeight: number;
  urgencyScore: number;
  urgencyTier: UrgencyTier;
}

export interface SummaryStats {
  total: number;
  pending: number;
  resolved: number;
  highPriority: number;
}

export interface FilterState {
  searchQuery: string;
  category: ComplaintCategory | 'ALL';
  status: ComplaintStatus | 'ALL';
}
