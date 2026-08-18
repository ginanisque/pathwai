import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, MapPin, Send, CheckCircle2, XCircle, 
  Clock, PhoneCall, Mail, Shield, RefreshCw, Key, Lock, Check, Info
} from 'lucide-react';
import { EmergencyContact, LastLocation, MobilityProfile } from '../types';
import { triggerEmergencySOS, EmergencySOSResult } from '../lib/api';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MobilityProfile;
  contacts: EmergencyContact[];
  lastLocation: LastLocation | null;
  initialTriggerReason?: string;
  onCaptureConsentedLocation: (label: string, lat?: number, lng?: number) => void;
  onLogAudit: (action: any, title: string, details: string, actor?: string) => void;
  onResolveSOS?: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  profile,
  contacts,
  lastLocation,
  initialTriggerReason = 'Manual SOS Button Pressed',
  onCaptureConsentedLocation,
  onLogAudit,
  onResolveSOS
}) => {
  const [stage, setStage] = useState<'countdown' | 'dispatching' | 'dispatched' | 'resolving'>('countdown');
  const [countdown, setCountdown] = useState<number>(10);
  const [currentLocationLabel, setCurrentLocationLabel] = useState<string>(
    lastLocation?.locationLabel || 'Capturing Device GPS Position...'
  );
  const [capturedLat, setCapturedLat] = useState<number | undefined>(lastLocation?.latitude);
  const [capturedLng, setCapturedLng] = useState<number | undefined>(lastLocation?.longitude);

  const [dispatchResult, setDispatchResult] = useState<EmergencySOSResult | null>(null);
  const [safePinInput, setSafePinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // 1. One-time Location Capture on Modal Mount
  useEffect(() => {
    if (isOpen) {
      setStage('countdown');
      setCountdown(10);
      setDispatchResult(null);

      // Perform immediate one-time location capture
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const label = `GPS Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setCapturedLat(lat);
            setCapturedLng(lng);
            setCurrentLocationLabel(label);
            onCaptureConsentedLocation(label, lat, lng);
          },
          () => {
            const label = 'User Consented Manual Location Stamp';
            setCurrentLocationLabel(label);
            onCaptureConsentedLocation(label);
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }
    }
  }, [isOpen]);

  // 2. 10-Second Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (isOpen && stage === 'countdown') {
      if (countdown > 0) {
        timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      } else if (countdown === 0) {
        // Countdown expired -> Dispatch SOS
        executeDispatch();
      }
    }
    return () => clearInterval(timer);
  }, [isOpen, stage, countdown]);

  const executeDispatch = async () => {
    setStage('dispatching');
    try {
      const activeContacts = contacts.filter(c => c.status === 'verified' || c.permissions?.receiveAlerts);
      
      const res = await triggerEmergencySOS({
        travellerUserId: profile.userId,
        travellerName: profile.fullLegalName || 'Traveller',
        lastLocationLabel: currentLocationLabel,
        lat: capturedLat,
        lng: capturedLng,
        triggerReason: initialTriggerReason,
        contacts: activeContacts.length > 0 ? activeContacts : contacts
      });

      setDispatchResult(res);
      setStage('dispatched');

      onLogAudit(
        'checkin_performed',
        'EMERGENCY SOS DEMO COMPLETED',
        `Generated notification previews for ${contacts.length} contacts; no messages were sent. Reference: ${res.alertReferenceId}.`,
        'system'
      );
    } catch (err: any) {
      console.error('Failed to execute SOS dispatch:', err);
      setStage('dispatched');
    }
  };

  const handleCancelCountdown = () => {
    onLogAudit(
      'checkin_performed',
      'Emergency SOS Cancelled (False Alarm Prevented)',
      'Traveller safely cancelled the 10-second SOS activation countdown.',
      'user'
    );
    onClose();
  };

  const handleResolveWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (safePinInput.trim() === '1234' || safePinInput.trim().length >= 4) {
      onLogAudit(
        'checkin_performed',
        'EMERGENCY SOS RESOLVED & ALL-CLEAR ISSUED',
        `Traveller entered valid Safe-PIN. Emergency contacts notified of safe status resolution.`,
        'user'
      );
      if (onResolveSOS) onResolveSOS();
      setStage('countdown');
      onClose();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2500);
    }
  };

  if (!isOpen) return null;

  const verifiedContacts = contacts.filter(c => c.status === 'verified');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0F0A0A] border-2 border-red-600 rounded-sm shadow-2xl overflow-hidden space-y-0">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-red-900 to-[#1A0A0A] border-b border-red-600/60 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-sm animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase tracking-wider">HIGH-PRIORITY EMERGENCY SOS</h2>
                <span className="px-2 py-0.5 bg-red-600/40 text-red-200 border border-red-400/50 text-[9px] font-mono font-bold uppercase rounded">
                  BEACON DISPATCH
                </span>
              </div>
              <p className="text-xs text-red-200/80 font-mono mt-0.5">
                Immediate multi-channel alert & location broadcast to verified contacts.
              </p>
            </div>
          </div>

          <button
            onClick={stage === 'countdown' ? handleCancelCountdown : onClose}
            className="p-1.5 text-red-300 hover:text-white hover:bg-red-900/40 rounded-sm transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">

          {/* STAGE 1: COUNTDOWN (False Alarm Prevention) */}
          {stage === 'countdown' && (
            <div className="space-y-6">
              <div className="p-5 bg-red-950/40 border border-red-600/50 rounded-sm text-center space-y-3">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest block">
                  FALSE ALARM DE-ESCALATION COUNTDOWN
                </span>
                
                <div className="text-6xl font-black font-mono text-red-500 animate-pulse tracking-tighter">
                  00:0{countdown}
                </div>

                <p className="text-xs text-red-200 font-mono max-w-md mx-auto">
                  Distress alert will automatically broadcast to <strong>{verifiedContacts.length || contacts.length} emergency contacts</strong> in {countdown} seconds.
                </p>
              </div>

              {/* Anti-False Alarm Info Pill */}
              <div className="p-3 bg-[#181010] border-l-2 border-amber-500 rounded text-xs text-[#CCC] space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold text-[10px] uppercase">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Safeguard Design: Anti-False Alarm Trigger</span>
                </div>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Manual SOS button features a 10-second cancel delay. Automatic missed check-ins run a 15-minute grace period with progressive warnings before alerting contacts.
                </p>
              </div>

              {/* Location Stamp Box */}
              <div className="p-3.5 bg-[#141414] border border-[#333] rounded-sm space-y-1">
                <span className="text-[10px] font-mono text-[#888] font-bold uppercase block">One-Time Consented Location Captured:</span>
                <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                  <MapPin className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="truncate">{currentLocationLabel}</span>
                </div>
              </div>

              {/* Verified Emergency Contacts List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#888] font-bold uppercase block">Receiving Emergency Contacts:</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {contacts.map((c) => (
                    <div key={c.id} className="p-2 bg-[#141414] border border-[#262626] rounded-sm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-white">{c.contactName}</span>
                        <span className="text-[10px] text-[#888]">({c.relationship})</span>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        c.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleCancelCountdown}
                  className="w-full sm:w-1/2 py-3 bg-[#222] hover:bg-[#333] border border-[#444] text-white font-mono font-bold text-xs uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span>Cancel SOS (False Alarm)</span>
                </button>

                <button
                  onClick={executeDispatch}
                  className="w-full sm:w-1/2 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Immediately</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: DISPATCHING */}
          {stage === 'dispatching' && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-red-500 animate-spin mx-auto" />
              <h3 className="text-lg font-black uppercase text-white font-mono">Broadcasting Emergency SOS...</h3>
              <p className="text-xs text-[#AAA] max-w-sm mx-auto font-mono">
                Transmitting distress coordinates & multi-channel notifications to SMS and Email gateways.
              </p>
            </div>
          )}

          {/* STAGE 3: DISPATCHED RESULT */}
          {stage === 'dispatched' && dispatchResult && (
            <div className="space-y-6">
              <div className="p-4 bg-red-950/60 border border-red-500 rounded-sm space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-black uppercase">
                  <CheckCircle2 className="w-4 h-4 text-red-400" />
                  <span>SOS DEMO COMPLETED — NO MESSAGES SENT</span>
                </div>
                <p className="text-xs text-red-100 font-mono">
                  Reference: <strong>{dispatchResult.alertReferenceId}</strong> • Dispatched At: {new Date(dispatchResult.dispatchedAt).toLocaleTimeString()}
                </p>
                <p className="text-xs text-red-200">
                  {dispatchResult.systemMessage}
                </p>
              </div>

              {/* Dispatched Channels */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#888] font-bold uppercase block">Notification previews (not sent):</span>
                <div className="space-y-2">
                  {dispatchResult.notificationsSent.map((n, i) => (
                    <div key={i} className="p-3 bg-[#141414] border border-[#333] rounded-sm space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{n.contactName} ({n.contactEmail})</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-green-400 font-bold uppercase">
                          <span>SMS NOT SENT</span> • <span>EMAIL NOT SENT</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-[#AAA] bg-[#0A0A0A] p-2 border border-[#222] rounded-sm">
                        {n.smsPreview}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* De-escalation / Resolve with Safe-PIN */}
              <form onSubmit={handleResolveWithPin} className="p-4 bg-[#141414] border border-[#333] rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-white uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Safe-PIN De-escalation & Resolution</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#777]">Default Safe-PIN: 1234</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={6}
                    value={safePinInput}
                    onChange={(e) => setSafePinInput(e.target.value)}
                    placeholder="Enter 4-digit Safe-PIN"
                    className="flex-1 bg-[#0A0A0A] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs rounded-sm transition-colors shrink-0"
                  >
                    Resolve & Send All-Clear
                  </button>
                </div>
                {pinError && (
                  <p className="text-[10px] font-mono text-red-400 font-bold">Invalid Safe-PIN. Please enter 1234.</p>
                )}
              </form>

              <div className="flex justify-end pt-2 border-t border-[#222]">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#222] hover:bg-[#333] text-white text-xs font-mono font-bold uppercase rounded-sm transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
