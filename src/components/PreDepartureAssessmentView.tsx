import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Sparkles, Scale, 
  Clock, ArrowRight, FileCheck, HelpCircle, Check, Info, FileText, 
  Building2, Globe, UserCheck, RefreshCw, AlertCircle, PlaneTakeoff, HeartHandshake,
  Printer, Download, ExternalLink, Sliders
} from 'lucide-react';
import { MobilityProfile, RelocationPlan } from '../types';
import { getVisaOptionsForRoute, VisaOption } from '../lib/visaRequirements';
import { checkProfileCompleteness } from '../lib/profileUtils';

interface PreDepartureAssessmentViewProps {
  profile: MobilityProfile;
  plan?: RelocationPlan;
  onUpdateProfile?: (updated: MobilityProfile) => void;
  onNavigateTab?: (tab: string) => void;
}

export interface AssessmentResult {
  status: 'qualified' | 'conditional' | 'unqualified';
  score: number; // 0-100
  headline: string;
  summary: string;
  matchedVisas: Array<{
    option: VisaOption;
    metRequirements: string[];
    missingRequirements: string[];
    isRecommended: boolean;
  }>;
  preDepartureSteps: Array<{
    id: string;
    title: string;
    description: string;
    mandatory: boolean;
    category: 'legal' | 'finance' | 'insurance' | 'housing';
  }>;
  postArrivalSteps: Array<{
    id: string;
    title: string;
    timeframe: string;
    description: string;
  }>;
  criticalPitfalls: string[];
  officialPortalUrl?: string;
  officialAgencyName?: string;
}

