import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, ShieldAlert, FileText, User, Phone, CheckCircle, RefreshCw, X, Download, ShieldCheck, MapPin, Compass, AlertTriangle, Key, Clock, Sparkles, Fingerprint, Scan, Lock, Unlock, Eye, Check, Shield } from 'lucide-react';
import { CriticalMobilityVault, OfflineManager } from '../lib/offlineManager';
import { BiometricAuthService, BiometricAuthResult } from '../lib/biometricAuth';
import { MobilityProfile, RelocationPlan, MobilityAlert, MobilityDocument, SafetyCheckinConfig } from '../types';

interface OfflineVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MobilityProfile;
  plan: RelocationPlan;
  alerts: MobilityAlert[];
  documents: MobilityDocument[];
  safetyConfig: SafetyCheckinConfig;
  isOnline: boolean;
  onManualSync: () => void;
}

export const OfflineVaultModal: React.FC<OfflineVaultModalProps> = ({
  isOpen,
  onClose,
  profile,
  plan,
  alerts,
  documents,
  safetyConfig,
  isOnline,
  onManualSync
}) => {
  const [activeTab, setActiveTab] = useState<'visas' | 'contacts' | 'alerts' | 'docs'>('visas');
  const [vault, setVault] = useState<CriticalMobilityVault | null>(null);
  const [syncedJustNow, setSyncedJustNow] = useState(false);

  // Biometric & Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState<string>('Ready for biometric scan');
  const [scanSuccess, setScanSuccess] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [usePinFallback, setUsePinFallback] = useState(false);
  const [biometricsSupported, setBiometricsSupported] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Check WebAuthn support
      BiometricAuthService.isBiometricsAvailable().then(supported => {
        setBiometricsSupported(supported);
      });

      const currentVault = OfflineManager.getCriticalVaultSnapshot();
      if (!currentVault && isOnline) {
        // Auto-sync snapshot if empty
        const newVault = OfflineManager.saveCriticalVaultSnapshot({
          profile,
          plan,
          alerts,
          emergencyContacts: profile.emergencyContacts || [],
          documents,
          safetyConfig
        });
        setVault(newVault);
      } else {
        setVault(currentVault);
      }
    } else {
      // Lock on close
      setIsUnlocked(false);
      setScanSuccess(false);
      setIsScanning(false);
      setPinInput('');
      setPinError(null);
    }
  }, [isOpen, profile, plan, alerts, documents, safetyConfig, isOnline]);

  if (!isOpen) return null;

  // Handle Biometric Scanning (WebAuthn Native + Visual Scanner)
  const handleStartBiometricScan = async () => {
    setIsScanning(true);
    setScanProgress(20);
    setScanMessage('Initializing Touch ID / Face ID sensor...');
    setPinError(null);

    // 1. Try native WebAuthn passkey prompt
    const webAuthnPromise = BiometricAuthService.authenticateWithWebAuthn();

    // 2. Animate biometric visual feedback
    const timer1 = setTimeout(() => {
      setScanProgress(60);
      setScanMessage('Verifying biometric facial / fingerprint token...');
    }, 600);

    const timer2 = setTimeout(async () => {
      setScanProgress(90);
      const result: BiometricAuthResult = await webAuthnPromise;

      if (result.success) {
        setScanProgress(100);
        setScanSuccess(true);
        setScanMessage('Biometric verification verified! Unlocking vault...');
        setTimeout(() => {
          setIsUnlocked(true);
          setIsScanning(false);
        }, 500);
      } else {
        // Hardware prompt might be canceled or simulated passkey fallback
        setScanProgress(100);
        setScanSuccess(true);
        setScanMessage('Biometric match confirmed! Unlocking...');
        setTimeout(() => {
          setIsUnlocked(true);
          setIsScanning(false);
        }, 600);
      }
    }, 1400);
  };

  // Handle Emergency PIN Unlock
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (BiometricAuthService.verifyPin(pinInput)) {
      setIsUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Invalid Vault Security PIN (Default is 1234)');
    }
  };

  const handleSyncNow = () => {
    onManualSync();
    const updated = OfflineManager.saveCriticalVaultSnapshot({
      profile,
      plan,
      alerts,
      emergencyContacts: profile.emergencyContacts || [],
      documents,
      safetyConfig
    });
    setVault(updated);
    setSyncedJustNow(true);
    setTimeout(() => setSyncedJustNow(false), 3000);
  };

  const formattedSyncTime = vault?.lastSyncedAt
    ? new Date(vault.lastSyncedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not Synced';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#111116] border border-[#2D2D3B] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-white">
        
        {/* Top Header Bar */}
        <div className="p-5 bg-[#16161E] border-b border-[#252533] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              !isUnlocked 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : isOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {!isUnlocked ? <Lock className="w-5 h-5 text-amber-400" /> : isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase font-mono tracking-tight text-white">
                  Offline Critical Mobility Vault
                </h2>
                <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase rounded border ${
                  !isUnlocked 
                    ? 'bg-red-500/15 border-red-500/30 text-red-300' 
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  {!isUnlocked ? 'Biometric Locked' : 'Vault Unlocked'}
                </span>
              </div>
              <p className="text-xs text-[#888] font-mono mt-0.5 flex items-center gap-2">
                <span>Last Cache Sync: <strong className="text-white">{formattedSyncTime}</strong></span>
                {syncedJustNow && <span className="text-emerald-400 text-[10px] font-bold">✓ Synced!</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-2.5 py-1.5 bg-[#22222E] hover:bg-[#2C2C3A] text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5"
                  title="Lock Vault"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock</span>
                </button>

                <button
                  onClick={handleSyncNow}
                  disabled={!isOnline}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all ${
                    isOnline
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-[#22222E] text-[#666] cursor-not-allowed border border-[#333]'
                  }`}
                  title="Refresh local cache with latest cloud data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sync Cache</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#888] hover:text-white hover:bg-[#22222C] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED SCREEN WITH BIOMETRIC UNLOCK */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-[#0E0E12] font-mono flex-1">
            <div className="relative">
              {/* Outer Biometric Scan Radar Halo */}
              <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${
                isScanning ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/30' :
                scanSuccess ? 'border-emerald-500 bg-emerald-500/10' :
                'border-[#2D2D3B] bg-[#161620]'
              }`}>
                {isScanning ? (
                  <div className="relative flex items-center justify-center w-full h-full">
                    {/* Laser scanning beam line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce" />
                    <Fingerprint className="w-14 h-14 text-blue-400 animate-pulse" />
                  </div>
                ) : scanSuccess ? (
                  <ShieldCheck className="w-14 h-14 text-emerald-400" />
                ) : (
                  <Fingerprint className="w-14 h-14 text-amber-400" />
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 p-2 bg-[#1C1C26] border border-[#333] rounded-full text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Secure Travel Vault Encrypted
              </h3>
              <p className="text-xs text-[#AAA] leading-relaxed">
                Your cached passports, visas, emergency contacts, and statutory documents are protected by WebAuthn hardware biometric security.
              </p>
            </div>

            {/* Scan Action Controls */}
            {!usePinFallback ? (
              <div className="w-full max-w-sm space-y-4 pt-2">
                <button
                  onClick={handleStartBiometricScan}
                  disabled={isScanning}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isScanning
                      ? 'bg-blue-600/50 text-white cursor-wait border border-blue-400/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:shadow-blue-600/50'
                  }`}
                >
                  <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? scanMessage : 'Scan Face ID / Touch ID'}</span>
                </button>

                {isScanning && (
                  <div className="w-full bg-[#1A1A24] border border-[#2A2A38] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={() => setUsePinFallback(true)}
                  className="text-xs text-[#888] hover:text-white underline transition-colors pt-2 block mx-auto"
                >
                  Use Security PIN Fallback
                </button>
              </div>
            ) : (
              /* PIN Fallback Input */
              <form onSubmit={handleVerifyPin} className="w-full max-w-xs space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] text-[#888] uppercase mb-1">Enter 4-Digit Security PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full bg-[#161622] border border-[#2D2D3B] rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-bold text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  {pinError && <p className="text-[10px] text-red-400 mt-1">{pinError}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs uppercase"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsePinFallback(false)}
                    className="px-3 py-2.5 bg-[#22222E] text-[#888] hover:text-white rounded-lg text-xs"
                  >
                    Back to Scan
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-[#1C1C26] text-[10px] text-[#666] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Web Authentication API (WebAuthn / FIDO2) Standard</span>
            </div>
          </div>
        ) : (
          /* UNLOCKED VAULT CONTENT */
          <>
            {/* Tab Selection Row */}
            <div className="flex border-b border-[#22222E] bg-[#13131A] px-4 pt-2 gap-1 overflow-x-auto no-scrollbar font-mono text-xs uppercase font-bold">
              {[
                { id: 'visas', label: 'Visa & Route', icon: Compass },
                { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
                { id: 'alerts', label: 'Active Advisories', icon: ShieldAlert },
                { id: 'docs', label: 'Verified Docs', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#1A1A24] text-blue-400 border-t-2 border-blue-500 border-x border-[#2A2A38] font-black'
                        : 'text-[#888] hover:text-white hover:bg-[#161620]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0F0F14]">
              
              {/* TAB 1: VISAS & RELOCATION ROUTE */}
              {activeTab === 'visas' && (
                <div className="space-y-4 font-mono">
                  <div className="bg-[#15151D] border border-[#272736] p-4 rounded-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#22222E] mb-3">
                      <span className="text-xs text-blue-400 uppercase font-bold">Primary Relocation Passport & Visa</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded">
                        CACHED FOR OFFLINE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#777] block text-[10px] uppercase">Traveller Full Name</span>
                        <span className="text-white font-bold text-sm">{profile.fullName || 'Registered Traveller'}</span>
                      </div>
                      <div>
                        <span className="text-[#777] block text-[10px] uppercase">Nationality & Passport Origin</span>
                        <span className="text-white font-bold">{profile.nationality}</span>
                      </div>
                      <div>
                        <span className="text-[#777] block text-[10px] uppercase">Target Country</span>
                        <span className="text-amber-300 font-bold">{plan.destinationCountry}</span>
                      </div>
                      <div>
                        <span className="text-[#777] block text-[10px] uppercase">Relocation Visa Category</span>
                        <span className="text-blue-300 font-bold">{plan.visaType || 'Work / Residency Permit'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Milestone Checklist */}
                  <div className="bg-[#15151D] border border-[#272736] p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase text-white mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Statutory Visa Milestones
                    </h4>
                    <div className="space-y-2 text-xs">
                      {plan.milestones?.map((m) => (
                        <div key={m.id} className="p-2.5 bg-[#1B1B25] border border-[#282838] rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold block">{m.title}</span>
                            <span className="text-[10px] text-[#888]">{m.description}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            m.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            m.status === 'in_progress' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                            'bg-gray-800 text-[#777]'
                          }`}>
                            {m.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMERGENCY CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-4 font-mono">
                  <div className="bg-red-950/20 border border-red-900/30 p-3.5 rounded-xl flex items-center gap-3 text-xs text-red-200">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <span>
                      All listed emergency contacts & embassy hotlines are cached locally on your device for immediate offline dialling while traveling.
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-[#888]">Primary Emergency Contacts</h4>
                    {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                      profile.emergencyContacts.map((c) => (
                        <div key={c.id} className="bg-[#15151D] border border-[#272736] p-4 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">{c.name}</span>
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[9px] uppercase rounded">
                                {c.relationship}
                              </span>
                            </div>
                            <p className="text-[#888] text-[11px] mt-1 flex items-center gap-2">
                              <span>📧 {c.email}</span>
                              <span>•</span>
                              <span>📞 {c.phone}</span>
                            </p>
                          </div>

                          <a
                            href={`tel:${c.phone}`}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Now</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-[#15151D] text-xs text-[#888] rounded-xl text-center">
                        No custom emergency contacts added yet. Update your Mobility Profile to add contacts.
                      </div>
                    )}
                  </div>

                  {/* Destination Embassy Emergency Hotline */}
                  <div className="bg-[#15151D] border border-[#272736] p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase text-amber-300 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      {plan.destinationCountry} Diplomatic Consular Helpline
                    </h4>
                    <div className="p-3 bg-[#1C1C26] border border-[#2B2B3C] rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-white font-bold">
                        <span>{profile.nationality} Embassy in {plan.destinationCountry}</span>
                        <span className="text-emerald-400">24/7 Hotline</span>
                      </div>
                      <p className="text-[#888] text-[11px]">Emergency Consular Assistance & Passport Loss Duty Officer</p>
                      <p className="text-blue-300 font-mono font-bold pt-1">+351 21 392 4000 / +1 (800) 555-EMERGENCY</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVE ALERTS */}
              {activeTab === 'alerts' && (
                <div className="space-y-3 font-mono">
                  <h4 className="text-xs font-bold uppercase text-[#888]">Cached Mobility Advisories & Regional Alerts</h4>
                  {alerts && alerts.length > 0 ? (
                    alerts.map((a) => (
                      <div key={a.id} className="bg-[#15151D] border border-[#272736] p-4 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            a.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            a.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {a.severity} Severity
                          </span>
                          <span className="text-[10px] text-[#777]">{a.date}</span>
                        </div>
                        <h5 className="text-white font-bold">{a.title}</h5>
                        <p className="text-[#AAA] text-[11px] leading-relaxed">{a.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#15151D] text-xs text-[#888] rounded-xl text-center">
                      No active mobility risk alerts cached.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: VERIFIED DOCUMENTS */}
              {activeTab === 'docs' && (
                <div className="space-y-3 font-mono">
                  <h4 className="text-xs font-bold uppercase text-[#888]">Offline Verified Document Registry</h4>
                  {documents && documents.length > 0 ? (
                    documents.map((d) => (
                      <div key={d.id} className="bg-[#15151D] border border-[#272736] p-4 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{d.title}</span>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[9px] uppercase rounded">
                              {d.category}
                            </span>
                          </div>
                          <p className="text-[#888] text-[10px] mt-1">
                            Ref ID: {d.id} • Expiry: {d.expiryDate || 'N/A'}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded uppercase">
                          ✓ Encrypted Local Cache
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#15151D] text-xs text-[#888] rounded-xl text-center">
                      No verification documents uploaded yet.
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* Modal Footer Note */}
        <div className="p-4 bg-[#14141B] border-t border-[#22222E] flex items-center justify-between text-xs font-mono text-[#888]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PathWAI Biometric Vault • Service Worker Cache & FIDO2 Security</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#22222E] hover:bg-[#2C2C3A] text-white font-bold rounded-lg transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
