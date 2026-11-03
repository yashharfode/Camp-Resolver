import {
  calculateUrgencyScore,
  evaluateComplaint,
  getAgeInHours,
  getPriorityQueue,
  getSummaryStats,
} from '../src/utils/urgency';
import {
  generateInitialSampleRecords,
  CATEGORY_WEIGHTS,
  STATUS_TRANSITIONS,
} from '../src/utils/constants';
import { generateNextComplaintId } from '../src/utils/storage';
import { Complaint } from '../src/types/complaint';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- RUNNING CAMPUS COMPLAINT SYSTEM VERIFICATION ---');

// 1. Urgency formula verification
assert(calculateUrgencyScore('Wi-Fi', 48) === 4, 'Wi-Fi at 48 hours = 2 + floor(48/24) = 4');
assert(calculateUrgencyScore('Hostel', 8) === 2, 'Hostel at 8 hours = 2 + floor(8/24) = 2');
assert(calculateUrgencyScore('Classroom', 72) === 4, 'Classroom at 72 hours = 1 + floor(72/24) = 4');
assert(calculateUrgencyScore('Laboratory', 24) === 4, 'Laboratory at 24 hours = 3 + floor(24/24) = 4');
assert(calculateUrgencyScore('Other', 0) === 1, 'Other at 0 hours = 1 + 0 = 1');
assert(calculateUrgencyScore('Other', 49) === 3, 'Other at 49 hours = 1 + 2 = 3');
assert(calculateUrgencyScore('Emergency', 0) === 4, 'Emergency at 0 hours = 4 + 0 = 4');
assert(calculateUrgencyScore('Emergency', 48) === 6, 'Emergency at 48 hours = 4 + 2 = 6');

// 2. Initial Sample Records & Priority Queue Ordering
const sampleComplaints = generateInitialSampleRecords();
assert(sampleComplaints.length === 4, '4 sample complaints generated');

const now = Date.now();
const queue = getPriorityQueue(sampleComplaints, 3, now);

assert(queue.length === 3, 'Top 3 unresolved complaints returned');
// C04 is Resolved, so unresolved are C01, C02, C03
// C03 has score 4 (72h), C01 has score 4 (48h), C02 has score 2 (8h)
// C03 vs C01: equal score 4, but C03 is older (72h vs 48h) -> C03 comes first!
assert(queue[0].id === 'C03', 'Rank #1 is C03 (Score 4, 72h)');
assert(queue[1].id === 'C01', 'Rank #2 is C01 (Score 4, 48h)');
assert(queue[2].id === 'C02', 'Rank #3 is C02 (Score 2, 8h)');
assert(!queue.some((c) => c.id === 'C04'), 'C04 (Resolved) is strictly excluded from Priority Queue');

// 3. Alphabetical tie-breaking when score, age and priority tier are equal
const tieComplaints: Complaint[] = [
  { id: 'C09', category: 'Wi-Fi', description: 'Test A', submittedAt: new Date(now - 24 * 3600000).toISOString(), status: 'Raised', aiSuggestedPriority: 'High' },
  { id: 'C05', category: 'Wi-Fi', description: 'Test B', submittedAt: new Date(now - 24 * 3600000).toISOString(), status: 'Raised', aiSuggestedPriority: 'High' },
];
const tieQueue = getPriorityQueue(tieComplaints, 2, now);
assert(tieQueue[0].id === 'C05' && tieQueue[1].id === 'C09', 'Tie-break rule 3 sorts alphabetically by ID (C05 before C09)');

// 4. Emergency Priority Queue Precedence
const emergencyComplaint: Complaint = {
  id: 'C10',
  category: 'Emergency',
  description: 'Severe electrical sparking in chemistry lab',
  emergencyDetails: 'Sparks and burning smell near switchboard',
  isEmergency: true,
  submittedAt: new Date(now - 1 * 3600000).toISOString(), // Only 1 hour old!
  status: 'Raised',
};
const queueWithEmergency = getPriorityQueue([...sampleComplaints, emergencyComplaint], 4, now);
assert(queueWithEmergency[0].id === 'C10', 'Emergency complaint C10 immediately ranks #1 regardless of age or score');
assert(queueWithEmergency[0].effectivePriority === 'Emergency', 'Effective priority is Emergency');

// 5. Admin Manual Override Verification
const overriddenComplaint: Complaint = {
  id: 'C11',
  category: 'Other',
  description: 'Water dispenser maintenance',
  submittedAt: new Date(now - 2 * 3600000).toISOString(),
  status: 'Raised',
  priorityOverride: 'Critical',
};
const queueWithOverride = getPriorityQueue([...sampleComplaints, overriddenComplaint], 4, now);
assert(queueWithOverride[0].id === 'C11', 'Admin overridden Critical priority ranks above standard High complaints');

// 6. Status workflow transitions
assert(STATUS_TRANSITIONS['Raised'] === 'In Progress', 'Raised transitions to In Progress');
assert(STATUS_TRANSITIONS['In Progress'] === 'Resolved', 'In Progress transitions to Resolved');
assert(STATUS_TRANSITIONS['Resolved'] === null, 'Resolved is terminal');

// 7. Unique ID generation
assert(generateNextComplaintId(sampleComplaints) === 'C05', 'Next ID for C01-C04 is C05');
assert(
  generateNextComplaintId([...sampleComplaints, { id: 'C05', category: 'Other', description: 'X', submittedAt: '', status: 'Raised' }]) === 'C06',
  'Next ID when C05 exists is C06'
);

// 8. Summary Stats
const stats = getSummaryStats(sampleComplaints, now);
assert(stats.total === 4, 'Total is 4');
assert(stats.pending === 3, 'Pending is 3 (C01 Raised, C02 In Progress, C03 Raised)');
assert(stats.resolved === 1, 'Resolved is 1 (C04 Resolved)');
assert(stats.highPriority === 2, 'High Priority count is 2 (C01 and C03 unresolved with score >= 4)');

console.log('\n🌟 ALL ALGORITHMIC, EMERGENCY & SPECIFICATION TESTS PASSED PERFECTLY! 🌟');
