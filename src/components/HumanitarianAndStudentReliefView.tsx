import React, { useState } from 'react';
import { 
  ShieldAlert, GraduationCap, HeartHandshake, Lock, PhoneCall, AlertTriangle, 
  FileCheck2, LifeBuoy, CheckCircle2, ChevronRight, EyeOff, UserX, Scale, 
  HelpCircle, ExternalLink, ShieldCheck, FileText, RefreshCw, Sparkles, Building2
} from 'lucide-react';
import { MobilityProfile } from '../types';

interface HumanitarianAndStudentReliefViewProps {
  profile?: MobilityProfile;
  onUpdateProfile?: (updatedProfile: Partial<MobilityProfile>) => void;
  onNavigateTab?: (tab: string) => void;
}

export const HumanitarianAndStudentReliefView: React.FC<HumanitarianAndStudentReliefViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab
}) => {
  const [activeCategory, setActiveCategory] = useState<'f1_student' | 'out_of_status' | 'spousal_dispute' | 'vawa_abuse' | 'trafficking_t_visa'>('f1_student');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  
  // Interactive Assessment States dynamically loaded from profile
  const [sevisTerminationDays, setSevisTerminationDays] = useState<number>(30);
  const [hasUnauthorizedEmployment, setHasUnauthorizedEmployment] = useState<boolean>(false);
  const [spousalStatus, setSpousalStatus] = useState<'usc' | 'lpr' | 'non_immigrant' | 'unknown'>('usc');
  const [hasPoliceReport, setHasPoliceReport] = useState<boolean>(false);

  // Editable Profile Inline States when fields are missing
  const [editSchool, setEditSchool] = useState(profile?.schoolOrEmployer || '');
  const [editStatus, setEditStatus] = useState(profile?.currentImmigrationStatus || '');
  const [showProfileInlineEdit, setShowProfileInlineEdit] = useState(false);

  // Sync edits to central profile
  const handleSaveInlineProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        schoolOrEmployer: editSchool,
        currentImmigrationStatus: editStatus
      });
      setShowProfileInlineEdit(false);
    }
  };

  // Quick Hide Trigger for domestic safety
  const handleQuickHide = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="space-y-6">
      {/* Discrete Top Safety Banner */}
      <div className="p-4 bg-[#140C0C] border border-red-500/50 rounded-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="text-xs font-black uppercase text-red-400 font-mono tracking-wider block">
              HUMANITARIAN RELIEF & EMERGENCY LEGAL STATUS ADVISOR
            </span>
            <p className="text-[11px] text-[#CCC] font-mono">
              Confidential, statutory guidance for F-1 students, out-of-status individuals, spousal disputes, VAWA, and human trafficking survivors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('agent')}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Consult AI Agent</span>
            </button>
          )}

          <button
            onClick={handleQuickHide}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs font-mono rounded-sm flex items-center gap-2 shadow-lg transition-colors shrink-0"
            title="Instantly leave this page and redirect to Google"
          >
            <EyeOff className="w-4 h-4 text-white" />
            <span>Quick Safety Exit (ESC)</span>
          </button>
        </div>
      </div>

      {/* Dynamic Profile Sync Card */}
      <div className="p-4 bg-[#111] border border-[#222] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/40 rounded-sm flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">Active Profile Context:</span>
              <span className="text-blue-400 font-bold">{profile?.fullName || 'Anonymous User'}</span>
            </div>
            <p className="text-[11px] text-[#888]">
              Nationality: <span className="text-white">{profile?.nationality || 'Not specified'}</span> | 
              School / Employer: <span className="text-white">{profile?.schoolOrEmployer || 'Not set'}</span> | 
              Immigration Status: <span className="text-white">{profile?.currentImmigrationStatus || 'Unspecified'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowProfileInlineEdit(!showProfileInlineEdit)}
          className="px-2.5 py-1 bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-[#CCC] text-[10px] font-bold uppercase rounded-sm flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-amber-400" />
          <span>{showProfileInlineEdit ? 'Close Sync' : 'Edit Profile Context'}</span>
        </button>
      </div>

      {/* Inline Quick Profile Edit Box */}
      {showProfileInlineEdit && (
        <div className="p-4 bg-[#161616] border border-amber-500/40 rounded-sm space-y-3 font-mono">
          <span className="text-xs font-bold uppercase text-amber-400 block">
            Update Mobility Profile Data (Saves across all modules)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-[#888] font-bold uppercase block mb-1">University / College / Employer</label>
              <input
                type="text"
                value={editSchool}
                onChange={(e) => setEditSchool(e.target.value)}
                placeholder="e.g. University of Toronto / Apex Tech Inc"
                className="w-full bg-[#0D0D0D] border border-[#333] text-white p-2 rounded-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888] font-bold uppercase block mb-1">Current Legal / Immigration Status</label>
              <input
                type="text"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                placeholder="e.g. F-1 Student / H-4 Dependent / Out of Status"
                className="w-full bg-[#0D0D0D] border border-[#333] text-white p-2 rounded-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveInlineProfile}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-sm transition-colors"
            >
              Save to Profile
            </button>
          </div>
        </div>
      )}

      {/* Main Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono">
        <button
          onClick={() => setActiveCategory('f1_student')}
          className={`p-3 border rounded-sm text-left transition-all ${
            activeCategory === 'f1_student'
              ? 'bg-[#1C180A] border-amber-500 text-amber-300'
              : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase">F-1 Student Status</span>
          </div>
          <p className="text-[10px] text-[#777] line-clamp-2">OPT, CPT, SEVIS grace periods & course compliance</p>
        </button>

        <button
          onClick={() => setActiveCategory('out_of_status')}
          className={`p-3 border rounded-sm text-left transition-all ${
            activeCategory === 'out_of_status'
              ? 'bg-[#200D0D] border-red-500 text-red-300'
              : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <UserX className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold uppercase">Out of Status / Reinstatement</span>
          </div>
          <p className="text-[10px] text-[#777] line-clamp-2">SEVIS termination recovery & I-539 reinstatement</p>
        </button>

        <button
          onClick={() => setActiveCategory('spousal_dispute')}
          className={`p-3 border rounded-sm text-left transition-all ${
            activeCategory === 'spousal_dispute'
              ? 'bg-[#0E1724] border-blue-500 text-blue-300'
              : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase">Spousal Visa Dispute</span>
          </div>
          <p className="text-[10px] text-[#777] line-clamp-2">H-4, F-2, L-2 independence & document protection</p>
        </button>

        <button
          onClick={() => setActiveCategory('vawa_abuse')}
          className={`p-3 border rounded-sm text-left transition-all ${
            activeCategory === 'vawa_abuse'
              ? 'bg-[#1A0E24] border-purple-500 text-purple-300'
              : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase">VAWA & Abuse Relief</span>
          </div>
          <p className="text-[10px] text-[#777] line-clamp-2">Self-petitioning Green Card without abusive spouse</p>
        </button>

        <button
          onClick={() => setActiveCategory('trafficking_t_visa')}
          className={`p-3 border rounded-sm text-left transition-all ${
            activeCategory === 'trafficking_t_visa'
              ? 'bg-[#0B1C16] border-emerald-500 text-emerald-300'
              : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase">Human Trafficking (T-Visa)</span>
          </div>
          <p className="text-[10px] text-[#777] line-clamp-2">Force, fraud, coercion protection & U-Visa crime relief</p>
        </button>
      </div>

      {/* --- CATEGORY CONTENT --- */}

      {/* 1. F-1 STUDENT COMPLIANCE & SAFEGUARDS */}
      {activeCategory === 'f1_student' && (
        <div className="space-y-6 animate-fadeIn font-mono">
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-400 border-b border-[#222] pb-3">
              <GraduationCap className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                F-1 Student Legal Status Compliance & Rulebook (USA / USCIS / SEVP)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">60-Day Post-Completion Grace Period</span>
                <h4 className="text-xs font-bold text-white uppercase">Degree Completion Window</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Upon graduation, F-1 students receive a strict 60-day grace period. During this window, you must either: (1) depart the US, (2) apply for OPT, (3) transfer SEVIS to a new program, or (4) change visa status (e.g. H-1B, O-1).
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">OPT / STEM OPT Unemployment Limits</span>
                <h4 className="text-xs font-bold text-white uppercase">90 Days / 150 Days Max</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Standard 12-Month OPT permits maximum 90 cumulative days of unemployment. 24-Month STEM OPT allows an additional 60 days (150 days total). Exceeding this triggers SEVIS status termination.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">15-Day Authorized Early Departure</span>
                <h4 className="text-xs font-bold text-white uppercase">DSO Authorized Withdrawal</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  If your Designated School Official (DSO) approves an official withdrawal from classes in advance, you have 15 calendar days to depart the United States legally without a status violation.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="pt-2 border-t border-[#222] space-y-2">
              <span className="text-[10px] text-[#888] font-bold uppercase block">CRITICAL F-1 MAINTAINED STATUS CHECKLIST:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#DDD]">
                <div className="p-2.5 bg-[#181818] border border-[#2A2A2A] rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Maintain full-time course enrollment (12 credits undergrad / 9 credits grad).</span>
                </div>
                <div className="p-2.5 bg-[#181818] border border-[#2A2A2A] rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Never work off-campus without explicit CPT/OPT EAD authorization.</span>
                </div>
                <div className="p-2.5 bg-[#181818] border border-[#2A2A2A] rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Report address or employment updates within 10 days to DSO in SEVP portal.</span>
                </div>
                <div className="p-2.5 bg-[#181818] border border-[#2A2A2A] rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Keep passport valid at least 6 months into the future at all times.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OUT OF STATUS & REINSTATEMENT */}
      {activeCategory === 'out_of_status' && (
        <div className="space-y-6 animate-fadeIn font-mono">
          <div className="p-6 bg-[#160A0A] border border-red-500/60 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-red-400 border-b border-red-900/40 pb-3">
              <UserX className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Emergency Recovery for "Out of Status" & SEVIS Terminated Students
              </h3>
            </div>

            <p className="text-xs text-[#DDD] leading-relaxed">
              If your SEVIS record was terminated (due to course under-enrollment, missed OPT deadline, or DSO reporting error), you are officially "out of status". <strong>You have specific statutory remedies available under US Immigration Law (8 CFR 214.2(f)(16)).</strong>
            </p>

            {/* Interactive Eligibility Evaluator */}
            <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-amber-400">
                Statutory SEVIS Reinstatement Self-Assessment (Form I-539)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#888] font-bold uppercase">Days Since Status Violation / SEVIS Termination</label>
                  <input
                    type="number"
                    value={sevisTerminationDays}
                    onChange={(e) => setSevisTerminationDays(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-[#333] text-white text-xs p-2.5 rounded-sm focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[9px] text-[#777] block">Must be under 5 months (150 days) for standard reinstatement without exceptional hardship waiver.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#888] font-bold uppercase">Did you engage in unauthorized employment?</label>
                  <select
                    value={hasUnauthorizedEmployment ? 'yes' : 'no'}
                    onChange={(e) => setHasUnauthorizedEmployment(e.target.value === 'yes')}
                    className="w-full bg-[#181818] border border-[#333] text-white text-xs p-2.5 rounded-sm focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="no">No — Never worked unauthorized</option>
                    <option value="yes">Yes — Engaged in unauthorized work</option>
                  </select>
                </div>
              </div>

              {/* Evaluation Result Box */}
              <div className={`p-4 rounded-sm border ${
                sevisTerminationDays <= 150 && !hasUnauthorizedEmployment
                  ? 'bg-green-950/30 border-green-500/60 text-green-300'
                  : 'bg-red-950/40 border-red-500/60 text-red-300'
              }`}>
                {sevisTerminationDays <= 150 && !hasUnauthorizedEmployment ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Likely Eligible for USCIS SEVIS Reinstatement (Form I-539)</span>
                    </div>
                    <p className="text-[11px] text-[#CCC] leading-relaxed">
                      You meet the statutory baseline: violation occurred less than 5 months ago and no unauthorized employment was performed. Work immediately with your DSO to issue a "Reinstatement Requested" I-20 and file Form I-539 with USCIS.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-400">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Complex Reinstatement Barrier Detected</span>
                    </div>
                    <p className="text-[11px] text-[#CCC] leading-relaxed">
                      {hasUnauthorizedEmployment 
                        ? 'Statutory bar: Unauthorized employment is an absolute statutory bar to F-1 reinstatement under 8 CFR 214.2(f)(16). You must explore departure & travel re-entry or emergency humanitarian relief.' 
                        : 'Over 5 Months: Exceeding 150 days requires proving exceptional circumstances beyond your control (e.g. medical emergency, severe DSO oversight). Consult an immigration attorney immediately.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Options Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Option A: Travel & Re-Entry (New SEVIS ID)</span>
                <h4 className="text-xs font-bold text-white uppercase">Depart & Reset Entry</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Obtain an "Initial Attendance" I-20 from a university DSO, pay a new SEVIS I-901 fee, depart the US, and re-enter on a valid F-1 visa. Note: Resets 1-academic-year clock for OPT eligibility.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Option B: Humanitarian / Emergency Relief</span>
                <h4 className="text-xs font-bold text-white uppercase">Severe Medical / Crisis Hardship</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  If status loss was caused by severe mental/physical health crisis, domestic abuse, or crime victimization, you may qualify for deferred action or humanitarian adjustment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SPOUSAL VISA DISPUTES & AUTONOMY */}
      {activeCategory === 'spousal_dispute' && (
        <div className="space-y-6 animate-fadeIn font-mono">
          <div className="p-6 bg-[#0B121C] border border-blue-500/60 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-400 border-b border-blue-900/40 pb-3">
              <HeartHandshake className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Spousal Visa Coordination & Independence Safeguards (H-4, F-2, L-2, CR-1)
              </h3>
            </div>

            <p className="text-xs text-[#DDD] leading-relaxed">
              Dependent spouses often face acute vulnerability when marital disputes arise, as principal visa holders (e.g., H-1B, L-1, F-1) may threaten to withdraw immigration sponsorship or withhold identity documents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Your Independent Document Rights</span>
                <h4 className="text-xs font-bold text-white uppercase">USCIS Copy Access</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  It is illegal for anyone to withhold your physical passport or I-94 arrival record. You can request copies of I-797 approval notices directly from USCIS using Freedom of Information Act (FOIA) requests.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Divorce & Status Grace Periods</span>
                <h4 className="text-xs font-bold text-white uppercase">Effect of Legal Separation</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Filing for divorce does not immediately cancel H-4 or L-2 status; status remains valid until a final court divorce decree is entered. This window allows you to transition to an independent visa (e.g., F-1, H-1B, O-1).
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Work Authorization (H-4 / L-2 EAD)</span>
                <h4 className="text-xs font-bold text-white uppercase">Independent EAD Rights</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  L-2 and E-2 spouses have automatic incident-to-status work authorization. H-4 spouses with approved I-140 can maintain independent income to secure housing and legal representation.
                </p>
              </div>
            </div>

            {/* Protection Advice Box */}
            <div className="p-4 bg-[#141B26] border border-blue-500/40 rounded-sm space-y-2 text-xs text-[#CCC]">
              <span className="text-[10px] text-blue-400 font-bold uppercase block">RECOMMENDED SPOUSAL ACTION PLAN:</span>
              <ul className="space-y-1 list-disc list-inside text-[11px]">
                <li>Digitize all passports, visas, I-94s, marriage certificates, and I-797 approval notices into an independent, password-protected cloud vault.</li>
                <li>Open a separate personal bank account in your sole name to maintain financial independence.</li>
                <li>Consult an independent immigration attorney who represents ONLY YOU (not your spouse's corporate immigration attorney).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. VAWA & DOMESTIC ABUSE RELIEF */}
      {activeCategory === 'vawa_abuse' && (
        <div className="space-y-6 animate-fadeIn font-mono">
          <div className="p-6 bg-[#180C22] border border-purple-500/60 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-purple-400 border-b border-purple-900/40 pb-3">
              <Scale className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                VAWA Self-Petitioning Green Card (Violence Against Women Act - Form I-360)
              </h3>
            </div>

            <p className="text-xs text-[#DDD] leading-relaxed">
              If you are or were married to a <strong>US Citizen or Lawful Permanent Resident (Green Card holder)</strong> and suffered battery or extreme cruelty (physical, emotional, psychological, financial, or sexual abuse), <strong>you can apply for a Green Card independently without your spouse's knowledge or consent.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Key Statutory VAWA Protections</span>
                <h4 className="text-xs font-bold text-white uppercase">Complete Confidentiality (8 U.S.C. 1367)</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  USCIS is strictly prohibited by federal law from disclosing your VAWA application to your abusive spouse or family member. Abusers receive ZERO notification.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Benefits Upon Approval</span>
                <h4 className="text-xs font-bold text-white uppercase">Work Permit & Permanent Residency</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Approved Form I-360 self-petitioners receive Deferred Action status, immediate Employment Authorization (EAD work permit), and eligibility to adjust status to Permanent Resident (Green Card).
                </p>
              </div>
            </div>

            {/* Evidence Checklist */}
            <div className="p-4 bg-[#110A18] border border-purple-500/40 rounded-sm space-y-2">
              <span className="text-[10px] text-purple-300 font-bold uppercase block">QUALIFYING EVIDENCE FOR VAWA PETITIONS:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#BBB]">
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
                  <strong className="text-white block">1. Proof of Relationship</strong>
                  Marriage certificate, joint leases, tax filings, or photos showing good faith marriage.
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
                  <strong className="text-white block">2. Proof of Abuser Status</strong>
                  Spouse's US Birth certificate, US Passport copy, or Green Card copy (or FOIA request).
                </div>
                <div className="p-2.5 bg-[#0A0A0A] border border-[#222] rounded-sm">
                  <strong className="text-white block">3. Proof of Abuse / Cruelty</strong>
                  Police reports, protective orders, medical records, text messages, or personal sworn affidavits.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HUMAN TRAFFICKING (T-VISA) & U-VISA CRIME RELIEF */}
      {activeCategory === 'trafficking_t_visa' && (
        <div className="space-y-6 animate-fadeIn font-mono">
          <div className="p-6 bg-[#081B14] border border-emerald-500/60 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-900/40 pb-3">
              <LifeBuoy className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Human Trafficking Protection (T-Visa) & Crime Victim Protection (U-Visa)
              </h3>
            </div>

            <p className="text-xs text-[#DDD] leading-relaxed">
              If you were brought into or held in a country through <strong>force, fraud, debt bondage, or coercion</strong> for work, labor, domestic servitude, or commercial sex, you are a victim of human trafficking and protected by federal law.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* T-Visa */}
              <div className="p-4 bg-[#0A0A0A] border border-emerald-500/40 rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">T-Visa (Form I-914) — Human Trafficking</span>
                <h4 className="text-xs font-bold text-white uppercase">Labor & Sex Trafficking Relief</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Provides 4 years of legal status, EAD work permit, federal refugee benefits (cash, housing, food assistance), and a direct pathway to a Green Card. Does NOT require a police report if trauma prevented reporting.
                </p>
              </div>

              {/* U-Visa */}
              <div className="p-4 bg-[#0A0A0A] border border-emerald-500/40 rounded-sm space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">U-Visa (Form I-918) — Crime Victims</span>
                <h4 className="text-xs font-bold text-white uppercase">Victims of Serious Crimes</h4>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  For victims of qualifying crimes (domestic violence, felony assault, unlawful imprisonment, extortion) who suffered substantial physical or mental abuse and assisted law enforcement.
                </p>
              </div>
            </div>

            {/* Emergency Hotline Box */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-emerald-400 block">
                  NATIONAL HUMAN TRAFFICKING HOTLINE (CONFIDENTIAL 24/7)
                </span>
                <p className="text-[11px] text-[#CCC] mt-0.5">
                  Free, confidential help in 200+ languages. Toll-Free: <strong>1-888-373-7888</strong> | Text "HELP" or "INFO" to <strong>233733</strong>
                </p>
              </div>

              <a
                href="tel:18883737888"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-sm flex items-center gap-2 shrink-0"
              >
                <PhoneCall className="w-4 h-4 text-black" />
                <span>Call Hotline Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT EMERGENCY CONTACTS DIRECTORY */}
      <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4 font-mono">
        <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-[#222] pb-3 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-amber-400" />
          <span>Official Emergency Legal & Humanitarian Hotlines</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm space-y-1">
            <span className="text-[9px] text-[#888] font-bold uppercase block">National Domestic Violence Hotline</span>
            <strong className="text-white block font-bold">1-800-799-7233</strong>
            <span className="text-[10px] text-[#AAA] block">24/7 Crisis intervention & safety planning.</span>
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm space-y-1">
            <span className="text-[9px] text-[#888] font-bold uppercase block">USCIS Human Trafficking Unit</span>
            <strong className="text-white block font-bold">1-800-375-5283</strong>
            <span className="text-[10px] text-[#AAA] block">Official T-Visa & U-Visa filing inquiries.</span>
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm space-y-1">
            <span className="text-[9px] text-[#888] font-bold uppercase block">ASISTA Immigrant Victims Network</span>
            <strong className="text-white block font-bold">asistahelp.org</strong>
            <span className="text-[10px] text-[#AAA] block">Legal advocacy for immigrant survivors.</span>
          </div>

          <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-sm space-y-1">
            <span className="text-[9px] text-[#888] font-bold uppercase block">SEVP SEVIS Response Center</span>
            <strong className="text-white block font-bold">1-703-603-3400</strong>
            <span className="text-[10px] text-[#AAA] block">Direct SEVP student status hotline.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
