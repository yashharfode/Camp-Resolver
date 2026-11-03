import { EmergencyNotification, Complaint } from '@/types/complaint';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { STORAGE_KEYS } from '@/utils/constants';

export const NOTIFICATION_COLLECTION = 'camp_resolver_notifications';

/**
 * Reads local cached emergency notifications.
 */
export function getStoredNotifications(): EmergencyNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse notifications from localStorage:', e);
    return [];
  }
}

/**
 * Saves emergency notifications to local cache.
 */
export function saveNotificationsToLocal(notifications: EmergencyNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.warn('Failed to save notifications to localStorage:', e);
  }
}

/**
 * Creates an emergency notification in Firestore and local storage.
 */
export async function createEmergencyNotification(
  complaint: Complaint
): Promise<EmergencyNotification> {
  const notifId = `NOTIF-${complaint.id}-${Date.now()}`;
  const nowStr = new Date().toISOString();

  const notification: EmergencyNotification = {
    id: notifId,
    complaintId: complaint.id,
    studentName: complaint.studentName || 'Student',
    scholarNumber: complaint.scholarNumber,
    email: complaint.email,
    location: complaint.location,
    description: complaint.description,
    emergencyDetails: complaint.emergencyDetails || complaint.description,
    department:
      complaint.aiRecommendedDepartment ||
      (complaint.category === 'Laboratory'
        ? 'Lab Safety & Maintenance'
        : complaint.category === 'Hostel'
        ? 'Hostel Warden Office'
        : 'Campus Security & Emergency Response'),
    submittedAt: complaint.submittedAt || nowStr,
    severity: complaint.aiSeverity || 'Critical',
    acknowledged: false,
  };

  // 1. Update local cache
  const current = getStoredNotifications();
  const exists = current.some((n) => n.complaintId === complaint.id);
  if (!exists) {
    const updated = [notification, ...current];
    saveNotificationsToLocal(updated);
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, NOTIFICATION_COLLECTION, notifId);
    // Sanitize to remove any undefined properties
    const cleanedNotif: Record<string, any> = {};
    for (const [k, v] of Object.entries(notification)) {
      if (v !== undefined) cleanedNotif[k] = v;
    }
    await setDoc(docRef, cleanedNotif, { merge: true });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      console.warn('[Camp Resolver] Notification Firestore permission-denied; saved locally.');
    } else {
      console.warn('Firestore notification write error (saved locally):', err);
    }
  }

  // 3. Trigger browser notification if allowed
  sendBrowserNotification(`EMERGENCY ALERT: ${complaint.id}`, {
    body: `${notification.studentName}: ${notification.emergencyDetails}`,
    icon: '/favicon.ico',
    tag: notifId,
  });

  return notification;
}

/**
 * Subscribes to real-time emergency notifications.
 */
export function subscribeToEmergencyNotifications(
  onUpdate: (notifications: EmergencyNotification[]) => void
): Unsubscribe {
  try {
    const colRef = collection(db, NOTIFICATION_COLLECTION);
    const q = query(colRef, orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const local = getStoredNotifications();
          onUpdate(local);
          return;
        }

        const items: EmergencyNotification[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as EmergencyNotification);
        });

        saveNotificationsToLocal(items);
        onUpdate(items);
      },
      (error) => {
        console.warn('Emergency notification snapshot listener error, using local:', error);
        onUpdate(getStoredNotifications());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore notification listener, fallback to local:', err);
    onUpdate(getStoredNotifications());
    return () => {};
  }
}

/**
 * Acknowledges an emergency notification.
 */
export async function acknowledgeEmergencyNotification(
  notificationId: string,
  adminName: string = 'Campus Administrator'
): Promise<void> {
  const nowStr = new Date().toISOString();
  const current = getStoredNotifications();
  const updated = current.map((n) => {
    if (n.id === notificationId) {
      return {
        ...n,
        acknowledged: true,
        acknowledgedAt: nowStr,
        acknowledgedBy: adminName,
      };
    }
    return n;
  });
  saveNotificationsToLocal(updated);

  try {
    const docRef = doc(db, NOTIFICATION_COLLECTION, notificationId);
    await updateDoc(docRef, {
      acknowledged: true,
      acknowledgedAt: nowStr,
      acknowledgedBy: adminName,
    });
  } catch (err) {
    console.warn('Failed to update notification acknowledgement in Firestore:', err);
  }
}

/**
 * Request browser permission for system notifications.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return 'denied';
  }
}

/**
 * Sends a browser notification if permission has been granted.
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (e) {
      console.warn('Browser notification display error:', e);
    }
  }
}

