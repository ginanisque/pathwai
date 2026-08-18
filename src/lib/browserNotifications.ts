import { VisaRecord, MobilityDocument } from '../types';

export interface ExpiringItemAlert {
  id: string;
  itemType: 'visa' | 'document';
  title: string;
  countryOrCategory: string;
  expiryDate: string;
  hoursRemaining: number;
  daysRemaining: number;
  isWithin48Hours: boolean;
  isExpired: boolean;
  docNumberOrNotes?: string;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionStatus;
  } catch (err) {
    console.warn('Browser Notification permission error:', err);
    return getBrowserNotificationPermission();
  }
}

/**
 * Calculates remaining hours and flags items expiring within 48 hours.
 */
export function findExpiringItems(
  visas: VisaRecord[],
  documents: MobilityDocument[],
  thresholdHours: number = 48
): ExpiringItemAlert[] {
  const now = new Date();
  const alerts: ExpiringItemAlert[] = [];

  // 1. Process Visas
  visas.forEach((v) => {
    if (!v.expiryDate) return;
    const expDate = new Date(v.expiryDate);
    if (isNaN(expDate.getTime())) return;

    const diffMs = expDate.getTime() - now.getTime();
    const hoursRemaining = diffMs / (1000 * 60 * 60);
    const daysRemaining = Math.ceil(hoursRemaining / 24);

    const isWithin48Hours = hoursRemaining <= thresholdHours && hoursRemaining > -720;
    const isExpired = hoursRemaining <= 0;

    if (isWithin48Hours || isExpired) {
      alerts.push({
        id: v.id,
        itemType: 'visa',
        title: `${v.country} - ${v.visaType}`,
        countryOrCategory: v.country,
        expiryDate: v.expiryDate,
        hoursRemaining: Math.max(0, Math.floor(hoursRemaining)),
        daysRemaining: Math.max(0, daysRemaining),
        isWithin48Hours,
        isExpired,
        docNumberOrNotes: `Doc #${v.documentNumber}`
      });
    }
  });

  // 2. Process Mobility Documents
  documents.forEach((d) => {
    const dateStr = d.expiryDate || d.deadline;
    if (!dateStr) return;
    const expDate = new Date(dateStr);
    if (isNaN(expDate.getTime())) return;

    const diffMs = expDate.getTime() - now.getTime();
    const hoursRemaining = diffMs / (1000 * 60 * 60);
    const daysRemaining = Math.ceil(hoursRemaining / 24);

    const isWithin48Hours = hoursRemaining <= thresholdHours && hoursRemaining > -720;
    const isExpired = hoursRemaining <= 0;

    if (isWithin48Hours || isExpired) {
      alerts.push({
        id: d.id,
        itemType: 'document',
        title: d.title,
        countryOrCategory: d.category.toUpperCase(),
        expiryDate: dateStr,
        hoursRemaining: Math.max(0, Math.floor(hoursRemaining)),
        daysRemaining: Math.max(0, daysRemaining),
        isWithin48Hours,
        isExpired,
        docNumberOrNotes: d.notes
      });
    }
  });

  return alerts.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
}

/**
 * Triggers native browser Notification popup
 */
export function triggerBrowserNotification(
  title: string,
  options: {
    body: string;
    tag?: string;
    icon?: string;
    requireInteraction?: boolean;
    onClick?: () => void;
  }
): boolean {
  if (getBrowserNotificationPermission() !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      tag: options.tag || `pathway_ai_alert_${Date.now()}`,
      requireInteraction: options.requireInteraction ?? true,
      silent: false
    });

    if (options.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
      };
    }
    return true;
  } catch (err) {
    console.warn('Could not dispatch native browser Notification:', err);
    return false;
  }
}

// Track sent notifications in memory to prevent repetitive spam
const notifiedSet = new Set<string>();

export function hasBeenNotified(id: string): boolean {
  return notifiedSet.has(id);
}

export function markAsNotified(id: string): void {
  notifiedSet.add(id);
}

export function resetNotifiedCache(): void {
  notifiedSet.clear();
}
