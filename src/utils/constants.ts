import { Complaint, ComplaintCategory, ComplaintStatus } from '@/types/complaint';

export const CATEGORIES: ComplaintCategory[] = [
  'Wi-Fi',
  'Hostel',
  'Classroom',
  'Laboratory',
  'Other',
];

export const CATEGORY_WEIGHTS: Record<ComplaintCategory, number> = {
  'Laboratory': 3,
  'Wi-Fi': 2,
  'Hostel': 2,
  'Classroom': 1,
  'Other': 1,
};

export const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus | null> = {
  'Raised': 'In Progress',
  'In Progress': 'Resolved',
  'Resolved': null, // End of workflow
};

export const STORAGE_KEYS = {
  COMPLAINTS: 'campus_complaints_data_v1',
  SEEDED: 'campus_complaints_seeded_v1',
};

export function generateInitialSampleRecords(): Complaint[] {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  return [
    {
      id: 'C01',
      category: 'Wi-Fi',
      description: 'Campus Wi-Fi is frequently disconnecting.',
      submittedAt: new Date(now - 48 * ONE_HOUR).toISOString(),
      status: 'Raised',
      createdAt: new Date(now - 48 * ONE_HOUR).toISOString(),
    },
    {
      id: 'C02',
      category: 'Hostel',
      description: 'Water supply is irregular in the hostel.',
      submittedAt: new Date(now - 8 * ONE_HOUR).toISOString(),
      status: 'In Progress',
      createdAt: new Date(now - 8 * ONE_HOUR).toISOString(),
    },
    {
      id: 'C03',
      category: 'Classroom',
      description: 'Classroom projector is not functioning.',
      submittedAt: new Date(now - 72 * ONE_HOUR).toISOString(),
      status: 'Raised',
      createdAt: new Date(now - 72 * ONE_HOUR).toISOString(),
    },
    {
      id: 'C04',
      category: 'Laboratory',
      description: 'Computers in the laboratory are not starting.',
      submittedAt: new Date(now - 24 * ONE_HOUR).toISOString(),
      status: 'Resolved',
      createdAt: new Date(now - 24 * ONE_HOUR).toISOString(),
      resolvedAt: new Date(now - 2 * ONE_HOUR).toISOString(),
    },
  ];
}

