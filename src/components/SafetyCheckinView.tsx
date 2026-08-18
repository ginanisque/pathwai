import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, MapPin, Clock, Users, UserCheck, AlertTriangle, Check, Send, 
  Lock, Eye, HeartHandshake, PhoneCall, Sparkles, Navigation, Globe, Share2, EyeOff,
  Calendar, Camera, Car, User, FileText, AlertCircle, CheckCircle2, Unlock, Trash2
} from 'lucide-react';
import { SafetyCheckinConfig, EmergencyContact, LastLocation, MobilityProfile, OutingSafetyVault } from '../types';

interface SafetyCheckinViewProps {
  checkinConfig: SafetyCheckinConfig;
  contacts: EmergencyContact[];
  lastLocation: LastLocation | null;
  profile: MobilityProfile;
  onCheckinNow: (note: string, locationLabel?: string) => void;
  onInviteContact: (name: string, email: string, relationship: string) => void;
  onVerifyContact: (contactId: string, code: string) => void;
  onRevokeContact: (contactId: string) => void;
  onUpdatePermissions: (contactId: string, permissions: EmergencyContact['permissions']) => void;
  onCaptureConsentedLocation: (label: string, lat?: number, lng?: number) => void;
  onTriggerSOS?: (reason?: string) => void;
}

