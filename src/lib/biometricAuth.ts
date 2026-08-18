// Web Authentication API (WebAuthn / Passkeys / Biometrics) Helper Service
export interface BiometricAuthResult {
  success: boolean;
  methodUsed: 'webauthn_passkey' | 'biometric_scan' | 'pin_fallback';
  error?: string;
}

export class BiometricAuthService {
  private static STORAGE_KEY_PIN = 'pathway_vault_pin_v1';

  /**
   * Check if WebAuthn / Platform Authenticator (Touch ID, Face ID, Windows Hello) is available
   */
  public static async isBiometricsAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Trigger native WebAuthn biometric prompt (navigator.credentials.get / create)
   */
  public static async authenticateWithWebAuthn(): Promise<BiometricAuthResult> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return { success: false, methodUsed: 'webauthn_passkey', error: 'WebAuthn API not supported on this browser' };
    }

    try {
      // Challenge buffer
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const creationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: { name: 'PathWAI Offline Mobility Vault', id: window.location.hostname },
          user: {
            id: userId,
            name: 'traveller@pathwayai.app',
            displayName: 'PathWAI Traveller'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Touch ID / Face ID / Windows Hello
            userVerification: 'preferred'
          },
          timeout: 60000
        }
      };

      const credential = await navigator.credentials.create(creationOptions);
      if (credential) {
        return { success: true, methodUsed: 'webauthn_passkey' };
      }
      return { success: false, methodUsed: 'webauthn_passkey', error: 'Biometric verification returned null' };
    } catch (err: any) {
      console.warn('[BiometricAuth] WebAuthn native call result/fallback:', err);
      return {
        success: false,
        methodUsed: 'webauthn_passkey',
        error: err.name === 'NotAllowedError' ? 'Biometric scan was canceled by user.' : err.message || 'WebAuthn hardware prompt unavailable'
      };
    }
  }

  /**
   * Get set vault PIN or fallback default '1234'
   */
  public static getVaultPin(): string {
    if (typeof window === 'undefined') return '1234';
    return localStorage.getItem(this.STORAGE_KEY_PIN) || '1234';
  }

  /**
   * Update vault PIN
   */
  public static setVaultPin(newPin: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY_PIN, newPin);
    }
  }

  /**
   * Verify PIN
   */
  public static verifyPin(pin: string): boolean {
    return pin === this.getVaultPin();
  }
}