export const PreDepartureAssessmentView: React.FC<PreDepartureAssessmentViewProps> = ({
  profile,
  plan,
  onUpdateProfile,
  onNavigateTab
}) => {
  // Form State
  const [originCountry, setOriginCountry] = useState<string>(plan?.originCountry || profile.currentCountry || profile.nationality || '');
  const [targetCountry, setTargetCountry] = useState<string>(plan?.destinationCountry || profile.destinationCountries?.[0] || '');
  const [currentResidence, setCurrentResidence] = useState<string>(plan?.originCountry || profile.currentCountry || profile.nationality || '');
  
  const [purpose, setPurpose] = useState<string>(profile.purposeOfTravel || 'relocation');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(3500);
  const [savingsCapital, setSavingsCapital] = useState<number>(profile.budget || 25000);
  const [employerType, setEmployerType] = useState<'foreign_remote' | 'local_offer' | 'self_employed' | 'none'>('foreign_remote');
  
  const [educationLevel, setEducationLevel] = useState<string>('Bachelors Degree');
  const [hasCleanPoliceCheck, setHasCleanPoliceCheck] = useState<boolean>(true);
  const [hasHealthInsurance, setHasHealthInsurance] = useState<boolean>(true);
  const [hasHousingProof, setHasHousingProof] = useState<boolean>(false);
  const [hasPassportValidity, setHasPassportValidity] = useState<boolean>(true);

  // Evaluation & Results
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [selectedVisaId, setSelectedVisaId] = useState<string>('');
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  
  // Attorney Booking Modal State
  const [showAttorneyModal, setShowAttorneyModal] = useState<boolean>(false);
  const [attorneyBookingSubmitted, setAttorneyBookingSubmitted] = useState<boolean>(false);
  const [clientNotes, setClientNotes] = useState<string>('');

  useEffect(() => {
    const effOrigin = plan?.originCountry || profile.currentCountry || profile.nationality || '';
    const effDest = plan?.destinationCountry || profile.destinationCountries?.[0] || '';
    if (effOrigin) {
      setOriginCountry(effOrigin);
      setCurrentResidence(effOrigin);
    }
    if (effDest) setTargetCountry(effDest);
    if (profile.purposeOfTravel) setPurpose(profile.purposeOfTravel);
    if (profile.budget) setSavingsCapital(profile.budget);
  }, [plan?.originCountry, plan?.destinationCountry, profile]);

  const handleRunAssessment = () => {
    setEvaluating(true);
    setSyncSuccess(false);

    setTimeout(() => {
      const visaData = getVisaOptionsForRoute(originCountry, currentResidence, [targetCountry], purpose);
      
      let status: 'qualified' | 'conditional' | 'unqualified' = 'qualified';
      let score = 85;
      const criticalPitfalls: string[] = [];

      // Destination official agency lookup
      const destLower = targetCountry.toLowerCase();
      let agencyName = 'National Immigration Directorate';
      let portalUrl = 'https://www.gov.uk/browse/visas-immigration';

      if (destLower.includes('portugal')) {
        agencyName = 'AIMA (Agency for Integration, Migration and Asylum - Portugal)';
        portalUrl = 'https://aima.gov.pt/';
      } else if (destLower.includes('uk') || destLower.includes('united kingdom')) {
        agencyName = 'UK Visas and Immigration (UKVI - Home Office)';
        portalUrl = 'https://www.gov.uk/browse/visas-immigration';
      } else if (destLower.includes('canada')) {
        agencyName = 'IRCC (Immigration, Refugees and Citizenship Canada)';
        portalUrl = 'https://www.canada.ca/en/services/immigration-citizenship.html';
      } else if (destLower.includes('united states') || destLower.includes('usa') || destLower.includes('us')) {
        agencyName = 'USCIS (US Citizenship and Immigration Services)';
        portalUrl = 'https://www.uscis.gov/';
      } else if (destLower.includes('germany')) {
        agencyName = 'BAMF / Make It In Germany (Federal Employment Agency)';
        portalUrl = 'https://www.make-it-in-germany.com/';
      } else if (destLower.includes('spain')) {
        agencyName = 'Ministerio de Inclusión, Seguridad Social y Migraciones (Spain)';
        portalUrl = 'https://www.inclusion.gob.es/';
      } else if (destLower.includes('uae') || destLower.includes('dubai')) {
        agencyName = 'GDRFA Dubai / ICP UAE';
        portalUrl = 'https://icp.gov.ae/';
      }

      // Evaluation Rules Engine
      if (purpose === 'digital_nomad' || purpose === 'relocation') {
        if (monthlyIncome < 3280 && destLower.includes('portugal')) {
          status = 'conditional';
          score -= 25;
          criticalPitfalls.push(`Income of $${monthlyIncome}/mo falls short of Portugal D8 Digital Nomad statutory threshold (€3,280/mo or 4x minimum wage). You must supplement with proven savings or secondary income.`);
        }
      }

      if (employerType === 'none' && purpose === 'work') {
        status = 'conditional';
        score -= 30;
        criticalPitfalls.push(`Local work permits in ${targetCountry} strictly require a formal job offer from an accredited sponsor before applying. You cannot engage in local employment without a valid work authorization.`);
      }

      if (!hasCleanPoliceCheck) {
        status = 'unqualified';
        score -= 40;
        criticalPitfalls.push(`A clean police criminal record check with an official Apostille/Legalization stamp (valid within 90 days) is a strict statutory requirement for residence visas in ${targetCountry}.`);
      }

      if (!hasPassportValidity) {
        status = 'conditional';
        score -= 15;
        criticalPitfalls.push(`Your passport must have at least 6 months validity remaining beyond your intended entry date to avoid immediate boarding refusal at airport control.`);
      }

      if (!hasHealthInsurance) {
        score -= 15;
      }

      if (!hasHousingProof) {
        score -= 10;
      }

      if (score < 50 && status !== 'unqualified') {
        status = 'unqualified';
      }

      // Add general critical warnings
      criticalPitfalls.push(`NEVER enter ${targetCountry} on a short-stay tourist visa intending to engage in local employment without a pre-approved work visa — doing so risks deportation, fines, and a multi-year Schengen/EU entry ban.`);
      criticalPitfalls.push(`Ensure your health insurance policy specifically includes repatriation coverage of at least €30,000 for Schengen states.`);

      // Matched Visas mapping
      const matchedVisas = visaData.options.map((opt, idx) => {
        const metReqs: string[] = [];
        const missingReqs: string[] = [];

        if (monthlyIncome >= 3200) metReqs.push(`Proven income ($${monthlyIncome.toLocaleString()}/mo) meets statutory requirements.`);
        else missingReqs.push(`Proven monthly income ($${monthlyIncome.toLocaleString()}) is below recommended threshold.`);

        if (savingsCapital >= 10000) metReqs.push(`Liquid capital ($${savingsCapital.toLocaleString()}) covers initial relocation buffer.`);
        else missingReqs.push(`Liquid capital ($${savingsCapital.toLocaleString()}) is below recommended €10,000 emergency buffer.`);

        if (hasCleanPoliceCheck) metReqs.push('Police background check cleared.');
        else missingReqs.push('Missing apostilled police criminal clearance certificate.');

        if (hasHealthInsurance) metReqs.push('International health & repatriation insurance verified.');
        else missingReqs.push('Health insurance policy not yet secured.');

        return {
          option: opt,
          metRequirements: metReqs,
          missingRequirements: missingReqs,
          isRecommended: idx === 0
        };
      });

      if (matchedVisas.length > 0 && !selectedVisaId) {
        setSelectedVisaId(matchedVisas[0].option.id);
      }

      const preDepartureSteps = [
        {
          id: 'step_police',
          title: 'Obtain Police Criminal Background Check with Apostille',
          description: 'Request official federal police clearance from your origin country and obtain an official Apostille stamp (valid within 90 days).',
          mandatory: true,
          category: 'legal' as const
        },
        {
          id: 'step_funds',
          title: 'Assemble Notarized 6-Month Bank Statements & NIF Account',
          description: 'Prepare stamped official bank statements demonstrating statutory income or liquid balance. If relocating to Portugal/EU, register NIF tax number and open local bank account.',
          mandatory: true,
          category: 'finance' as const
        },
        {
          id: 'step_insurance',
          title: 'Secure €30,000+ Schengen Medical & Repatriation Policy',
          description: 'Purchase comprehensive international health insurance covering emergency medical expenses and medical repatriation.',
          mandatory: true,
          category: 'insurance' as const
        },
        {
          id: 'step_accommodation',
          title: 'Secure 12-Month Registered Lease or Accommodation Proof',
          description: 'Obtain a registered long-term lease contract (e.g. Junta de Freguesia attested in Portugal) or temporary official host declaration for your consular application.',
          mandatory: true,
          category: 'housing' as const
        }
      ];

      const postArrivalSteps = [
        {
          id: 'post_biometrics',
          title: `Attend ${agencyName} Immigration Biometrics Appointment`,
          timeframe: 'Within 90-120 Days of Arrival',
          description: 'Present original documents, submit biometric fingerprints, and obtain your physical Resident Card.'
        },
        {
          id: 'post_tax',
          title: 'Register Local Tax Identification Number & Social Security',
          timeframe: 'Within 30 Days of Arrival',
          description: 'Register with local tax authority (e.g., Finanças in Portugal / HMRC in UK) to ensure legal work status and 183-day tax compliance.'
        },
        {
          id: 'post_parish',
          title: 'Register Address with Local Parish / Town Hall (Junta)',
          timeframe: 'Within 14 Days of Arrival',
          description: 'Submit lease agreement to your local parish council to receive proof of address certificate required for healthcare registration.'
        }
      ];

      setAssessmentResult({
        status,
        score: Math.max(10, score),
        headline: status === 'qualified'
          ? `High Eligibility for ${targetCountry} Visa & Relocation`
          : status === 'conditional'
          ? `Conditional Eligibility: Immediate Pre-Departure Action Required`
          : `High Risk of Refusal: Mandatory Requirement Gaps Identified`,
        summary: `Assessment parsed origin passport (${originCountry}) against destination regulations in ${targetCountry} for ${purpose.replace('_', ' ')}. Review pre-departure statutory requirements below before booking travel.`,
        matchedVisas,
        preDepartureSteps,
        postArrivalSteps,
        criticalPitfalls,
        officialAgencyName: agencyName,
        officialPortalUrl: portalUrl
      });

      setEvaluating(false);
    }, 500);
  };

  useEffect(() => {
    handleRunAssessment();
  }, [originCountry, targetCountry, purpose, monthlyIncome, savingsCapital, employerType, hasCleanPoliceCheck, hasHealthInsurance, hasHousingProof, hasPassportValidity]);

  const handleApplyToProfile = () => {
    if (!onUpdateProfile || !assessmentResult) return;

    const matched = assessmentResult.matchedVisas.find(v => v.option.id === selectedVisaId) || assessmentResult.matchedVisas[0];
    const visaName = matched ? matched.option.name : 'Selected Visa Category';

    const updatedProfile: MobilityProfile = {
      ...profile,
      nationality: originCountry,
      currentCountry: currentResidence,
      destinationCountries: [targetCountry],
      purposeOfTravel: purpose as any,
      visaType: visaName,
      visaStatus: 'application_started',
      budget: savingsCapital,
      updatedAt: new Date().toISOString()
    };

    onUpdateProfile(updatedProfile);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const profileCompleteness = checkProfileCompleteness(profile);

  return (
    <div className="space-y-6">
      {/* Profile Requirement Warning Banner */}
      {!profileCompleteness.isFilled && (
        <div className="p-4 bg-amber-950/40 border-2 border-amber-500/60 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  Profile Update Required for Accurate Visa Chance Assessment
                </h4>
                <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-[10px] font-mono font-bold rounded">
                  {profileCompleteness.percentage}% Complete
                </span>
              </div>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                To evaluate your visa chances accurately and provide statutory advice, Pathway AI needs your complete profile details ({profileCompleteness.missingFields.map(f => f.label).join(', ')}). Please update your profile before relying on visa chance assessments.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Update Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Module Banner */}
      <div className="p-6 bg-[#0E0E0E] border border-[#222] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black uppercase rounded">
              OFFICIAL IMMIGRATION CHECKER
            </span>
            <span className="text-xs font-mono text-[#888]">
              STATUTORY WORK PERMIT & VISA ELIGIBILITY AUDIT
            </span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            <span>Pre-Departure Visa & Work Permit Eligibility Assessment</span>
          </h2>
          <p className="text-xs text-[#AAA] mt-1 max-w-3xl leading-relaxed">
            Understand exactly what you must do BEFORE traveling into target countries. Avoid visa refusals, illegal work violations, and border entry rejections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assessmentResult && (
            <button
              onClick={handlePrintReport}
              className="px-4 py-3 bg-[#1D1D1D] hover:bg-[#2A2A2A] border border-[#333] text-white font-black uppercase text-xs tracking-wider rounded-sm flex items-center gap-2 transition-colors shrink-0"
              title="Print or Save Official Assessment Report as PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Export PDF</span>
            </button>
          )}
          <button
            onClick={handleRunAssessment}
            disabled={evaluating}
            className="px-5 py-3 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider rounded-sm flex items-center gap-2 transition-colors shrink-0"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Re-Run Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Questionnaire Form */}
      <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2 border-b border-[#222] pb-3">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>01. Relocation & Employment Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Passport */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Origin Passport / Citizenship</label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="e.g. Canada"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Current Residence */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Current Country of Residence</label>
            <input
              type="text"
              value={currentResidence}
              onChange={(e) => setCurrentResidence(e.target.value)}
              placeholder="e.g. Canada"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Target Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Target Destination Country</label>
            <input
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="e.g. Portugal"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Purpose */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Primary Relocation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="visit">Short Visit / Tourism / Visitor Visa</option>
              <option value="digital_nomad">Digital Nomad / Remote Work</option>
              <option value="work">Local Employment & Skilled Work</option>
              <option value="relocation">Long-Term Residence / D7 Passive</option>
              <option value="education">Higher Education / Student</option>
              <option value="family">Family Reunification</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#222]">
          {/* Monthly Income */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Monthly Proven Income ($ USD / € EUR)</label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              placeholder="3500"
              className="w-full bg-[#181818] border border-[#333] text-amber-400 font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Savings Capital */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Liquid Bank Capital / Savings ($ USD)</label>
            <input
              type="number"
              value={savingsCapital}
              onChange={(e) => setSavingsCapital(Number(e.target.value))}
              placeholder="25000"
              className="w-full bg-[#181818] border border-[#333] text-amber-400 font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Employer Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Employment / Sponsor Status</label>
            <select
              value={employerType}
              onChange={(e) => setEmployerType(e.target.value as any)}
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="foreign_remote">Foreign / Remote Employer Contract</option>
              <option value="local_offer">Target Country Employer Job Offer</option>
              <option value="self_employed">Self-Employed / Business Founder</option>
              <option value="none">No Job Offer Yet (Job Search)</option>
            </select>
          </div>

          {/* Education Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Highest Education Attained</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Bachelors Degree">Bachelor's Degree</option>
              <option value="Masters Degree">Master's Degree / PhD</option>
              <option value="Diploma">Diploma / Vocational Cert</option>
              <option value="High School">High School Diploma</option>
            </select>
          </div>
        </div>

        {/* Pre-Departure Readiness Toggles */}
        <div className="pt-2 border-t border-[#222]">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase block">
              02. Statutory Pre-Departure Readiness Verification:
            </label>
            <span className="text-[10px] font-mono text-amber-400">Toggle criteria to simulate eligibility score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setHasCleanPoliceCheck(!hasCleanPoliceCheck)}
              className={`p-3 border rounded-sm text-left flex items-center justify-between transition-colors ${
                hasCleanPoliceCheck ? 'bg-green-950/40 border-green-500/60 text-green-300' : 'bg-[#181818] border-[#333] text-[#888]'
              }`}
            >
              <span className="text-xs font-bold uppercase">Clean Police Check (Apostilled)</span>
              {hasCleanPoliceCheck ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-[#666]" />}
            </button>

            <button
              type="button"
              onClick={() => setHasHealthInsurance(!hasHealthInsurance)}
              className={`p-3 border rounded-sm text-left flex items-center justify-between transition-colors ${
                hasHealthInsurance ? 'bg-green-950/40 border-green-500/60 text-green-300' : 'bg-[#181818] border-[#333] text-[#888]'
              }`}
            >
              <span className="text-xs font-bold uppercase">€30k Medical Insurance</span>
              {hasHealthInsurance ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-[#666]" />}
            </button>

            <button
              type="button"
              onClick={() => setHasHousingProof(!hasHousingProof)}
              className={`p-3 border rounded-sm text-left flex items-center justify-between transition-colors ${
                hasHousingProof ? 'bg-green-950/40 border-green-500/60 text-green-300' : 'bg-[#181818] border-[#333] text-[#888]'
              }`}
            >
              <span className="text-xs font-bold uppercase">Housing Lease / Proof</span>
              {hasHousingProof ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-[#666]" />}
            </button>

            <button
              type="button"
              onClick={() => setHasPassportValidity(!hasPassportValidity)}
              className={`p-3 border rounded-sm text-left flex items-center justify-between transition-colors ${
                hasPassportValidity ? 'bg-green-950/40 border-green-500/60 text-green-300' : 'bg-[#181818] border-[#333] text-[#888]'
              }`}
            >
              <span className="text-xs font-bold uppercase">Passport Valid &gt; 6 Mos</span>
              {hasPassportValidity ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-[#666]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Output Report Card */}
      {assessmentResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Status & Scorecard Header */}
          <div className={`p-6 rounded-sm border ${
            assessmentResult.status === 'qualified'
              ? 'bg-gradient-to-r from-[#0B1A10] via-[#0A140E] to-[#111] border-green-500/60'
              : assessmentResult.status === 'conditional'
              ? 'bg-gradient-to-r from-[#1C150A] via-[#141009] to-[#111] border-amber-500/60'
              : 'bg-gradient-to-r from-[#210B0B] via-[#1A0A0A] to-[#111] border-red-500/60'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-black uppercase rounded border ${
                    assessmentResult.status === 'qualified'
                      ? 'bg-green-500 text-black border-green-400'
                      : assessmentResult.status === 'conditional'
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-red-600 text-white border-red-500'
                  }`}>
                    {assessmentResult.status === 'qualified' ? 'QUALIFIED FOR RELOCATION' : assessmentResult.status === 'conditional' ? 'CONDITIONALLY ELIGIBLE' : 'HIGH RISK OF REFUSAL'}
                  </span>

                  <span className="text-xs font-mono text-[#AAA]">
                    Eligibility Index: <strong className="text-white font-bold">{assessmentResult.score}/100</strong>
                  </span>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {assessmentResult.headline}
                </h3>
                <p className="text-xs text-[#CCC] font-mono leading-relaxed max-w-3xl">
                  {assessmentResult.summary}
                </p>

                {assessmentResult.officialAgencyName && (
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-[#999] font-mono">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Statutory Authority: <strong>{assessmentResult.officialAgencyName}</strong></span>
                    {assessmentResult.officialPortalUrl && (
                      <a 
                        href={assessmentResult.officialPortalUrl}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 ml-2"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Sync Action Box */}
              <div className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2 min-w-[240px] text-right shrink-0">
                <span className="text-[10px] font-mono text-[#888] font-bold uppercase block">SYNC WITH RELOCATION ROADMAP</span>
                {syncSuccess ? (
                  <div className="py-2 text-xs font-bold text-green-400 font-mono flex items-center justify-end gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Roadmap & Profile Updated!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApplyToProfile}
                    className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-sm tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileCheck className="w-4 h-4 text-black" />
                    <span>Apply to My Roadmap</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Critical Pitfalls & Red Flags ("WHAT NOT TO DO") */}
          {assessmentResult.criticalPitfalls.length > 0 && (
            <div className="p-5 bg-[#140C0C] border border-red-600/50 rounded-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-red-600/30 pb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">
                  Critical Warnings & Fatal Relocation Pitfalls ({targetCountry})
                </h4>
              </div>

              <div className="space-y-2">
                {assessmentResult.criticalPitfalls.map((pitfall, idx) => (
                  <div key={idx} className="p-3 bg-[#0A0A0A] border border-red-900/40 rounded-sm flex items-start gap-3">
                    <span className="w-5 h-5 bg-red-600/20 text-red-400 font-mono text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </span>
                    <p className="text-xs text-[#DDD] leading-relaxed font-mono">
                      {pitfall}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Visa Categories Table */}
          <div className="p-5 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2 border-b border-[#222] pb-3">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Matched Visa & Work Permit Statutory Options ({targetCountry})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentResult.matchedVisas.map((item) => {
                const isSelected = selectedVisaId === item.option.id;
                return (
                  <div
                    key={item.option.id}
                    onClick={() => setSelectedVisaId(item.option.id)}
                    className={`p-4 border rounded-sm space-y-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18150D] border-amber-500 ring-1 ring-amber-500/40'
                        : 'bg-[#0A0A0A] border-[#333] hover:border-[#555]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-mono font-bold uppercase rounded">
                            {item.option.category}
                          </span>
                          {item.isRecommended && (
                            <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black uppercase rounded">
                              BEST MATCH
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-black text-white uppercase tracking-wider mt-1">
                          {item.option.name}
                        </h5>
                      </div>

                      <span className="text-[10px] font-mono text-[#888] whitespace-nowrap">
                        ⏱ {item.option.processingTime}
                      </span>
                    </div>

                    <p className="text-xs text-[#BBB] leading-relaxed font-mono">
                      {item.option.description}
                    </p>

                    <div className="pt-2 border-t border-[#222] space-y-1">
                      {item.metRequirements.map((m, idx) => (
                        <div key={idx} className="text-[10px] text-green-400 font-mono flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-green-400 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                      {item.missingRequirements.map((m, idx) => (
                        <div key={idx} className="text-[10px] text-amber-400 font-mono flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-Departure Mandatory Checklist ("WHAT YOU SHOULD DO BEFORE DEPARTURE") */}
          <div className="p-5 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                <PlaneTakeoff className="w-4 h-4 text-amber-400" />
                <span>WHAT YOU SHOULD DO BEFORE DEPARTURE (Mandatory Pre-Travel Checklist)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#777]">Complete in Origin Country</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessmentResult.preDepartureSteps.map((step, idx) => (
                <div key={step.id} className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                      STEP 0{idx + 1} • {step.category.toUpperCase()}
                    </span>
                    {step.mandatory && (
                      <span className="px-1.5 py-0.5 bg-red-900/40 text-red-300 text-[8px] font-mono uppercase font-bold rounded">
                        MANDATORY
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white uppercase">{step.title}</h5>
                  <p className="text-[11px] text-[#AAA] leading-relaxed font-mono">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Post-Arrival Legal Compliance Timeline ("WHAT YOU MUST DO AFTER ARRIVAL") */}
          <div className="p-5 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-green-400 font-mono flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-green-400" />
                <span>WHAT YOU MUST DO AFTER ARRIVAL (Post-Entry Compliance Timeline)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#777]">Host Country Registrations</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {assessmentResult.postArrivalSteps.map((step, idx) => (
                <div key={step.id} className="p-4 bg-[#0A0A0A] border border-[#333] rounded-sm space-y-2">
                  <span className="text-[9px] font-mono font-bold text-green-400 bg-green-950/40 px-2 py-0.5 rounded uppercase inline-block">
                    {step.timeframe}
                  </span>
                  <h5 className="text-xs font-bold text-white uppercase pt-1">{step.title}</h5>
                  <p className="text-[11px] text-[#AAA] leading-relaxed font-mono">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 183-Day Tax Residency & Legal Physical Presence Warning */}
          <div className="p-5 bg-[#12100A] border border-amber-500/40 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider font-mono">
                  183-Day Tax Physical Presence & Statutory Legal Warning ({targetCountry})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">DOUBLE TAXATION RISK CONTROL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-[#CCC]">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">183-Day Rule Limit</span>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Spending 183+ days within a calendar year in {targetCountry} automatically triggers worldwide tax residency status. Ensure you track entry/exit stamps.
                </p>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Double Taxation Treaty (DTA)</span>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Verify if {originCountry} and {targetCountry} share an active bilateral DTA to prevent paying income tax twice on remote wages.
                </p>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Employer PE Liability Risk</span>
                <p className="text-[11px] text-[#AAA] leading-relaxed">
                  Working remotely without a Nomad Visa can create Permanent Establishment (PE) corporate tax liability for your employer in {targetCountry}.
                </p>
              </div>
            </div>
          </div>

          {/* Attorney Legal Consultation Lead / Retainer Box */}
          <div className="p-5 bg-gradient-to-r from-[#111622] via-[#0E121B] to-[#111] border border-blue-500/40 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black uppercase text-blue-400 tracking-wider font-mono">
                  VERIFIED IMMIGRATION ATTORNEY REVIEW AVAILABLE
                </span>
              </div>
              <p className="text-xs text-[#BBB] font-mono max-w-2xl leading-relaxed">
                Need a certified immigration lawyer in {targetCountry} to review your document package, verify income proof, or file your consular application? Request a formal legal consultation case packet.
              </p>
            </div>

            <button
              onClick={() => setShowAttorneyModal(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider rounded-sm flex items-center gap-2 transition-colors shrink-0 shadow-lg"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Request Attorney File Review</span>
            </button>
          </div>

          {/* Quick Shortcuts to Related App Modules */}
          <div className="p-4 bg-[#0A0A0A] border border-[#222] rounded-sm flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-[#888]">
              Ready for the next step in your immigration workflow?
            </div>

            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <>
                  <button
                    onClick={() => onNavigateTab('documents')}
                    className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white font-mono text-xs rounded-sm transition-colors"
                  >
                    Scan & Encrypt Documents (OCR)
                  </button>
                  <button
                    onClick={() => onNavigateTab('interview')}
                    className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white font-mono text-xs rounded-sm transition-colors"
                  >
                    Consular Interview Prep Workspace
                  </button>
                  <button
                    onClick={() => onNavigateTab('relocation')}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-xs rounded-sm transition-colors"
                  >
                    View Relocation Roadmap
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Statutory Legal Disclaimer */}
          <div className="p-4 bg-[#080808] border border-[#1C1C1C] rounded-sm text-[10px] text-[#666] font-mono leading-relaxed">
            <strong className="text-[#888] font-bold uppercase block mb-1">STATUTORY LEGAL DISCLAIMER:</strong>
            Pathway AI provides statutory informational guidance, eligibility algorithms, and document organization tools based on publicly published immigration guidelines of host country authorities ({assessmentResult.officialAgencyName || 'Government Immigration Services'}). This software does not provide legal representation, formal legal advice, or guarantees of visa issuance or border entry approval. Statutory requirements, income thresholds, and consular procedures are subject to change without notice by government authorities. Always verify final application packages with a qualified immigration lawyer or official consular mission.
          </div>
        </div>
      )}

      {/* --- ATTORNEY CONSULTATION MODAL --- */}
      {showAttorneyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111] border border-blue-500/50 max-w-xl w-full p-6 rounded-sm space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                  Request Vetted Immigration Attorney File Audit
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAttorneyModal(false);
                  setAttorneyBookingSubmitted(false);
                }}
                className="text-[#888] hover:text-white text-xs font-mono uppercase"
              >
                ✕ Close
              </button>
            </div>

            {attorneyBookingSubmitted ? (
              <div className="p-6 bg-blue-950/40 border border-blue-500/50 rounded-sm text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
                <h4 className="text-base font-black text-white uppercase font-mono">Case Packet Generated & Sent</h4>
                <p className="text-xs text-[#CCC] font-mono leading-relaxed">
                  Your Pre-Departure Assessment scorecard and encrypted relocation metadata for <strong>{targetCountry}</strong> have been compiled into a confidential case file. A licensed partner immigration attorney will review your parameters within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setShowAttorneyModal(false);
                    setAttorneyBookingSubmitted(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-bold uppercase text-xs rounded-sm font-mono"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4 font-mono">
                <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-1 text-xs text-[#AAA]">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">CASE SUMMARY METADATA TO ATTACH:</span>
                  <div>• Route: <strong>{originCountry} → {targetCountry}</strong> ({purpose.replace('_', ' ')})</div>
                  <div>• Statutoy Eligibility Index: <strong>{assessmentResult?.score}/100 ({assessmentResult?.status.toUpperCase()})</strong></div>
                  <div>• Target Authority: <strong>{assessmentResult?.officialAgencyName}</strong></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-[#888] font-bold uppercase">Client Additional Notes / Specific Legal Questions</label>
                  <textarea
                    rows={4}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Describe any specific visa refusal history, tax residency questions, or dependent sponsorship concerns..."
                    className="w-full bg-[#181818] border border-[#333] text-white text-xs p-3 rounded-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAttorneyModal(false)}
                    className="px-4 py-2 bg-[#222] text-[#AAA] hover:text-white font-mono text-xs uppercase rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setAttorneyBookingSubmitted(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-sm flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-white" />
                    <span>Submit File to Partner Attorney</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