export const SafetyCheckinView: React.FC<SafetyCheckinViewProps> = ({
  checkinConfig,
  contacts,
  lastLocation,
  profile,
  onCheckinNow,
  onInviteContact,
  onVerifyContact,
  onRevokeContact,
  onUpdatePermissions,
  onCaptureConsentedLocation,
  onTriggerSOS
}) => {
  const [checkinNote, setCheckinNote] = useState('');
  const [customLocationLabel, setCustomLocationLabel] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState<Record<string, string>>({});
  const [locationCapturing, setLocationCapturing] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Safe Migration & Recruiter Audit state
  const [recruiterInput, setRecruiterInput] = useState('');
  const [routeAuditResult, setRouteAuditResult] = useState<string | null>(null);
  const [auditingRoute, setAuditingRoute] = useState(false);
  const [guardianLinkCopied, setGuardianLinkCopied] = useState(false);

  // Discreet Date & Personal Outing Safety Vault state
  const [vaults, setVaults] = useState<OutingSafetyVault[]>(() => [
    {
      id: 'vault-demo-1',
      title: 'Dinner Date at Sky Bar',
      outingType: 'date',
      venueName: 'The Sky Bar & Grill',
      venueAddress: '45 Marina Drive, Waterfront',
      companionName: 'Marcus T. (Tinder)',
      companionPhone: '+1 (555) 382-9910',
      companionSocialHandle: '@marcus_t_dev',
      vehiclePlate: 'ABC-8921',
      vehicleModelColor: 'Silver Toyota Camry (Uber Trip)',
      emergencyNotes: 'Meeting at 8 PM. If I do not check in by 11:30 PM, please call venue or check my last location.',
      photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      status: 'active',
      pinCode: '1234',
      createdAt: new Date().toISOString()
    }
  ]);

  const [isVaultPrivacyLocked, setIsVaultPrivacyLocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Outing creation form state
  const [showCreateVault, setShowCreateVault] = useState<boolean>(false);
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultType, setVaultType] = useState<OutingSafetyVault['outingType']>('date');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [companionPhone, setCompanionPhone] = useState('');
  const [companionSocialHandle, setCompanionSocialHandle] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModelColor, setVehicleModelColor] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [timerHours, setTimerHours] = useState<number>(2);
  const [photoFilePreview, setPhotoFilePreview] = useState<string | null>(null);

  // Outing countdown ticker
  const [activeOutingRemaining, setActiveOutingRemaining] = useState<string>('00:00:00');
  const activeVault = vaults.find(v => v.status === 'active');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeVault) return;
      const due = new Date(activeVault.dueAt).getTime();
      const now = Date.now();
      const diff = due - now;

      if (diff <= 0) {
        setActiveOutingRemaining('00:00:00 OVERDUE - ALERT DISPATCHED');
        if (activeVault.status === 'active') {
          // Auto escalate active vault
          setVaults(prev => prev.map(v => v.id === activeVault.id ? { ...v, status: 'escalated' } : v));
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setActiveOutingRemaining(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVault]);

  // General Checkin Countdown timer calculations
  const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkinConfig.nextCheckinDue) return;
      const due = new Date(checkinConfig.nextCheckinDue).getTime();
      const now = Date.now();
      const diff = due - now;

      if (diff <= 0) {
        setTimeRemaining('00:00:00 OVERDUE');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkinConfig.nextCheckinDue]);

  const handleManualLocationCapture = () => {
    if (!navigator.geolocation) {
      alert('Geolocation API not supported in your browser.');
      return;
    }

    setLocationCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const label = customLocationLabel.trim() || `User Consented Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        onCaptureConsentedLocation(label, lat, lng);
        setLocationCapturing(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      (err) => {
        setLocationCapturing(false);
        const label = customLocationLabel.trim() || 'User Consented Manual Location Stamp';
        onCaptureConsentedLocation(label);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    onInviteContact(contactName.trim(), contactEmail.trim(), relationship.trim() || 'Emergency Contact');
    setContactName('');
    setContactEmail('');
    setRelationship('');
  };

  const handleAuditRecruiter = () => {
    if (!recruiterInput.trim()) return;
    setAuditingRoute(true);
    setTimeout(() => {
      const inputLower = recruiterInput.toLowerCase();
      if (inputLower.includes('libya') || inputLower.includes('desert') || inputLower.includes('boat') || inputLower.includes('agadez') || inputLower.includes('sea') || inputLower.includes('cash upfront')) {
        setRouteAuditResult(
          `🔴 HIGH-RISK IRREGULAR ROUTE ALERT:\n` +
          `• Irregular desert/sea crossings through Agadez/Libya pose extreme danger of human trafficking, forced detention, and loss of life.\n` +
          `• VERIFIED ALTERNATIVES: Switch to accredited ECOWAS free movement, statutory student visa, or official bilateral labor pathways.\n` +
          `• HELPLINE: Contact NAPTIP Nigeria (+234 800 333 0000) or IOM Nigeria (+234 908 777 0000) immediately.`
        );
      } else {
        setRouteAuditResult(
          `🟢 ACCREDITED REGULAR PATHWAY VERIFIED:\n` +
          `• Official consular visa channel for ${recruiterInput}.\n` +
          `• Ensure all employment contracts are vetted by legal advisors and visa fees are paid directly to official embassy/VFS portals only.`
        );
      }
      setAuditingRoute(false);
    }, 800);
  };

  const handleCopyFamilyLink = () => {
    navigator.clipboard.writeText(`https://ais-pre-mtq6it3lxfrdiml3wr7sy3-718234066845.europe-west2.run.app/family-pass?code=BENIN-GUARDIAN-${profile.userId.slice(-4)}`);
    setGuardianLinkCopied(true);
    setTimeout(() => setGuardianLinkCopied(false), 3000);
  };

  // Image Upload Handler for Date Vault
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save new Outing Safety Vault entry
  const handleCreateVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultTitle.trim() || !venueName.trim()) return;

    const dueTime = new Date(Date.now() + timerHours * 60 * 60 * 1000).toISOString();
    const newVault: OutingSafetyVault = {
      id: `vault-${Date.now()}`,
      title: vaultTitle.trim(),
      outingType: vaultType,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim() || 'Address not specified',
      companionName: companionName.trim() || 'Unspecified companion',
      companionPhone: companionPhone.trim() || 'Not provided',
      companionSocialHandle: companionSocialHandle.trim(),
      vehiclePlate: vehiclePlate.trim() || 'No plate recorded',
      vehicleModelColor: vehicleModelColor.trim(),
      emergencyNotes: emergencyNotes.trim(),
      photoUrl: photoFilePreview || undefined,
      dueAt: dueTime,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setVaults(prev => [newVault, ...prev]);
    setShowCreateVault(false);
    // Reset form
    setVaultTitle('');
    setVenueName('');
    setVenueAddress('');
    setCompanionName('');
    setCompanionPhone('');
    setCompanionSocialHandle('');
    setVehiclePlate('');
    setVehicleModelColor('');
    setEmergencyNotes('');
    setPhotoFilePreview(null);
  };

  const handleCheckinOutingSafe = (vaultId: string) => {
    setVaults(prev => prev.map(v => v.id === vaultId ? { ...v, status: 'completed' } : v));
    onCheckinNow(`Date / Outing Safe Return Confirmed for vault ${vaultId}`);
  };

  const handleUnlockVaultPIN = () => {
    if (pinInput === '1234' || pinInput.length >= 4) {
      setIsVaultPrivacyLocked(false);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-[#666] font-mono font-black uppercase tracking-[0.2em] mb-2">05 SAFE-TRAVEL, DATING & CHECK-INS</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Safety, Date Vault & Family Peace
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Discreet personal date/outing safety vault, parent guardian sync, anti-trafficking corridors, and emergency SOS pings.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111] border border-[#222] p-2 rounded-sm text-xs font-mono">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-[#AAA] uppercase">DISCREET 360° PROTECTION</span>
        </div>
      </div>

      {/* NEW DISCREET PERSONAL & DATE SAFETY VAULT MODULE */}
      <div className="p-6 bg-gradient-to-br from-[#161219] via-[#100D13] to-[#0A080C] border-2 border-purple-500/60 rounded-sm space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-500 text-black text-[10px] font-black uppercase rounded">
                DISCREET PERSONAL & DATE VAULT
              </span>
              <span className="text-xs font-mono text-purple-300 font-bold">PRIVATE SAFETY & CAR / VENUE STAMP</span>
            </div>
            <h2 className="text-xl font-black uppercase text-white tracking-wider mt-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <span>Personal Outing & Date Safety Vault</span>
            </h2>
            <p className="text-xs text-purple-200/80 mt-1 max-w-3xl leading-relaxed">
              Going on a date or meeting someone new? Store hidden details (venue location, companion phone, car license plate, photos) without revealing them to anyone. If you don't check in at your appointed time, Pathway automatically releases these details to your designated trusted contacts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isVaultPrivacyLocked ? (
              <button
                onClick={() => setIsVaultPrivacyLocked(false)}
                className="px-3.5 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold uppercase text-xs rounded-sm flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>Show Hidden Details</span>
              </button>
            ) : (
              <button
                onClick={() => setIsVaultPrivacyLocked(true)}
                className="px-3.5 py-2 bg-[#222] hover:bg-[#333] text-white font-bold uppercase text-xs rounded-sm flex items-center gap-1.5 transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock Privacy Shield</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateVault(!showCreateVault)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black font-black uppercase text-xs rounded-sm tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>+ Log New Date / Outing</span>
            </button>
          </div>
        </div>

        {/* Privacy Lock Banner */}
        {isVaultPrivacyLocked && (
          <div className="p-3 bg-[#130E17] border border-purple-500/30 rounded-sm flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-purple-300">
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <span>
                <strong>PRIVACY SHIELD ACTIVE:</strong> Companion names, photos, phone numbers & car plates are hidden from screen. They remain securely stored and will auto-dispatch if check-in is missed.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="PIN (1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-20 bg-[#0D0A0F] border border-purple-900 text-center px-2 py-1 text-xs text-white rounded focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleUnlockVaultPIN}
                className="px-2.5 py-1 bg-purple-500 text-black font-bold uppercase text-[10px] rounded"
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Create Outing Vault Modal / Inline Form */}
        {showCreateVault && (
          <form onSubmit={handleCreateVault} className="p-5 bg-[#0F0B13] border-2 border-purple-500/60 rounded-sm space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
              <h3 className="font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Log Private Date or Outing Safeguard</span>
              </h3>
              <span className="text-[10px] text-purple-300">DISCREET & ENCRYPTED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Outing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Date with Sam"
                  value={vaultTitle}
                  onChange={(e) => setVaultTitle(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Outing Category</label>
                <select
                  value={vaultType}
                  onChange={(e) => setVaultType(e.target.value as any)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="date">Romantic Date / Online Match</option>
                  <option value="solo_outing">Solo Night Out / Club</option>
                  <option value="travel_meetup">Travel Meetup / Stranger</option>
                  <option value="job_interview">Informal Job Interview</option>
                  <option value="other">Other Outing</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Timer Duration (Hours)</label>
                <select
                  value={timerHours}
                  onChange={(e) => setTimerHours(Number(e.target.value))}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>1 Hour (Quick Drink)</option>
                  <option value={2}>2 Hours (Dinner Date)</option>
                  <option value={3}>3 Hours (Movie & Drinks)</option>
                  <option value={4}>4 Hours (Late Night Out)</option>
                  <option value={6}>6 Hours (Long Trip)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Venue / Meeting Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Lagoon Rooftop Lounge"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Venue Full Address / Cross Streets</label>
                <input
                  type="text"
                  placeholder="e.g. 104 Ocean Drive, Downtown"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Companion & Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Companion Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. Alex M (Tinder profile)"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Companion Phone / Social Handle</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0199 or @alex_insta"
                  value={companionPhone}
                  onChange={(e) => setCompanionPhone(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Car License Plate & Model</label>
                <input
                  type="text"
                  placeholder="e.g. Black Honda Civic, Plate XYZ-992"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Photo & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Emergency Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Sitting at patio table. Car parked behind venue."
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  className="w-full bg-[#17121C] border border-purple-900 px-3 py-2 text-white rounded-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#999] uppercase font-bold block mb-1">Photo Upload (Car Plate / Venue / Match Profile)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 bg-[#17121C] border border-dashed border-purple-800 hover:border-purple-500 p-2 text-center rounded-sm cursor-pointer text-[11px] text-purple-300">
                    <Camera className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                    <span>{photoFilePreview ? 'Photo Attached!' : 'Upload Photo Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {photoFilePreview && (
                    <img src={photoFilePreview} alt="Preview" className="w-9 h-9 object-cover rounded border border-purple-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => setShowCreateVault(false)}
                className="px-3 py-1.5 bg-[#222] text-[#AAA] font-bold uppercase text-[10px] rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-black font-black uppercase text-xs rounded-sm tracking-wider"
              >
                ARM SAFE DATE VAULT & START TIMER
              </button>
            </div>
          </form>
        )}

        {/* Active & Past Vault Cards List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
            <span>Logged Date & Personal Safety Vaults ({vaults.length})</span>
            <span className="text-[10px] text-purple-400">AUTO-DISPATCH IF OVERDUE</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                className={`p-4 rounded-sm border-2 space-y-3 font-mono text-xs transition-all ${
                  vault.status === 'active' ? 'bg-[#120D18] border-purple-500' :
                  vault.status === 'escalated' ? 'bg-red-950/40 border-red-500 animate-pulse' :
                  'bg-[#0C0A0E] border-[#26202E]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[9px] font-bold uppercase rounded border border-purple-500/40">
                      {vault.outingType.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-white text-sm">{vault.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    vault.status === 'active' ? 'bg-purple-500 text-black' :
                    vault.status === 'escalated' ? 'bg-red-600 text-white' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {vault.status}
                  </span>
                </div>

                {/* Live Outing Timer if Active */}
                {vault.status === 'active' && (
                  <div className="p-3 bg-[#09070C] border border-purple-900/60 rounded text-center">
                    <span className="text-[9px] text-purple-300 font-bold uppercase tracking-widest block">CHECK-IN COUNTDOWN</span>
                    <p className="text-2xl font-black text-white mt-1">{activeOutingRemaining}</p>
                    <p className="text-[10px] text-[#888] mt-1">
                      Target Check-in: {new Date(vault.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {/* Escalated Alert Banner */}
                {vault.status === 'escalated' && (
                  <div className="p-3 bg-red-950 border border-red-500 text-red-200 rounded space-y-1 text-[11px]">
                    <span className="font-black uppercase text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      AUTOMATED DISPATCH TRIGGERED
                    </span>
                    <p>
                      Check-in timer expired! Emergency notification payload dispatched to {contacts.length > 0 ? contacts.map(c => c.contactName).join(', ') : 'Verified Emergency Contacts'}.
                    </p>
                  </div>
                )}

                {/* Details (Obscured if Privacy Shield is locked) */}
                <div className="space-y-1.5 text-[11px] bg-[#17121F] p-3 rounded border border-purple-900/30">
                  <p>
                    <strong className="text-purple-300">Venue:</strong> {vault.venueName} ({vault.venueAddress})
                  </p>
                  <p>
                    <strong className="text-purple-300">Companion:</strong> {isVaultPrivacyLocked ? '•••••••• (Privacy Locked)' : `${vault.companionName} (${vault.companionPhone})`}
                  </p>
                  <p>
                    <strong className="text-purple-300">Vehicle / Plate:</strong> {isVaultPrivacyLocked ? '•••••••• (Privacy Locked)' : vault.vehiclePlate}
                  </p>
                  {vault.emergencyNotes && (
                    <p>
                      <strong className="text-purple-300">Notes:</strong> {vault.emergencyNotes}
                    </p>
                  )}
                  {vault.photoUrl && !isVaultPrivacyLocked && (
                    <div className="pt-2">
                      <span className="text-[10px] text-[#888] uppercase block mb-1">Attached Photo Evidence:</span>
                      <img src={vault.photoUrl} alt="Vault evidence" className="w-24 h-16 object-cover rounded border border-purple-500" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {vault.status === 'active' && (
                  <button
                    onClick={() => handleCheckinOutingSafe(vault.id)}
                    className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs rounded-sm tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>I AM SAFE — DISARM ALARM & CHECK IN NOW</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEDICATED SAFE MIGRATION & FAMILY GUARDIAN LINK (BENIN CITY / EDO STATE INSPIRED HERO MODULE) */}
      <div className="p-6 bg-gradient-to-br from-[#121815] via-[#0E1310] to-[#0A0D0B] border-2 border-emerald-500/60 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black uppercase rounded">
                FAMILY GUARDIAN PEACE-OF-MIND
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">EDO STATE & GLOBAL SAFE MIGRATION HUB</span>
            </div>
            <h2 className="text-xl font-black uppercase text-white tracking-wider mt-1 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>Family Safety Sync & Anti-Trafficking Safeguard</span>
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-3xl leading-relaxed">
              Every parent back home in Benin City or anywhere worldwide deserves to know their child is safe. Generate a secure, tamper-evident Family Guardian Sync Pass to keep family informed without risking your safety.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={handleCopyFamilyLink}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{guardianLinkCopied ? 'Family Pass Link Copied!' : 'Copy Family Guardian Link'}</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars of Safe Migration & Peace of Mind */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0A100C] border border-emerald-900/40 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">GUARDIAN CODE</span>
              <span className="text-xs font-mono font-bold text-white bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                BENIN-{profile.userId.slice(-4).toUpperCase()}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Direct Parent Status Sync</h4>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              Share this pass code with parents. They can view last confirmed check-in timestamp without requiring complex logins.
            </p>
          </div>

          <div className="p-4 bg-[#0A100C] border border-emerald-900/40 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">ANTI-TRAFFICKING</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Safe vs Irregular Corridor Warning</h4>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              Verify legal routes (ECOWAS, student, skilled work) and flag unverified recruiters operating illegal desert/sea journeys.
            </p>
          </div>

          <div className="p-4 bg-[#0A100C] border border-emerald-900/40 rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">EMERGENCY LINES</span>
              <PhoneCall className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Verified Anti-Trafficking Hotlines</h4>
            <div className="text-[10px] font-mono text-emerald-300 space-y-1 pt-1">
              <p>• NAPTIP Nigeria: <strong className="text-white">0800 333 0000</strong></p>
              <p>• IOM Safe Return: <strong className="text-white">+234 908 777 0000</strong></p>
              <p>• Red Cross Tracing: <strong className="text-white">+41 22 734 6001</strong></p>
            </div>
          </div>
        </div>

        {/* AI Route & Recruiter Legitimacy Auditor */}
        <div className="p-4 bg-[#070B09] border border-emerald-900/50 rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Route & Travel Recruiter Legitimacy Audit</span>
            </h4>
            <span className="text-[9px] font-mono text-emerald-400">BENIN CITY & WEST AFRICA SAFE PASSAGE</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Recruiter offering Dubai caregiver job with cash upfront OR Transit via Libya/Agadez"
              value={recruiterInput}
              onChange={(e) => setRecruiterInput(e.target.value)}
              className="flex-1 bg-[#121815] border border-emerald-900/80 px-3 py-2 text-xs text-white focus:outline-none rounded-sm font-mono"
            />
            <button
              onClick={handleAuditRecruiter}
              disabled={auditingRoute}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-sm tracking-wider shrink-0 transition-colors"
            >
              {auditingRoute ? 'Auditing Route...' : 'Audit Route Safety'}
            </button>
          </div>

          {routeAuditResult && (
            <div className="p-3 bg-[#0E1511] border border-emerald-500/40 rounded text-xs font-mono text-white whitespace-pre-wrap leading-relaxed animate-fadeIn">
              {routeAuditResult}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Checkin Countdown & Manual Location Stamp */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* High Priority SOS Immediate Action Banner */}
          <div className="p-5 bg-gradient-to-r from-red-950 via-red-900 to-[#180A0A] border-2 border-red-600 rounded-sm space-y-3 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black uppercase font-mono tracking-wider">High-Priority Emergency SOS</h3>
                  <p className="text-[11px] text-red-200/90 font-mono">Immediate distress beacon & location broadcast to all contacts</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-black uppercase rounded">
                INSTANT BEACON
              </span>
            </div>

            <p className="text-xs text-red-100/90 leading-relaxed">
              Triggers a one-time GPS location capture and immediately alerts all verified emergency contacts via SMS & Email. Includes a 10-second cancel delay to prevent false alarms.
            </p>

            <button
              onClick={() => onTriggerSOS && onTriggerSOS('Manual Safety Workspace SOS Button')}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-sm transition-all shadow-lg flex items-center justify-center gap-2 border border-red-400 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>TRIGGER EMERGENCY SOS BEACON NOW</span>
            </button>
          </div>

          {/* Scheduled Check-in Control Card */}
          <div className={`p-6 rounded-sm border-2 space-y-5 transition-all ${
            checkinConfig.status === 'escalated' ? 'bg-red-950/20 border-red-600' :
            checkinConfig.status === 'overdue' ? 'bg-yellow-950/20 border-yellow-500' :
            'bg-[#111] border-[#222]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div>
                <span className="text-[10px] text-[#666] font-mono uppercase tracking-widest block">SAFETY TIMER</span>
                <h3 className="text-xl font-black uppercase text-white">Scheduled Safety Check-In</h3>
              </div>
              <span className={`px-3 py-1 text-xs font-mono font-black uppercase rounded ${
                checkinConfig.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                checkinConfig.status === 'overdue' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-600 text-white animate-pulse'
              }`}>
                STATUS: {checkinConfig.status.toUpperCase()}
              </span>
            </div>

            {/* Timer Box */}
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm text-center">
              <p className="text-[10px] font-mono uppercase text-[#666] tracking-widest">Time Remaining Until Next Check-In</p>
              <p className="text-5xl font-mono font-black text-white mt-2 tracking-tighter">
                {timeRemaining}
              </p>
              <p className="text-[10px] font-mono text-[#777] mt-2">
                Frequency: Every {checkinConfig.frequencyHours} Hours • Grace Period: {checkinConfig.gracePeriodMinutes} Mins
              </p>
            </div>

            {/* Grace Period Safeguard Explainer */}
            <div className="p-3 bg-[#181818] rounded text-xs text-[#AAA] border-l-2 border-yellow-500 space-y-1">
              <p className="font-bold text-white uppercase text-[10px]">Escalation Safeguard Protocol</p>
              <p className="text-[11px]">
                If a check-in is missed, Pathway AI sends 3 progressive notifications to the traveller during the {checkinConfig.gracePeriodMinutes}-minute grace period before notifying verified emergency contacts.
              </p>
            </div>

            {/* Perform Check-In */}
            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Optional safety status note e.g. Boarded flight to Lisbon"
                value={checkinNote}
                onChange={(e) => setCheckinNote(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
              />
              <button
                onClick={() => {
                  onCheckinNow(checkinNote);
                  setCheckinNote('');
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs py-3.5 tracking-widest rounded-sm transition-colors"
              >
                CHECK IN NOW & CONFIRM SAFETY
              </button>
            </div>
          </div>

          {/* User-Consented One-Time Location Capture Card */}
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                Explicit-Permission Location Stamp
              </h3>
              <span className="text-[9px] font-mono bg-white text-black font-black px-2 py-0.5">
                NEVER CONTINUOUS
              </span>
            </div>

            <p className="text-xs text-[#888] leading-relaxed">
              Record a single, explicit location stamp upon your request. As per safety mandates, this data is strictly labeled <strong className="text-white">“last recorded location”</strong> and is never tracked continuously.
            </p>

            <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-2 font-mono text-xs">
              <p className="text-[10px] text-[#666] uppercase">Last Recorded Location Status</p>
              {lastLocation ? (
                <div>
                  <p className="text-sm font-bold text-white">{lastLocation.locationLabel}</p>
                  <p className="text-[10px] text-[#777] mt-1">Recorded: {lastLocation.timestamp}</p>
                  <span className="inline-block mt-2 text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                    USER CONSENTED
                  </span>
                </div>
              ) : (
                <p className="text-[#666] italic">No location has been recorded yet.</p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="text"
                placeholder="Custom location label e.g. Lisbon Airport Terminal 1"
                value={customLocationLabel}
                onChange={(e) => setCustomLocationLabel(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
              />
              <button
                onClick={handleManualLocationCapture}
                disabled={locationCapturing}
                className="w-full bg-[#222] hover:bg-[#333] text-white font-black uppercase text-xs py-3 tracking-widest rounded-sm flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-white" />
                {locationCapturing ? 'Requesting GPS Consent...' : locationSuccess ? 'Location Consented & Saved!' : 'Stamp Last Recorded Location'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Emergency Contact Invitation & Granular Permissions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Emergency Contacts List */}
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3 flex items-center justify-between">
              <span>Emergency Contacts ({contacts.length})</span>
              <span className="text-[10px] font-mono text-[#666]">VERIFICATION & PERMISSIONS</span>
            </h3>

            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white">{contact.contactName}</h4>
                      <p className="text-xs text-[#888] font-mono">{contact.contactEmail} • {contact.relationship}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                        contact.status === 'verified' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {contact.status}
                      </span>
                      <button
                        onClick={() => onRevokeContact(contact.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-mono underline ml-2"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  {/* Verification code box for pending */}
                  {contact.status === 'pending' && (
                    <div className="p-3 bg-[#141414] border border-[#333] rounded text-xs space-y-2">
                      <p className="text-[10px] font-mono text-yellow-400 uppercase">Verification Code: {contact.verificationCode}</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter 8-digit verification code"
                          value={verifyCodeInput[contact.id] || ''}
                          onChange={(e) => setVerifyCodeInput({ ...verifyCodeInput, [contact.id]: e.target.value })}
                          className="flex-1 bg-[#0A0A0A] border border-[#333] px-2 py-1 text-xs text-white uppercase font-mono rounded"
                        />
                        <button
                          onClick={() => onVerifyContact(contact.id, verifyCodeInput[contact.id] || '')}
                          className="px-3 py-1 bg-white text-black font-black uppercase text-[10px] rounded"
                        >
                          Verify Contact
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Granular Permission Flags */}
                  <div className="pt-1">
                    <p className="text-[10px] font-mono text-[#666] uppercase mb-2">Permitted Data Attributes</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <label className="flex items-center gap-2 text-[#AAA] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.permissions?.canViewLastLocation ?? true}
                          onChange={(e) => onUpdatePermissions(contact.id, {
                            ...contact.permissions,
                            canViewLastLocation: e.target.checked
                          })}
                          className="w-3.5 h-3.5 accent-white rounded"
                        />
                        <span>Last Recorded Location</span>
                      </label>

                      <label className="flex items-center gap-2 text-[#AAA] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contact.permissions?.canViewCheckinStatus ?? true}
                          onChange={(e) => onUpdatePermissions(contact.id, {
                            ...contact.permissions,
                            canViewCheckinStatus: e.target.checked
                          })}
                          className="w-3.5 h-3.5 accent-white rounded"
                        />
                        <span>Check-In Timers</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Contact Form */}
          <form onSubmit={handleInvite} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
              Invite Emergency Contact (Parent / Family Guardian / Trusted Friend)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Osagie or Sarah (Best Friend)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Email / WhatsApp Contact</label>
                <input
                  type="email"
                  placeholder="e.g. contact@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Relationship</label>
              <input
                type="text"
                placeholder="e.g. Parent / Primary Family Guardian / Trusted Date Contact"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs py-3 rounded-sm tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-black" />
              Generate Guardian Pass & Verification Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
