import { Complaint, ComplaintStatus } from '@/types/complaint';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { generateInitialSampleRecords } from '@/utils/constants';
import { getStoredComplaints, saveComplaints as saveToLocalCache } from '@/utils/storage';

const COLLECTION_NAME = 'campus_complaints';

export type FirebaseConnectionStatus = 'connected' | 'connecting' | 'fallback';

/**
 * Ensures initial database state:
 * - If documents already exist in the Firebase database, they are PRESERVED and untouched.
 * - Only if the collection is completely empty, it seeds the official sample complaints.
 */
export async function initializeFirebaseComplaints(): Promise<Complaint[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    // If documents already exist in Firebase, DO NOT disturb any of those records/strings!
    if (!snapshot.empty) {
      const existing: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Complaint;
        existing.push({
          ...data,
          id: data.id || docSnap.id,
        });
      });
      // Cache locally
      saveToLocalCache(existing);
      return existing;
    }

    // Only seed if collection is completely empty
    const initialRecords = generateInitialSampleRecords();
    for (const record of initialRecords) {
      await setDoc(doc(db, COLLECTION_NAME, record.id), record);
    }

    saveToLocalCache(initialRecords);
    return initialRecords;
  } catch (error) {
    console.warn('Firebase read error or offline. Falling back to local storage:', error);
    return getStoredComplaints();
  }
}

/**
 * Subscribes to real-time complaint updates from Firebase Firestore.
 * If Firebase is unreachable, safely falls back to local storage cache.
 */
export function subscribeToComplaints(
  onUpdate: (complaints: Complaint[], isFirebase: boolean) => void,
  onStatusChange?: (status: FirebaseConnectionStatus) => void
): Unsubscribe {
  onStatusChange?.('connecting');

  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        onStatusChange?.('connected');

        if (snapshot.empty) {
          // If empty in Firebase, initialize with sample records without overwriting
          const seeded = await initializeFirebaseComplaints();
          onUpdate(seeded, true);
          return;
        }

        const items: Complaint[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Complaint;
          items.push({
            ...data,
            id: data.id || docSnap.id,
          });
        });

        // Keep local cache in sync
        saveToLocalCache(items);
        onUpdate(items, true);
      },
      (error) => {
        console.warn('Firestore onSnapshot listener error (using local cache):', error);
        onStatusChange?.('fallback');
        // Fall back to local storage without crashing
        const local = getStoredComplaints();
        onUpdate(local, false);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore listener (using local storage):', err);
    onStatusChange?.('fallback');
    const local = getStoredComplaints();
    onUpdate(local, false);
    return () => {};
  }
}

/**
 * Adds a new complaint to Firebase Firestore.
 * Does not disturb or overwrite any other documents.
 */
export async function addComplaint(complaint: Complaint): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, complaint.id);
    await setDoc(docRef, complaint, { merge: true });
  } catch (error) {
    console.warn('Could not save complaint directly to Firebase; saved to local cache:', error);
  }
}

/**
 * Advances or updates complaint status in Firebase Firestore.
 */
export async function updateComplaintStatus(
  id: string,
  newStatus: ComplaintStatus,
  resolvedAt?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: Partial<Complaint> = {
      status: newStatus,
    };
    if (resolvedAt) {
      updatePayload.resolvedAt = resolvedAt;
    }
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.warn('Could not update status in Firebase; updated local cache:', error);
  }
}

/**
 * Resets database to sample complaints upon explicit administrative confirmation.
 */
export async function resetDatabaseToSampleComplaints(): Promise<Complaint[]> {
  const samples = generateInitialSampleRecords();
  try {
    for (const record of samples) {
      await setDoc(doc(db, COLLECTION_NAME, record.id), record);
    }
  } catch (error) {
    console.warn('Could not reset Firebase records; resetting local cache:', error);
  }
  saveToLocalCache(samples);
  return samples;
}

