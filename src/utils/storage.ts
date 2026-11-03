import { Complaint } from '@/types/complaint';
import { STORAGE_KEYS, generateInitialSampleRecords } from './constants';

/**
 * Safely reads complaints from localStorage.
 * Handles missing data, invalid JSON, or uninitialized storage.
 * Seeds initial sample records only on the very first time.
 */
export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const isSeeded = window.localStorage.getItem(STORAGE_KEYS.SEEDED);
    const storedData = window.localStorage.getItem(STORAGE_KEYS.COMPLAINTS);

    // If never seeded before and no data exists, initialize with sample records
    if (!isSeeded && !storedData) {
      const initial = generateInitialSampleRecords();
      saveComplaints(initial);
      window.localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
      return initial;
    }

    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // If storage is marked as seeded but data was cleared (e.g. user emptied list), return empty array
    if (isSeeded) {
      return [];
    }

    // Fallback seed
    const initial = generateInitialSampleRecords();
    saveComplaints(initial);
    window.localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    return initial;
  } catch (error) {
    console.error('Error reading complaints from localStorage:', error);
    return generateInitialSampleRecords();
  }
}

/**
 * Persists complaints array to localStorage.
 */
export function saveComplaints(complaints: Complaint[]): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    window.localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  } catch (error) {
    console.error('Error saving complaints to localStorage:', error);
  }
}

/**
 * Resets complaints back to the fresh initial sample records.
 */
export function resetToSampleComplaints(): Complaint[] {
  if (typeof window === 'undefined') {
    return generateInitialSampleRecords();
  }

  try {
    const sample = generateInitialSampleRecords();
    saveComplaints(sample);
    return sample;
  } catch (error) {
    console.error('Error resetting sample complaints:', error);
    return generateInitialSampleRecords();
  }
}

/**
 * Generates the next sequential unique complaint ID.
 * Scans all existing complaints for numeric suffixes after 'C' (e.g. C01 -> 1, C04 -> 4)
 * and picks the next unused integer, padded to at least 2 digits (e.g. C05, C06, C100).
 * Guarantees never to collide with or overwrite any existing complaint.
 */
export function generateNextComplaintId(existingComplaints: Complaint[]): string {
  const existingIds = new Set(existingComplaints.map((c) => c.id.trim().toUpperCase()));

  let maxNum = 0;
  for (const c of existingComplaints) {
    const match = c.id.trim().match(/^C0*(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidateId = `C${nextNum.toString().padStart(2, '0')}`;

  // Collision safety loop
  while (existingIds.has(candidateId.toUpperCase())) {
    nextNum++;
    candidateId = `C${nextNum.toString().padStart(2, '0')}`;
  }

  return candidateId;
}
