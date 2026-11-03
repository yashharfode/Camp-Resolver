import { Complaint } from '@/types/complaint';
import { STORAGE_KEYS, generateInitialSampleRecords } from './constants';

/**
 * Safely reads complaints from localStorage.
 * Only returns complaints that have been manually added by users.
 * Does not prefetch or auto-seed dummy records.
 */
export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedData = window.localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    console.error('Error reading complaints from localStorage:', error);
    return [];
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
 * Resets complaints back to the official benchmark sample records.
 * Only triggered on explicit administrator action in settings.
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
 * and picks the next unused integer, padded to at least 2 digits (e.g. C01, C02, ...).
 * Guarantees never to collide with or overwrite any existing complaint.
 */
export function generateNextComplaintId(existingComplaints: Complaint[]): string {
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

  const nextNum = maxNum + 1;
  const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  return `C${padded}`;
}
