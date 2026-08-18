import React, { useState } from 'react';
import { 
  FileCheck, Plane, CheckCircle2, XCircle, ShieldCheck, Sparkles, 
  ArrowRight, Clock, AlertTriangle, Building2, Globe, FileText, Check, ListTodo, Navigation
} from 'lucide-react';
import { MobilityProfile, VisaStatusOption } from '../types';

interface VisaStatusWorkflowViewProps {
  profile: MobilityProfile;
  onUpdateProfile?: (updated: MobilityProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export const VisaStatusWorkflowView: React.FC<VisaStatusWorkflowViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab
}) => {
  const currentStatus: VisaStatusOption = profile.visaStatus || 'application_started';
  const origin = profile.nationality || profile.currentCountry || 'Origin Country';
  const target = profile.destinationCountries?.[0] || 'Target Destination';

  // State for interactive milestone checklists in each status view
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'app_1': true,
    'app_2': true,
    'app_3': false,
    'app_4': false,
    'granted_1': false,
    'granted_2': false,
    'novisa_1': true,
    'novisa_2': false,
  });

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleStatusChange = (newStatus: VisaStatusOption) => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        visaStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Static Visa Requirement Info helper based on Origin & Target
  const getVisaRequirementSummary = () => {
    const origLower = origin.toLowerCase();
    const targetLower = target.toLowerCase();

    if (origLower.includes('canada') || origLower.includes('united states') || origLower.includes('uk')) {
      if (targetLower.includes('portugal') || targetLower.includes('spain') || targetLower.includes('germany') || targetLower.includes('france')) {
        return {
          category: 'Short-Stay Visa Free / Long-Stay Residence Visa Required',
          details: `Passport holders from ${origin} enjoy 90-day visa-free entry into the Schengen Zone for tourism/business. However, for long-term relocation, remote work, or employment, a formal D7/D2/Digital Nomad entry visa is mandatory prior to travel.`,
          visaFreeDays: 90,
          requiresLongTermVisa: true
        };
      }
    }

    if (origLower.includes('nigeria') || origLower.includes('ghana')) {
      if (targetLower.includes('ghana') || targetLower.includes('nigeria') || targetLower.includes('sierra leone')) {
        return {
          category: 'ECOWAS Visa Exemption (No Visa Required)',
          details: `Under Article 3 of the ECOWAS Treaty, citizens of ${origin} enjoy automatic 90-day visa-free entry into ${target} with a valid International Passport or ECOWAS Brown Card. No prior visa application is required.`,
          visaFreeDays: 90,
          requiresLongTermVisa: false
        };
      } else if (targetLower.includes('rwanda')) {
        return {
          category: 'African Union Visa-on-Arrival / Electronic Visa',
          details: `Citizens of ${origin} can obtain a 30-day visa on arrival at Kigali International Airport or apply for an instant East Africa Tourist Visa.`,
          visaFreeDays: 30,
          requiresLongTermVisa: false
        };
      }
    }

    return {
      category: 'Standard Consular Visa Required',
      details: `Passport holders from ${origin} traveling to ${target} are subject to statutory visa regulations. Check specific consular requirements for financial proof, criminal background checks, and health insurance.`,
      visaFreeDays: 0,
      requiresLongTermVisa: true
    };
  };

  const reqSummary = getVisaRequirementSummary();

  const handleGenerateAiGuidance = () => {
    setLoadingAi(true);
    setTimeout(() => {
      if (currentStatus === 'application_started') {
        setAiAdvice(
          `AI Strategic Checklist for ${target} Visa Approval:\n` +
          `1. Ensure remote income proof shows at least €3,280/mo (4x Portuguese statutory threshold) deposited consistently.\n` +
          `2. Verify police criminal record certificate has an official Apostille stamp dated within the last 90 days.\n` +
          `3. Prepare 12-month lease agreement or NIF tax registration for your VFS biometrics interview.`
        );
      } else if (currentStatus === 'visa_granted') {
        setAiAdvice(
          `AI Travel & Entry Execution Plan:\n` +
          `1. Book entry flight to ${target} within the 120-day validity window of your consular stamp.\n` +
          `2. Schedule your AIMA/SEF residence permit biometrics appointment for Lisbon/Porto.\n` +
          `3. Secure temporary 30-day accommodation while transferring local lease registration.`
        );
      } else if (currentStatus === 'no_visa_required') {
        setAiAdvice(
          `AI Visa-Exempt Travel Advice:\n` +
          `1. Confirm passport has at least 6 months validity remaining from entry date.\n` +
          `2. Keep printed return ticket and proof of funds ($1,500+) accessible at border control.\n` +
          `3. Set up safety check-in reminders and share emergency contact permissions.`
        );
      } else if (currentStatus === 'visa_denied') {
        setAiAdvice(
          `AI Refusal Analysis & Appeal Strategy:\n` +
          `1. Review official refusal letter code (e.g. Clause 2 insufficient financial proof).\n` +
          `2. File administrative appeal within 15 statutory business days with certified bank affidavits.\n` +
          `3. Alternatively, evaluate fast-track pathways in Rwanda, Mauritius, or Spain.`
        );
      } else {
        setAiAdvice(`Check statutory requirements for ${target} and assemble initial identity documents.`);
      }
      setLoadingAi(false);
    }, 800);
  };

  return (
    <div className="space-y-6 bg-[#0E0E0E] border border-[#222] p-6 rounded-sm">
      {/* Target Destination & Visa Requirements Informational Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
              TARGET VISA INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-slate-200">
              {origin.toUpperCase()} ➔ {target.toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Visa Requirements for {target}</span>
          </h2>
          <p className="text-xs text-slate-200 mt-1 max-w-3xl leading-relaxed">
            {reqSummary.details}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('assessment')}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase rounded-sm transition-colors"
            >
              Run Official Eligibility Audit
            </button>
          )}
          <div className="p-3 bg-[#161616] border border-[#333] rounded-sm font-mono text-right">
            <span className="text-[9px] text-slate-200 font-bold uppercase block">Statutory Status</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">{reqSummary.category}</span>
            <span className="text-[10px] text-slate-300 block">Visa-Free Window: {reqSummary.visaFreeDays} Days</span>
          </div>
        </div>
      </div>

      {/* VISA STATUS SELECTOR (5 Options: none, application_started, visa_granted, visa_denied, no_visa_required) */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono text-slate-200 font-bold uppercase tracking-widest block">
          UPDATE CURRENT VISA STATUS:
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Status 1: Not Started / None */}
          <button
            type="button"
            onClick={() => handleStatusChange('none')}
            className={`p-3 border rounded-sm text-left transition-all ${
              currentStatus === 'none'
                ? 'bg-[#222] border-white text-white font-bold ring-2 ring-white/20'
                : 'bg-[#141414] border-[#2B2B2B] text-slate-200 hover:text-white hover:border-[#444]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">Not Started</span>
              <Clock className="w-4 h-4 text-slate-200" />
            </div>
            <p className="text-[9px] text-slate-300 mt-1 font-mono">No Visa Initiated</p>
          </button>

          {/* Status 2: Application Started */}
          <button
            type="button"
            onClick={() => handleStatusChange('application_started')}
            className={`p-3 border rounded-sm text-left transition-all ${
              currentStatus === 'application_started'
                ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300 font-bold ring-2 ring-yellow-500/30'
                : 'bg-[#141414] border-[#2B2B2B] text-slate-200 hover:text-white hover:border-[#444]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">App Started</span>
              <FileCheck className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-[9px] text-yellow-500/80 mt-1 font-mono">Applied / In Progress</p>
          </button>

          {/* Status 3: Visa Granted */}
          <button
            type="button"
            onClick={() => handleStatusChange('visa_granted')}
            className={`p-3 border rounded-sm text-left transition-all ${
              currentStatus === 'visa_granted'
                ? 'bg-green-950/60 border-green-500 text-green-300 font-bold ring-2 ring-green-500/30'
                : 'bg-[#141414] border-[#2B2B2B] text-slate-200 hover:text-white hover:border-[#444]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">Visa Granted</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-[9px] text-green-400/80 mt-1 font-mono">Approved / Issued</p>
          </button>

          {/* Status 4: No Visa Required */}
          <button
            type="button"
            onClick={() => handleStatusChange('no_visa_required')}
            className={`p-3 border rounded-sm text-left transition-all ${
              currentStatus === 'no_visa_required'
                ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-bold ring-2 ring-blue-500/30'
                : 'bg-[#141414] border-[#2B2B2B] text-slate-200 hover:text-white hover:border-[#444]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">Exempt</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[9px] text-blue-400/80 mt-1 font-mono">No Visa Required</p>
          </button>

          {/* Status 5: Visa Denied */}
          <button
            type="button"
            onClick={() => handleStatusChange('visa_denied')}
            className={`p-3 border rounded-sm text-left transition-all ${
              currentStatus === 'visa_denied'
                ? 'bg-red-950/60 border-red-500 text-red-300 font-bold ring-2 ring-red-500/30'
                : 'bg-[#141414] border-[#2B2B2B] text-slate-200 hover:text-white hover:border-[#444]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">Denied</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-[9px] text-red-400/80 mt-1 font-mono">Refused / Rejected</p>
          </button>
        </div>
      </div>

      {/* DYNAMIC WORKFLOW & ACTION HUB BASED ON STATUS */}

      {/* CASE 1: APPLICATION STARTED -> "Begin to work with user to achieve the visa" */}
      {currentStatus === 'application_started' && (
        <div className="p-6 bg-[#14120B] border-2 border-yellow-500/80 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-yellow-500/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase rounded">
                  ACTIVE VISA WORKFLOW
                </span>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  Visa Application Started: Let's Work Together to Achieve Your Visa!
                </h3>
              </div>
              <p className="text-xs text-yellow-200/80 mt-1">
                Follow statutory document requirements, track milestone progress, and use AI guidance to secure visa approval.
              </p>
            </div>

            <button
              onClick={handleGenerateAiGuidance}
              disabled={loadingAi}
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-sm tracking-widest flex items-center gap-2 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAi ? 'Analyzing Criteria...' : 'AI Visa Approval Strategy'}
            </button>
          </div>

          {/* Actionable Steps Checklist to Achieve Visa */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-yellow-400" />
              <span>Step-by-Step Milestones to Achieve Visa Approval ({target})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => toggleStep('app_1')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['app_1'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#1A1A1A] border-[#333] hover:border-yellow-500/50'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['app_1'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['app_1'] ? 'line-through text-green-300' : 'text-white'}`}>
                    1. Consular Document Preparation & Apostille
                  </p>
                  <p className="text-[10px] text-slate-200 mt-0.5 font-mono">
                    Police criminal background check with embassy apostille & passport validity check.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleStep('app_2')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['app_2'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#1A1A1A] border-[#333] hover:border-yellow-500/50'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['app_2'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['app_2'] ? 'line-through text-green-300' : 'text-white'}`}>
                    2. Proof of Liquid Funds & Income Audit
                  </p>
                  <p className="text-[10px] text-slate-200 mt-0.5 font-mono">
                    Bank statements showing statutory minimum monthly threshold (e.g. €3,280/mo).
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleStep('app_3')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['app_3'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#1A1A1A] border-[#333] hover:border-yellow-500/50'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['app_3'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['app_3'] ? 'line-through text-green-300' : 'text-white'}`}>
                    3. International Medical Insurance Policy
                  </p>
                  <p className="text-[10px] text-slate-200 mt-0.5 font-mono">
                    Minimum €30,000 Schengen or target country health repatriation coverage.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleStep('app_4')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['app_4'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#1A1A1A] border-[#333] hover:border-yellow-500/50'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['app_4'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['app_4'] ? 'line-through text-green-300' : 'text-white'}`}>
                    4. VFS Consular Biometrics & Interview Submission
                  </p>
                  <p className="text-[10px] text-slate-200 mt-0.5 font-mono">
                    Schedule consular submission and practice interview questions in Interview Workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-yellow-500/30">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('interview')}
                  className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-1.5"
                >
                  <span>Practice Interview Questions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="px-4 py-2.5 bg-[#222] hover:bg-[#333] text-white text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-1.5 border border-[#444]"
                >
                  <span>Track & Scan Visa Documents</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CASE 2: VISA GRANTED -> "Move on to travel planning" */}
      {currentStatus === 'visa_granted' && (
        <div className="p-6 bg-[#0B1A10] border-2 border-green-500 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-green-500/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-black uppercase rounded">
                  PASSPORT STAMPED
                </span>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  Visa Granted! Move On to Travel & Arrival Planning
                </h3>
              </div>
              <p className="text-xs text-green-200/80 mt-1">
                Your visa is approved! Prepare your flight itinerary, lease deposit, customs registration, and entry date.
              </p>
            </div>

            <button
              onClick={handleGenerateAiGuidance}
              disabled={loadingAi}
              className="px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs rounded-sm tracking-widest flex items-center gap-2 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAi ? 'Generating Plan...' : 'AI Travel Execution Guide'}
            </button>
          </div>

          {/* Travel Planning Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Plane className="w-4 h-4 text-green-400" />
              <span>Travel & Relocation Execution Checklist</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => toggleStep('granted_1')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['granted_1'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#141F17] border-green-900/50 hover:border-green-500'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['granted_1'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['granted_1'] ? 'line-through text-green-300' : 'text-white'}`}>
                    1. Entry Flight & Baggage Allowance Booking
                  </p>
                  <p className="text-[10px] text-green-200/70 mt-0.5 font-mono">
                    Book arrival flight within visa entry window & check baggage customs regulations.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleStep('granted_2')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['granted_2'] ? 'bg-[#0A0A0A] border-green-500/40 opacity-80' : 'bg-[#141F17] border-green-900/50 hover:border-green-500'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['granted_2'] ? 'bg-green-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['granted_2'] ? 'line-through text-green-300' : 'text-white'}`}>
                    2. Housing Lease & Initial Deposit Transfer
                  </p>
                  <p className="text-[10px] text-green-200/70 mt-0.5 font-mono">
                    Confirm residential lease agreement & local bank transfer for security deposit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-green-500/30">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('relocation')}
                className="px-5 py-3 bg-green-500 hover:bg-green-400 text-black text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Launch Full Relocation & Travel Roadmap</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CASE 3: NO VISA REQUIRED -> "Move to travel plans and advisory" */}
      {currentStatus === 'no_visa_required' && (
        <div className="p-6 bg-[#09151C] border-2 border-blue-500 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500 text-black text-[10px] font-black uppercase rounded">
                  DIRECT PASSAGE PERMITTED
                </span>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  No Visa Required! Move to Travel Plans & Advisories
                </h3>
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                You hold visa-exempt status for {target}. Proceed directly with travel logistics, entry conditions, and safety advisories.
              </p>
            </div>

            <button
              onClick={handleGenerateAiGuidance}
              disabled={loadingAi}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-black font-black uppercase text-xs rounded-sm tracking-widest flex items-center gap-2 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {loadingAi ? 'Analyzing Advisories...' : 'AI Travel & Safety Advisory'}
            </button>
          </div>

          {/* Visa Exempt Travel Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Travel & Entry Compliance Checklist</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => toggleStep('novisa_1')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['novisa_1'] ? 'bg-[#0A0A0A] border-blue-500/40 opacity-80' : 'bg-[#0E1A24] border-blue-900/50 hover:border-blue-500'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['novisa_1'] ? 'bg-blue-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['novisa_1'] ? 'line-through text-blue-300' : 'text-white'}`}>
                    1. Verify Minimum 6-Month Passport Validity
                  </p>
                  <p className="text-[10px] text-blue-200/70 mt-0.5 font-mono">
                    Ensure passport does not expire within 6 months of entry date.
                  </p>
                </div>
              </div>

              <div
                onClick={() => toggleStep('novisa_2')}
                className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                  completedSteps['novisa_2'] ? 'bg-[#0A0A0A] border-blue-500/40 opacity-80' : 'bg-[#0E1A24] border-blue-900/50 hover:border-blue-500'
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                  completedSteps['novisa_2'] ? 'bg-blue-500 text-black' : 'border border-[#555] text-transparent'
                }`}>
                  ✓
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase ${completedSteps['novisa_2'] ? 'line-through text-blue-300' : 'text-white'}`}>
                    2. Return Ticket & Proof of Sufficient Funds
                  </p>
                  <p className="text-[10px] text-blue-200/70 mt-0.5 font-mono">
                    Have printed return/onward flight confirmation & bank statement ready for immigration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-blue-500/30">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('relocation')}
                  className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-black text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
                >
                  <Plane className="w-4 h-4" />
                  <span>Launch Travel & Housing Roadmap</span>
                </button>
                <button
                  onClick={() => onNavigateTab('alerts')}
                  className="px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333] text-white text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-2"
                >
                  <span>Check Travel Advisories & Policy Alerts</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CASE 4: VISA DENIED -> "Refusal Analysis & Alternative Pathways" */}
      {currentStatus === 'visa_denied' && (
        <div className="p-6 bg-[#1C0A0A] border-2 border-red-600 rounded-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-600/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase rounded">
                  REFUSAL ACTION REQUIRED
                </span>
                <h3 className="text-base font-black uppercase text-white tracking-wider">
                  Visa Application Denied: Appeal & Alternative Pathways
                </h3>
              </div>
              <p className="text-xs text-red-200/80 mt-1">
                Do not panic. We can analyze refusal grounds, file a formal administrative appeal, or pivot to alternative visa categories.
              </p>
            </div>

            <button
              onClick={handleGenerateAiGuidance}
              disabled={loadingAi}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-sm tracking-widest flex items-center gap-2 transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4 text-white" />
              {loadingAi ? 'Analyzing Refusal...' : 'AI Refusal Appeal Strategy'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-[#0A0A0A] border border-red-900/40 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">STRATEGY 01</span>
              <h5 className="text-xs font-bold text-white uppercase">Analyze Refusal Letter</h5>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Check specific refusal clauses (e.g. Clause 2 insufficient income proof or doubts on intention to return).
              </p>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-red-900/40 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">STRATEGY 02</span>
              <h5 className="text-xs font-bold text-white uppercase">File Administrative Appeal</h5>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Submit formal appeal letter with updated bank affidavits within 15 statutory business days.
              </p>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-red-900/40 rounded-sm space-y-2">
              <span className="text-[10px] font-mono text-red-400 font-bold uppercase block">STRATEGY 03</span>
              <h5 className="text-xs font-bold text-white uppercase">Pivot Destination Pathway</h5>
              <p className="text-[11px] text-red-200/80 leading-relaxed">
                Explore fast-track alternative destinations (e.g. Rwanda, Mauritius, Portugal Tech Visa).
              </p>
            </div>
          </div>

          {onNavigateTab && (
            <div className="pt-2 border-t border-red-600/30">
              <button
                onClick={() => onNavigateTab('intelligence')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-sm flex items-center gap-2"
              >
                <span>Explore Alternative Destination Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CASE 5: NONE -> "Not Started" */}
      {currentStatus === 'none' && (
        <div className="p-6 bg-[#141414] border border-[#333] rounded-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black uppercase text-white tracking-wider">
                No Visa Application Initiated Yet
              </h3>
              <p className="text-xs text-slate-200 mt-1">
                Review visa requirements for {target} above and click below to begin your application workflow.
              </p>
            </div>

            <button
              onClick={() => handleStatusChange('application_started')}
              className="px-5 py-3 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider rounded-sm flex items-center gap-2 transition-colors shrink-0"
            >
              <FileCheck className="w-4 h-4 text-black" />
              <span>Begin Visa Application</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Advice Output Display Box */}
      {aiAdvice && (
        <div className="p-4 bg-[#111] border border-amber-500/50 rounded-sm space-y-2 font-mono text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Gemini AI Visa & Travel Recommendation</span>
          </div>
          <pre className="whitespace-pre-wrap text-[#DDD] leading-relaxed font-mono text-[11px]">
            {aiAdvice}
          </pre>
        </div>
      )}
    </div>
  );
};
