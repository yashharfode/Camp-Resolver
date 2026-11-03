import { calculateUrgencyScore, evaluateComplaint, getPriorityQueue, getEffectivePriority } from '../src/utils/urgency';
import { Complaint } from '../src/types/complaint';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- TESTING AI COMPLAINT INTELLIGENCE ENGINE & RULES ---');

// Test 1: Emergency complaint priority precedence
const now = Date.now();
const complaints: Complaint[] = [
  {
    id: 'C01',
    category: 'Wi-Fi',
    description: 'Wi-Fi slow in library',
    submittedAt: new Date(now - 72 * 3600000).toISOString(), // 72 hours old
    status: 'Raised',
  },
  {
    id: 'C02',
    category: 'Emergency',
    title: 'Electric sparks in hostel room',
    description: 'Electric sparks are coming from the wiring in our hostel room, and there is a burning smell.',
    emergencyDetails: 'Sparks from electrical box',
    isEmergency: true,
    aiSeverity: 'Critical',
    submittedAt: new Date(now - 10 * 60000).toISOString(), // 10 minutes old!
    status: 'Raised',
  },
  {
    id: 'C03',
    category: 'Laboratory',
    description: 'Chemical smell in fume hood',
    aiSeverity: 'Critical',
    submittedAt: new Date(now - 2 * 3600000).toISOString(),
    status: 'Raised',
  },
];

const priorityQueue = getPriorityQueue(complaints, 3, now);

assert(priorityQueue[0].id === 'C02', 'Emergency C02 ranks #1 ahead of older complaints');
assert(priorityQueue[0].effectivePriority === 'Emergency', 'C02 has Emergency effective priority');
assert(priorityQueue[1].id === 'C03', 'Critical C03 ranks #2 above standard high priority C01');
assert(priorityQueue[2].id === 'C01', 'C01 ranks #3');

// Test 2: Tie breaking within same priority tier
const sameTierComplaints: Complaint[] = [
  {
    id: 'C20',
    category: 'Wi-Fi',
    description: 'Issue 1',
    submittedAt: new Date(now - 24 * 3600000).toISOString(),
    status: 'Raised',
    aiSuggestedPriority: 'High',
  },
  {
    id: 'C10',
    category: 'Wi-Fi',
    description: 'Issue 2',
    submittedAt: new Date(now - 48 * 3600000).toISOString(), // Older (48h vs 24h)
    status: 'Raised',
    aiSuggestedPriority: 'High',
  },
];

const queueSameTier = getPriorityQueue(sameTierComplaints, 2, now);
assert(queueSameTier[0].id === 'C10', 'Within same priority tier High, higher score/older complaint C10 ranks #1');

// Test 3: Admin override
const overrideComp: Complaint = {
  id: 'C99',
  category: 'Other',
  description: 'Water cooler leak',
  submittedAt: new Date(now - 5 * 3600000).toISOString(),
  status: 'Raised',
  priorityOverride: 'Emergency',
};
const evalOverride = evaluateComplaint(overrideComp, now);
assert(evalOverride.effectivePriority === 'Emergency', 'Admin priorityOverride "Emergency" enforced correctly');
assert(evalOverride.priorityExplanation.includes('overridden by administrator'), 'Admin override explanation recorded');

console.log('--- ALL AI COMPLAINT INTELLIGENCE TESTS PASSED! ---');

