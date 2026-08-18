import React, { useState } from 'react';
import { User, Globe, FileText, Calendar, Shield, Briefcase, Award, DollarSign, Users, Target, Save, CheckCircle, Info, ArrowRight, Check } from 'lucide-react';
import { MobilityProfile } from '../types';
import { getVisaOptionsForRoute } from '../lib/visaRequirements';

interface MobilityProfileViewProps {
  profile: MobilityProfile;
  onSaveProfile: (updated: MobilityProfile) => void;
  readOnly?: boolean;
}

export const MobilityProfileView: React.FC<MobilityProfileViewProps> = ({
  profile,
  onSaveProfile,
  readOnly = false
}) => {
  const [formData, setFormData] = useState<MobilityProfile>({ ...profile });

  React.useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const [newQualification, setNewQualification] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCustomVisaType, setIsCustomVisaType] = useState(false);

  const calculateCompleteness = () => {
    let score = 0;
    let total = 8;
    if (formData.fullName?.trim()) score++;
    if (formData.nationality?.trim()) score++;
    if (formData.currentCountry?.trim()) score++;
    if (formData.destinationCountries?.length > 0) score++;
    if (formData.purposeOfTravel?.trim()) score++;
    if (formData.workAuthorisation?.trim() || formData.schoolOrEmployer?.trim()) score++;
    if (formData.budget && formData.budget > 0) score++;
    if (formData.passportExpiration?.trim()) score++;
    return Math.round((score / total) * 100);
  };
  const completenessPct = calculateCompleteness();

  const routeAssessment = getVisaOptionsForRoute(
    formData.nationality,
    formData.currentCountry,
    formData.destinationCountries,
    formData.purposeOfTravel
  );

  const handleChange = (field: keyof MobilityProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSharingChange = (field: keyof MobilityProfile['sharingSettings'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      sharingSettings: {
        ...prev.sharingSettings,
        [field]: value
      }
    }));
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addDestination = () => {
    if (newDestination.trim() && !formData.destinationCountries.includes(newDestination.trim())) {
      setFormData(prev => ({
        ...prev,
        destinationCountries: [...prev.destinationCountries, newDestination.trim()]
      }));
      setNewDestination('');
    }
  };

  const removeDestination = (country: string) => {
    setFormData(prev => ({
      ...prev,
      destinationCountries: prev.destinationCountries.filter(c => c !== country)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...formData,
      updatedAt: new Date().toISOString()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[10px] text-blue-400 font-mono font-black uppercase tracking-[0.2em]">01 MOBILITY &amp; RELOCATION PROFILE</h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Profile Saved &amp; Sync Active
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            {formData.fullName || 'Private Mobility Profile'}
          </h1>
          <p className="text-base text-slate-200 mt-2 font-medium">
            Your relocation profile is saved and synced across devices for visa audits and safety routing.
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={handleSubmit}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs px-6 py-3 tracking-wider flex items-center gap-2 self-start sm:self-auto rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
          >
            {savedSuccess ? <CheckCircle className="w-4 h-4 text-black" /> : <Save className="w-4 h-4 text-black" />}
            {savedSuccess ? 'SAVED' : 'SAVE PROFILE'}
          </button>
        )}
      </div>

      {/* Profile Readiness & Relocation Health Bar */}
      <div className="bg-[#12121D] border border-blue-500/30 p-5 rounded-xl font-mono space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 border border-blue-400/40 rounded-lg text-blue-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-blue-300 font-black uppercase tracking-wider block">Relocation Readiness Score</span>
              <span className="text-white font-bold text-sm">
                {completenessPct}% Profile Completeness {completenessPct >= 100 ? '• Ready for Consular Application' : '• Update missing details below'}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Last Updated: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'Today'}
          </span>
        </div>

        {/* Completeness Bar */}
        <div className="w-full bg-[#1A1A28] h-2.5 rounded-full overflow-hidden border border-[#2A2A3E]">
          <div 
            className={`h-full transition-all duration-500 ${
              completenessPct >= 80 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-blue-500'
            }`}
            style={{ width: `${completenessPct}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-medium pt-1">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            Accurate origin passport, income level, and dependent details directly dictate visa eligibility rules.
          </span>
          <span className="text-blue-300 font-bold">
            Target Destination: {formData.destinationCountries.join(', ') || 'None specified'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personal & Nationality */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 border-b border-[#222] pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-white" />
              Identity & Citizenship
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Nationality / Passport Country</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Current Country of Residence</label>
                <input
                  type="text"
                  value={formData.currentCountry}
                  onChange={(e) => handleChange('currentCountry', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Purpose of Mobility</label>
                <select
                  value={formData.purposeOfTravel}
                  onChange={(e) => handleChange('purposeOfTravel', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm uppercase font-bold"
                >
                  <option value="visit">Short Visit / Tourism / Visitor Visa</option>
                  <option value="relocation">Long-Term Relocation</option>
                  <option value="education">Higher Education / Student</option>
                  <option value="work">Foreign Employment</option>
                  <option value="digital_nomad">Digital Nomad / Remote Work</option>
                  <option value="family">Family Reunification</option>
                  <option value="humanitarian">Humanitarian / Asylum</option>
                </select>
              </div>
            </div>

            {/* Target Countries Tag Input */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Target Destination Countries</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.destinationCountries.map((c) => (
                  <span key={c} className="px-3 py-1 bg-white text-black text-xs font-black uppercase flex items-center gap-2 rounded-sm">
                    {c}
                    {!readOnly && (
                      <button type="button" onClick={() => removeDestination(c)} className="hover:text-red-700 font-bold">×</button>
                    )}
                  </span>
                ))}
              </div>
              {!readOnly && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add country e.g. Portugal"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-[#333] px-3 py-1.5 text-xs text-white focus:outline-none rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={addDestination}
                    className="px-3 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-bold uppercase rounded-sm"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Immigration & Visa Details */}
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 border-b border-[#222] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <span>Immigration & Visa Status</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                {formData.visaStatus === 'visa_granted' && '✓ VISA GRANTED'}
                {formData.visaStatus === 'application_started' && '⏳ APPLICATION IN PROGRESS'}
                {formData.visaStatus === 'no_visa_required' && '🛡️ VISA EXEMPT'}
                {formData.visaStatus === 'visa_denied' && '⚠️ VISA DENIED / APPEAL'}
                {(!formData.visaStatus || formData.visaStatus === 'none') && '⏱️ NOT STARTED'}
              </span>
            </h3>

            {/* Primary Visa Status Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1.5">
                  1. Visa Processing Status
                </label>
                <select
                  value={formData.visaStatus || 'none'}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    handleChange('visaStatus', newStatus);
                    
                    // Auto-adjust default labels based on status
                    if (newStatus === 'none') {
                      handleChange('currentImmigrationStatus', 'Citizen / Exploring Visa Pathways');
                      if (routeAssessment.options.length > 0) {
                        handleChange('visaType', routeAssessment.options[0].name);
                      }
                    } else if (newStatus === 'no_visa_required') {
                      handleChange('currentImmigrationStatus', 'Visa-Exempt Traveller');
                      handleChange('visaType', routeAssessment.visaExemptionReason || 'ECOWAS / Visa Exemption Regime');
                    } else if (newStatus === 'visa_granted') {
                      handleChange('currentImmigrationStatus', 'Approved Resident Visa Holder');
                    } else if (newStatus === 'visa_denied') {
                      handleChange('currentImmigrationStatus', 'Refusal Notice Received');
                    } else if (newStatus === 'application_started') {
                      handleChange('currentImmigrationStatus', 'Consular Applicant (Submitted)');
                    }
                  }}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-amber-500/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none rounded-sm uppercase font-bold"
                >
                  <option value="none">Not Started (No Visa Yet)</option>
                  <option value="application_started">Application Started (In Progress)</option>
                  <option value="visa_granted">Visa Granted (Approved)</option>
                  <option value="no_visa_required">No Visa Required (Exempt)</option>
                  <option value="visa_denied">Visa Denied (Refused / Appeal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  {formData.visaStatus === 'no_visa_required' ? 'Exemption Category' : 'Current Immigration Description'}
                </label>
                <input
                  type="text"
                  value={formData.currentImmigrationStatus}
                  placeholder={
                    formData.visaStatus === 'no_visa_required' 
                      ? 'e.g. ECOWAS Free Movement Article 3' 
                      : formData.visaStatus === 'visa_granted'
                      ? 'e.g. D7 Passive Income Residence Stamp'
                      : 'e.g. Citizen (Nigeria) / Seeking D7 Visa'
                  }
                  onChange={(e) => handleChange('currentImmigrationStatus', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>

              {/* Dynamic Visa Type Dropdown Selector based on Nationality & Destination Route */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#777] mb-1 flex items-center justify-between">
                  <span>
                    {formData.visaStatus === 'no_visa_required' 
                      ? 'Maximum Visa-Free Window' 
                      : formData.visaStatus === 'application_started'
                      ? 'Target Visa Type Applied For'
                      : '2. Visa Type Selection'}
                  </span>
                  {routeAssessment.primaryDestination && (
                    <span className="text-amber-400 text-[9px] font-bold">
                      [{routeAssessment.primaryDestination}]
                    </span>
                  )}
                </label>

                {!isCustomVisaType ? (
                  <div className="space-y-1">
                    <select
                      value={formData.visaType}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM_OTHER') {
                          setIsCustomVisaType(true);
                          handleChange('visaType', '');
                        } else {
                          handleChange('visaType', e.target.value);
                        }
                      }}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-emerald-500/50 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none rounded-sm font-bold truncate"
                    >
                      <option value="">-- Select Visa Type for {routeAssessment.primaryDestination || 'Destination'} --</option>
                      {routeAssessment.options.map(opt => (
                        <option key={opt.id} value={opt.name}>
                          {opt.name} ({opt.processingTime})
                        </option>
                      ))}
                      <option value="CUSTOM_OTHER">✏️ Type Custom Visa Category...</option>
                    </select>
                    <div className="flex justify-between text-[11px] font-mono text-slate-200">
                      <span>Options filtered for {formData.nationality || 'Passport'} → {routeAssessment.primaryDestination || 'Destination'}</span>
                      <button 
                        type="button" 
                        onClick={() => setIsCustomVisaType(true)} 
                        className="text-amber-400 hover:underline"
                      >
                        Enter custom
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.visaType}
                      placeholder="e.g. D7 Passive Income & Remote Work Visa"
                      onChange={(e) => handleChange('visaType', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-amber-500/60 px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                    />
                    <div className="flex justify-end text-[9px] font-mono">
                      <button 
                        type="button" 
                        onClick={() => setIsCustomVisaType(false)} 
                        className="text-emerald-400 hover:underline"
                      >
                        ← Back to route visa dropdown
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROUTE VISA ASSESSMENT & SUMMARY BANNER */}
            <div className="p-4 bg-[#0A0A0A] border border-[#2B2B2B] rounded-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222] pb-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Route Assessment:</span>
                  <span className="text-white font-bold">{formData.nationality || '[Nationality]'}</span>
                  <span className="text-slate-300">residing in</span>
                  <span className="text-white font-bold">{formData.currentCountry || '[Residence]'}</span>
                  <ArrowRight className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-black uppercase">{routeAssessment.primaryDestination || '[Target Destination]'}</span>
                </div>

                <div className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1.5"
                     style={{
                       borderColor: routeAssessment.requiresVisa ? '#F59E0B' : '#10B981',
                       color: routeAssessment.requiresVisa ? '#FBBF24' : '#34D399',
                       backgroundColor: routeAssessment.requiresVisa ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                     }}>
                  <span>{routeAssessment.requiresVisa ? '⚠️ Consular Visa Required' : '🛡️ Visa-Exempt Route'}</span>
                </div>
              </div>

              {/* Explanatory details when Visa Status is NOT STARTED */}
              {(!formData.visaStatus || formData.visaStatus === 'none') && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-xs text-amber-200/90 font-mono space-y-1">
                    <div className="font-bold flex items-center gap-2 text-amber-300">
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Visa Status: Not Started (Exploration Phase)</span>
                    </div>
                    <p className="text-[11px] text-slate-200">
                      {routeAssessment.requiresVisa ? (
                        <>
                          Holders of <strong>{formData.nationality || 'this passport'}</strong> traveling or relocating to <strong>{routeAssessment.primaryDestination || 'the target country'}</strong> require an advance consular visa prior to border entry. Select a matching visa pathway above to start tracking milestones.
                        </>
                      ) : (
                        <>
                          {routeAssessment.visaExemptionReason || 'Visa exemption applies for this movement route.'}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Selected Visa Option Details card */}
                  {formData.visaType && formData.visaType !== 'To Be Selected' && (
                    <div className="p-3 bg-[#141414] border border-[#262626] rounded text-xs space-y-1.5">
                      {(() => {
                        const selectedOpt = routeAssessment.options.find(o => o.name === formData.visaType);
                        if (selectedOpt) {
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  {selectedOpt.name}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800 rounded">
                                  Est. {selectedOpt.processingTime}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-200">{selectedOpt.description}</p>
                            </>
                          );
                        }
                        return (
                          <div className="text-[11px] text-slate-300 font-mono">
                            Selected Visa Category: <strong className="text-white">{formData.visaType}</strong>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DYNAMIC SECONDARY FIELDS ACCORDING TO VISA STATUS */}

            {/* CASE 1: VISA GRANTED -> Issue Date, Expiration Date, Passport Expiration */}
            {formData.visaStatus === 'visa_granted' && (
              <div className="space-y-3 pt-2 border-t border-green-500/20">
                <div className="flex items-center gap-2 text-[10px] font-mono text-green-400 font-bold uppercase">
                  <span>✓ Approved Consular Dates & Passport Expiration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Visa Issue Date</label>
                    <input
                      type="date"
                      value={formData.visaIssueDate}
                      onChange={(e) => handleChange('visaIssueDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-green-900 px-3 py-2 text-xs text-white focus:border-green-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Visa Expiration Date</label>
                    <input
                      type="date"
                      value={formData.visaExpirationDate}
                      onChange={(e) => handleChange('visaExpirationDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-green-900 px-3 py-2 text-xs text-white focus:border-green-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Passport Expiration</label>
                    <input
                      type="date"
                      value={formData.passportExpiration}
                      onChange={(e) => handleChange('passportExpiration', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:border-white focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 2: APPLICATION STARTED -> Submission Date / Biometrics Appt, Passport Expiration */}
            {formData.visaStatus === 'application_started' && (
              <div className="space-y-3 pt-2 border-t border-yellow-500/20">
                <div className="flex items-center gap-2 text-[10px] font-mono text-yellow-400 font-bold uppercase">
                  <span>⏳ Consular Submission & Biometrics Tracking</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Application Submission Date</label>
                    <input
                      type="date"
                      value={formData.visaIssueDate}
                      onChange={(e) => handleChange('visaIssueDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-yellow-900 px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Estimated Consular Decision Date</label>
                    <input
                      type="date"
                      value={formData.visaExpirationDate}
                      onChange={(e) => handleChange('visaExpirationDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-yellow-900 px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Passport Expiration</label>
                    <input
                      type="date"
                      value={formData.passportExpiration}
                      onChange={(e) => handleChange('passportExpiration', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:border-white focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: NO VISA REQUIRED -> Exemption window info banner & Passport Expiration */}
            {formData.visaStatus === 'no_visa_required' && (
              <div className="space-y-3 pt-2 border-t border-blue-500/20">
                <div className="p-3 bg-blue-950/30 border border-blue-500/40 rounded text-xs text-blue-300 font-mono">
                  🛡️ <strong>Visa Exemption Active:</strong> No consular visa issue/expiration dates required. Focus on ensuring your passport has at least 6 months validity from travel entry date.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Passport Expiration (Crucial: Min 6 Months)</label>
                    <input
                      type="date"
                      value={formData.passportExpiration}
                      onChange={(e) => handleChange('passportExpiration', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-blue-500 px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-[10px] font-mono text-blue-400">
                      ✓ Compliant with international border control 6-month validity rule.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 4: VISA DENIED -> Refusal Date & Appeal Deadline & Passport */}
            {formData.visaStatus === 'visa_denied' && (
              <div className="space-y-3 pt-2 border-t border-red-500/20">
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded text-xs text-red-300 font-mono">
                  ⚠️ <strong>Visa Application Refused:</strong> Enter refusal notice date and appeal submission deadline (statutory 15-day appeal window).
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Refusal Notice Date</label>
                    <input
                      type="date"
                      value={formData.visaIssueDate}
                      onChange={(e) => handleChange('visaIssueDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-red-900 px-3 py-2 text-xs text-white focus:border-red-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Appeal Filing Deadline</label>
                    <input
                      type="date"
                      value={formData.visaExpirationDate}
                      onChange={(e) => handleChange('visaExpirationDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-red-900 px-3 py-2 text-xs text-white focus:border-red-400 focus:outline-none rounded-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Passport Expiration</label>
                    <input
                      type="date"
                      value={formData.passportExpiration}
                      onChange={(e) => handleChange('passportExpiration', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:border-white focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CASE 5: NONE -> Not Started Notice */}
            {(!formData.visaStatus || formData.visaStatus === 'none') && (
              <div className="space-y-3 pt-2 border-t border-[#333]">
                <div className="p-3 bg-[#1A1A1A] border border-[#333] rounded text-xs text-[#AAA] font-mono">
                  ⏱️ <strong>Visa Not Initiated:</strong> Select a target destination and visa category. Dates will unlock when an application is started or granted.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Passport Expiration</label>
                    <input
                      type="date"
                      value={formData.passportExpiration}
                      onChange={(e) => handleChange('passportExpiration', e.target.value)}
                      disabled={readOnly}
                      className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:border-white focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Work, Qualifications & Privacy Sharing */}
        <div className="lg:col-span-6 space-y-6">
          {/* Work & Qualifications */}
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-200 border-b border-[#222] pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-white" />
              Work & Qualifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Employer / Educational Institution</label>
                <input
                  type="text"
                  value={formData.schoolOrEmployer}
                  onChange={(e) => handleChange('schoolOrEmployer', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Work Authorisation Details</label>
                <input
                  type="text"
                  value={formData.workAuthorisation}
                  onChange={(e) => handleChange('workAuthorisation', e.target.value)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white focus:border-white focus:outline-none rounded-sm font-medium"
                />
              </div>
            </div>

            {/* Qualifications List */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Academic & Professional Qualifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.qualifications.map((q, idx) => (
                  <span key={idx} className="px-2 py-1 bg-[#222] border border-[#333] text-white text-xs font-mono rounded-sm flex items-center gap-2">
                    {q}
                    {!readOnly && (
                      <button type="button" onClick={() => removeQualification(idx)} className="text-red-400 hover:text-red-300">×</button>
                    )}
                  </span>
                ))}
              </div>
              {!readOnly && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. B.Sc Software Engineering"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="flex-1 bg-[#0A0A0A] border border-[#333] px-3 py-1.5 text-xs text-white focus:outline-none rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-3 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-bold uppercase rounded-sm"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Financial & Dependants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Liquid Budget / Reserve (USD)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white font-mono focus:border-white focus:outline-none rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Dependants Accompanying</label>
                <input
                  type="number"
                  value={formData.dependants}
                  onChange={(e) => handleChange('dependants', parseInt(e.target.value) || 0)}
                  disabled={readOnly}
                  className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-sm text-white font-mono focus:border-white focus:outline-none rounded-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">Long-Term Mobility Goals</label>
              <textarea
                rows={3}
                value={formData.longTermGoals}
                onChange={(e) => handleChange('longTermGoals', e.target.value)}
                disabled={readOnly}
                className="w-full bg-[#0A0A0A] border border-[#333] p-3 text-xs text-white focus:border-white focus:outline-none rounded-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Granular Privacy & Emergency Sharing Permissions */}
          <div className="p-6 bg-[#111] border-2 border-[#333] rounded-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Emergency Contact Privacy Controls
              </span>
              <span className="text-[9px] font-mono bg-green-500/10 text-green-400 px-2 py-0.5 rounded">EXPLICIT CONSENT</span>
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Traveller sovereign privacy mandate: Select strictly which data attributes verified emergency contacts are permitted to view.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222] rounded cursor-pointer hover:border-[#444]">
                <div>
                  <p className="text-xs font-bold text-white uppercase">Share Last Recorded Location</p>
                  <p className="text-xs text-slate-200">Allow verified contacts to view user-consented location stamp.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sharingSettings?.shareLastLocation ?? true}
                  onChange={(e) => handleSharingChange('shareLastLocation', e.target.checked)}
                  disabled={readOnly}
                  className="w-4 h-4 accent-white rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222] rounded cursor-pointer hover:border-[#444]">
                <div>
                  <p className="text-xs font-bold text-white uppercase">Share Safety Check-in Status</p>
                  <p className="text-xs text-slate-200">Allow contacts to check if safety check-ins are on-time or overdue.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sharingSettings?.shareCheckinStatus ?? true}
                  onChange={(e) => handleSharingChange('shareCheckinStatus', e.target.checked)}
                  disabled={readOnly}
                  className="w-4 h-4 accent-white rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222] rounded cursor-pointer hover:border-[#444]">
                <div>
                  <p className="text-xs font-bold text-white uppercase">Share Visa & Document Expiration</p>
                  <p className="text-xs text-slate-200">Allow contacts to view document deadlines to assist in emergencies.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sharingSettings?.shareVisaStatus ?? false}
                  onChange={(e) => handleSharingChange('shareVisaStatus', e.target.checked)}
                  disabled={readOnly}
                  className="w-4 h-4 accent-white rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
