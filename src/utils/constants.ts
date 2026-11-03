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
  COMPLAINTS: 'camp_resolver_manual_complaints_v3',
  SEEDED: 'camp_resolver_seeded_v3',
};

export function generateInitialSampleRecords(): Complaint[] {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  return [
    {
      id: 'C01',
      title: 'Campus Wi-Fi frequently disconnecting',
      category: 'Wi-Fi',
      location: 'Central Library & Reading Hall 2',
      studentName: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      scholarNumber: 'SCH2024-0891',
      gpsLocation: '23.2599° N, 77.4126° E',
      description: 'Campus Wi-Fi is frequently disconnecting.',
      submittedAt: new Date(now - 48 * ONE_HOUR).toISOString(),
      status: 'Raised',
      createdAt: new Date(now - 48 * ONE_HOUR).toISOString(),
      adminRemarks: 'Network operations center notified. Scheduled switch reboot.',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 48 * ONE_HOUR).toISOString(),
          note: 'Ticket registered in system.',
        },
      ],
    },
    {
      id: 'C02',
      title: 'Irregular water supply in hostel',
      category: 'Hostel',
      location: 'Hostel Block B, 2nd Floor',
      studentName: 'Priya Verma',
      email: 'priya.v@campus.edu',
      scholarNumber: 'SCH2024-1142',
      gpsLocation: '23.2585° N, 77.4140° E',
      description: 'Water supply is irregular in the hostel.',
      submittedAt: new Date(now - 8 * ONE_HOUR).toISOString(),
      status: 'In Progress',
      createdAt: new Date(now - 8 * ONE_HOUR).toISOString(),
      adminRemarks: 'Maintenance plumber dispatched to inspect overhead tank valve.',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 8 * ONE_HOUR).toISOString(),
          note: 'Complaint registered by student.',
        },
        {
          status: 'In Progress',
          timestamp: new Date(now - 4 * ONE_HOUR).toISOString(),
          note: 'Plumbing contractor assigned.',
        },
      ],
    },
    {
      id: 'C03',
      title: 'Classroom projector not functioning',
      category: 'Classroom',
      location: 'Academic Block 1, Room 204',
      studentName: 'Rohan Gupta',
      email: 'rohan.g@campus.edu',
      scholarNumber: 'SCH2023-0450',
      gpsLocation: '23.2610° N, 77.4110° E',
      description: 'Classroom projector is not functioning.',
      submittedAt: new Date(now - 72 * ONE_HOUR).toISOString(),
      status: 'Raised',
      createdAt: new Date(now - 72 * ONE_HOUR).toISOString(),
      adminRemarks: 'AV technician assigned to replace HDMI input port.',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 72 * ONE_HOUR).toISOString(),
          note: 'Faculty representative registered AV failure.',
        },
      ],
    },
    {
      id: 'C04',
      title: 'Laboratory computers not starting',
      category: 'Laboratory',
      location: 'Computer Lab 3, Systems 12-18',
      studentName: 'Ananya Patel',
      email: 'ananya.p@campus.edu',
      scholarNumber: 'SCH2023-0789',
      gpsLocation: '23.2605° N, 77.4132° E',
      description: 'Computers in the laboratory are not starting.',
      submittedAt: new Date(now - 24 * ONE_HOUR).toISOString(),
      status: 'Resolved',
      createdAt: new Date(now - 24 * ONE_HOUR).toISOString(),
      resolvedAt: new Date(now - 2 * ONE_HOUR).toISOString(),
      adminRemarks: 'Systems reimaged by lab technician. All 6 computers booting normally.',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 24 * ONE_HOUR).toISOString(),
          note: 'Issue reported during practical exam session.',
        },
        {
          status: 'In Progress',
          timestamp: new Date(now - 12 * ONE_HOUR).toISOString(),
          note: 'Network boot server verified.',
        },
        {
          status: 'Resolved',
          timestamp: new Date(now - 2 * ONE_HOUR).toISOString(),
          note: 'Verified and marked closed.',
        },
      ],
    },
  ];
}
