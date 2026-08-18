import { MobilityProfile, RelocationPlan, MobilityAlert, EmergencyContact, MobilityDocument, SafetyCheckinConfig } from '../types';

export interface CriticalMobilityVault {
  lastSyncedAt: string;
  profile: MobilityProfile;
  plan: RelocationPlan;
  alerts: MobilityAlert[];
  emergencyContacts: EmergencyContact[];
  documents: MobilityDocument[];
  safetyConfig: SafetyCheckinConfig;
  emergencyPin?: string;
}

const OFFLINE_VAULT_KEY = 'pathway_offline_mobility_vault_v1';

/**
 * Service Worker Registration & Offline Manager
 */
export class OfflineManager {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  /**
   * Register the Service Worker
   */
  public static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[OfflineManager] Service workers not supported in this browser environment.');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      this.swRegistration = registration;
      console.log('[OfflineManager] Service Worker registered successfully with scope:', registration.scope);

      // Listen for SW updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[OfflineManager] New Service Worker content available. Ready for offline use.');
            }
          };
        }
      };

      return registration;
    } catch (error) {
      console.warn('[OfflineManager] Service Worker registration error:', error);
      return null;
    }
  }

  /**
   * Save Critical Mobility Snapshot locally and dispatch to Service Worker cache
   */
  public static saveCriticalVaultSnapshot(vaultData: Omit<CriticalMobilityVault, 'lastSyncedAt'>): CriticalMobilityVault {
    const fullVault: CriticalMobilityVault = {
      ...vaultData,
      lastSyncedAt: new Date().toISOString()
    };

    try {
      // 1. Save to LocalStorage fallback
      localStorage.setItem(OFFLINE_VAULT_KEY, JSON.stringify(fullVault));

      // 2. Dispatch to Service Worker for CacheStorage
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CRITICAL_MOBILITY_DATA',
          payload: fullVault
        });
      }
    } catch (err) {
      console.error('[OfflineManager] Error writing offline vault snapshot:', err);
    }

    return fullVault;
  }

  /**
   * Retrieve cached Critical Mobility Vault
   */
  public static getCriticalVaultSnapshot(): CriticalMobilityVault | null {
    try {
      const raw = localStorage.getItem(OFFLINE_VAULT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CriticalMobilityVault;
    } catch (err) {
      console.error('[OfflineManager] Failed to read offline vault:', err);
      return null;
    }
  }

  /**
   * Check if device is currently online
   */
  public static isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }
}
