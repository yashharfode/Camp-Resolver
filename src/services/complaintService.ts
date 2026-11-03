import { Complaint, ComplaintStatus, StatusUpdateRecord } from '@/types/complaint';
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

export const COLLECTION_NAME = 'camp_resolver_complaints';

export type FirebaseConnectionStatus = 'connected' | 'connecting' | 'fallback';

/**
 * Reads existing complaints from Firebase Firestore.
 * Does NOT auto-seed sample records; only loads manually added data.
 */
export async function getFirebaseComplaints(): Promise<Complaint[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const existing: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Complaint;
        existing.push({
          ...data,
          id: data.id || docSnap.id,
        });
      });
      saveToLocalCache(existing);
      return existing;
    }

    return getStoredComplaints();
  } catch (error) {
    console.warn('Firebase read error or offline. Using local storage:', error);
    return getStoredComplaints();
  }
}

/**
 * Subscribes to real-time complaint updates from Firebase Firestore.
 * Does not pre-seed dummy data; shows only manually submitted complaints.
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
          // If empty in Firestore, load only manual local complaints or empty list
          const local = getStoredComplaints();
          onUpdate(local, true);
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
 * Adds a new complaint to Firebase Firestore & local storage.
 */
export async function addComplaint(complaint: Complaint): Promise<void> {
  const current = getStoredComplaints();
  const updated = [complaint, ...current.filter((c) => c.id !== complaint.id)];
  saveToLocalCache(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, complaint.id);
    await setDoc(docRef, complaint, { merge: true });
  } catch (error) {
    console.warn('Could not save complaint directly to Firebase (saved to local cache):', error);
  }
}

/**
 * Updates complaint status and optional admin remarks in Firebase and local storage.
 */
export async function updateComplaintStatusAndRemarks(
  id: string,
  newStatus: ComplaintStatus,
  remarks?: string
): Promise<Complaint[]> {
  const current = getStoredComplaints();
  const nowStr = new Date().toISOString();

  const updated = current.map((c) => {
    if (c.id === id) {
      const history: StatusUpdateRecord[] = c.statusUpdates ? [...c.statusUpdates] : [];
      history.push({
        status: newStatus,
        timestamp: nowStr,
        note: remarks || `Status changed to ${newStatus}`,
      });

      return {
        ...c,
        status: newStatus,
        adminRemarks: remarks !== undefined ? remarks : c.adminRemarks,
        resolvedAt: newStatus === 'Resolved' ? nowStr : c.resolvedAt,
        statusUpdates: history,
      };
    }
    return c;
  });

  saveToLocalCache(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const target = updated.find((c) => c.id === id);
    if (target) {
      await updateDoc(docRef, {
        status: target.status,
        adminRemarks: target.adminRemarks || '',
        resolvedAt: target.resolvedAt || null,
        statusUpdates: target.statusUpdates || [],
      });
    }
  } catch (error) {
    console.warn('Could not update status in Firebase (updated local cache):', error);
  }

  return updated;
}

/**
 * Legacy status advance helper.
 */
export async function updateComplaintStatus(
  id: string,
  newStatus: ComplaintStatus,
  resolvedAt?: string
): Promise<void> {
  await updateComplaintStatusAndRemarks(id, newStatus);
}

/**
 * Resets database to sample complaints upon explicit administrative confirmation.
 */
export async function resetDatabaseToSampleComplaints(): Promise<Complaint[]> {
  const samples = generateInitialSampleRecords();
  saveToLocalCache(samples);
  try {
    for (const record of samples) {
      await setDoc(doc(db, COLLECTION_NAME, record.id), record);
    }
  } catch (error) {
    console.warn('Could not reset Firebase records; resetting local cache:', error);
  }
  return samples;
}
