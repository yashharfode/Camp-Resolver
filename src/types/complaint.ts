export type ComplaintCategory = 'Wi-Fi' | 'Hostel' | 'Classroom' | 'Laboratory' | 'Other';

export type ComplaintStatus = 'Raised' | 'In Progress' | 'Resolved';

export type UrgencyTier = 'High' | 'Medium' | 'Low';

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
