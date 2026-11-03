import { Complaint, ComplaintCategory, ComplaintStatus } from '@/types/complaint';

export const CATEGORIES: ComplaintCategory[] = [
  'Wi-Fi',
  'Hostel',
  'Classroom',
  'Laboratory',
  'Other',
  'Emergency',
];

export const CATEGORY_WEIGHTS: Record<ComplaintCategory, number> = {
  'Emergency': 4,
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
  NOTIFICATIONS: 'camp_resolver_notifications_v3',
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
      aiSeverity: 'Medium',
      aiIssueType: 'Network Connectivity',
      aiSummary: 'Intermittent wireless connection in central library',
      aiSuggestedPriority: 'High',
      aiRecommendedDepartment: 'IT Department',
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
      aiSeverity: 'Medium',
      aiIssueType: 'Plumbing & Water Supply',
      aiSummary: 'Hostel Block B water shortage during morning hours',
      aiSuggestedPriority: 'Medium',
      aiRecommendedDepartment: 'Hostel Administration',
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
      aiSeverity: 'Low',
      aiIssueType: 'AV Equipment Failure',
      aiSummary: 'Projector display failing in Room 204 lecture hall',
      aiSuggestedPriority: 'High',
      aiRecommendedDepartment: 'Academic & AV Support',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 72 * ONE_HOUR).toISOString(),
          note: 'Complaint registered by student.',
        },
      ],
    },
    {
      id: 'C04',
      title: 'Broken chair in chemistry lab',
      category: 'Laboratory',
      location: 'Science Block 2, Chemistry Lab 3',
      studentName: 'Ananya Patel',
      email: 'ananya.p@campus.edu',
      scholarNumber: 'SCH2024-0219',
      gpsLocation: '23.2570° N, 77.4160° E',
      description: 'Broken chair in chemistry lab.',
      submittedAt: new Date(now - 96 * ONE_HOUR).toISOString(),
      status: 'Resolved',
      createdAt: new Date(now - 96 * ONE_HOUR).toISOString(),
      resolvedAt: new Date(now - 24 * ONE_HOUR).toISOString(),
      adminRemarks: 'Damaged stool replaced by carpentry department.',
      aiSeverity: 'Low',
      aiIssueType: 'Furniture Repair',
      aiSummary: 'Damaged laboratory workstation stool',
      aiSuggestedPriority: 'Low',
      aiRecommendedDepartment: 'Estate Maintenance',
      statusUpdates: [
        {
          status: 'Raised',
          timestamp: new Date(now - 96 * ONE_HOUR).toISOString(),
          note: 'Ticket created.',
        },
        {
          status: 'In Progress',
          timestamp: new Date(now - 48 * ONE_HOUR).toISOString(),
          note: 'Work order issued to carpentry team.',
        },
        {
          status: 'Resolved',
          timestamp: new Date(now - 24 * ONE_HOUR).toISOString(),
          note: 'Replacement stool installed and inspected.',
        },
      ],
    },
  ];
}
