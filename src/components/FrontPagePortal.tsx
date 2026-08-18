import React, { useState, useEffect } from 'react';
import { 
  Bot, Compass, MapPin, Landmark, HeartHandshake, FileText, BookOpen, 
  Shield, Briefcase, User, ScrollText, Zap, LayoutGrid, 
  Sparkles, CheckCircle2, ShieldCheck, Plane, Plus, Calendar, Search,
  Pencil, Globe, ChevronRight, Activity, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import { 
  MobilityProfile, RelocationPlan, MobilityAlert, InterviewAppointment, MobilityDocument, VisaRecord 
} from '../types';
import { DestinationVisaSelector } from './DestinationVisaSelector';
import { getVisaOptionsForRoute } from '../lib/visaRequirements';
import pathwaiTravellers from '../../assets/pathwai-travellers.png';

interface FrontPagePortalProps {
  profile: MobilityProfile;
  plan: RelocationPlan;
  alerts: MobilityAlert[];
  interviews: InterviewAppointment[];
  documents?: MobilityDocument[];
  visaRecords?: VisaRecord[];
  onNavigateTab: (tab: string) => void;
  onUpdateProfile?: (updated: MobilityProfile) => void;
  onUpdatePlan?: (updated: RelocationPlan) => void;
  onOpenUpgradeModal?: (featureName?: string) => void;
  onOpenTour?: () => void;
  onOpenOfflineVault?: () => void;
  onSwitchToDashboardView?: () => void;
}

// Helper to map country names to flags and codes for the boarding pass UI
const getCountryInfo = (countryName: string) => {
  const name = (countryName || '').trim().toLowerCase();
  if (name.includes('canada')) return { code: 'CAN', flag: '🇨🇦', name: 'Canada' };
  if (name.includes('portugal')) return { code: 'PRT', flag: '🇵🇹', name: 'Portugal' };
  if (name.includes('nigeria')) return { code: 'NGA', flag: '🇳🇬', name: 'Nigeria' };
  if (name.includes('germany')) return { code: 'DEU', flag: '🇩🇪', name: 'Germany' };
  if (name.includes('united kingdom') || name === 'uk' || name.includes('u.k.')) return { code: 'GBR', flag: '🇬🇧', name: 'United Kingdom' };
  if (name.includes('united states') || name === 'usa' || name.includes('u.s.')) return { code: 'USA', flag: '🇺🇸', name: 'United States' };
  if (name.includes('india')) return { code: 'IND', flag: '🇮🇳', name: 'India' };
  if (name.includes('france')) return { code: 'FRA', flag: '🇫🇷', name: 'France' };
  if (name.includes('spain')) return { code: 'ESP', flag: '🇪🇸', name: 'Spain' };
  if (name.includes('italy')) return { code: 'ITA', flag: '🇮🇹', name: 'Italy' };
  if (name.includes('australia')) return { code: 'AUS', flag: '🇦🇺', name: 'Australia' };
  if (name.includes('brazil')) return { code: 'BRA', flag: '🇧🇷', name: 'Brazil' };
  
  return { 
    code: countryName ? countryName.slice(0, 3).toUpperCase() : 'WLD', 
    flag: '🌐',
    name: countryName || 'Unknown Origin'
  };
};

export const FrontPagePortal: React.FC<FrontPagePortalProps> = ({
  profile,
  plan,
  alerts,
  interviews,
  documents = [],
  visaRecords = [],
  onNavigateTab,
  onUpdateProfile,
  onUpdatePlan,
  onOpenUpgradeModal,
  onOpenTour,
  onOpenOfflineVault,
  onSwitchToDashboardView
}) => {
  const origin = plan.originCountry || profile.currentCountry || profile.nationality || '';
  const destination = plan.destinationCountry || profile.destinationCountries?.[0] || '';

  const hasActivePlan = Boolean(
    (plan.originCountry?.trim() && plan.destinationCountry?.trim()) ||
    (profile.currentCountry?.trim() && profile.destinationCountries?.[0]?.trim()) ||
    (plan.milestones && plan.milestones.length > 0)
  );

  // New plan creation form state
  const [startOrigin, setStartOrigin] = useState(plan.originCountry || profile.currentCountry || profile.nationality || '');
  const [startDestination, setStartDestination] = useState(plan.destinationCountry || profile.destinationCountries?.[0] || '');
  const [startPurpose, setStartPurpose] = useState<MobilityProfile['purposeOfTravel']>(profile.purposeOfTravel || 'relocation');
  const [startVisaType, setStartVisaType] = useState(profile.visaType || '');
  const [startTargetDate, setStartTargetDate] = useState(plan.targetDate || '2026-12-01');
  
  // UX controls for minimalist welcome page
  const [showStartForm, setShowStartForm] = useState(!hasActivePlan);
  const [showAllModules, setShowAllModules] = useState(false);

  // Filter and search state for workspace modules
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize form inputs with updated plan/profile props
  useEffect(() => {
    const effOrigin = plan.originCountry || profile.currentCountry || profile.nationality || '';
    const effDest = plan.destinationCountry || profile.destinationCountries?.[0] || '';
    if (effOrigin) setStartOrigin(effOrigin);
    if (effDest) setStartDestination(effDest);
    if (profile.purposeOfTravel) setStartPurpose(profile.purposeOfTravel);
    if (profile.visaType) setStartVisaType(profile.visaType);
    if (plan.targetDate) setStartTargetDate(plan.targetDate);
  }, [plan.originCountry, plan.destinationCountry, plan.targetDate, profile.currentCountry, profile.nationality, profile.destinationCountries, profile.purposeOfTravel, profile.visaType]);

  // Dynamically update available visa options when purpose or destination changes
  useEffect(() => {
    if (startDestination) {
      const assessment = getVisaOptionsForRoute('', '', [startDestination], startPurpose);
      if (assessment.options && assessment.options.length > 0) {
        const matched = assessment.options.find(o => o.name === startVisaType);
        if (!matched) {
          setStartVisaType(assessment.options[0].name);
        }
      }
    }
  }, [startPurpose, startDestination]);

  const pendingDocsCount = documents.filter(d => 
    d.status === 'pending_submission' || d.status === 'expiring_soon' || d.status === 'expired'
  ).length;

  const activeAlertsCount = alerts.filter(a => a.severity === 'high').length;

  const completedMilestones = plan.milestones ? plan.milestones.filter(m => m.completed).length : 0;
  const totalMilestones = plan.milestones ? plan.milestones.length : 0;
  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  
  // Find next uncompleted milestone
  const nextMilestone = plan.milestones ? plan.milestones.find(m => !m.completed) : null;

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startOrigin.trim() || !startDestination.trim()) return;

    const newPlan: RelocationPlan = {
      id: plan.id && plan.id !== 'plan_portugal_d7' ? plan.id : `plan_${Date.now()}`,
      userId: profile.userId || 'user',
      title: `${startOrigin} to ${startDestination} Mobility Roadmap`,
      originCountry: startOrigin,
      destinationCountry: startDestination,
      currentPhase: plan.currentPhase || 'Eligibility',
      targetDate: startTargetDate || plan.targetDate || '2026-12-01',
      milestones: (plan.milestones && plan.milestones.length > 0) ? plan.milestones : [
        { id: 'm1', title: `NIF / Tax ID & ${startDestination} Bank Account Setup`, dueDate: '', completed: false, stage: 'Eligibility', notes: 'Initial statutory administrative setup.' },
        { id: 'm2', title: 'Proof of Funds & Housing Lease/Booking', dueDate: '', completed: false, stage: 'Documentation', notes: 'Gather financial statements and residence proof.' },
        { id: 'm3', title: 'VFS / Consular Biometrics Appointment', dueDate: '', completed: false, stage: 'Interview', notes: 'Submit biometrics and original documents.' },
        { id: 'm4', title: 'Consular Visa Stamp & Flight Confirmation', dueDate: '', completed: false, stage: 'Entry', notes: 'Passport returned with entry visa stamp.' },
        { id: 'm5', title: `Residence Permit Card Collection in ${startDestination}`, dueDate: '', completed: false, stage: 'Settlement', notes: 'Convert entry visa to residency permit.' }
      ],
      budgetAllocation: plan.budgetAllocation || { visaFees: 500, housing: 5000, flight: 1000, emergencyFund: 3000 },
      notes: `Travel plan started for ${startPurpose} via ${startVisaType}`,
      createdAt: plan.createdAt || new Date().toISOString()
    };

    const newProfile: MobilityProfile = {
      ...profile,
      currentCountry: startOrigin,
      destinationCountries: [startDestination],
      purposeOfTravel: startPurpose,
      visaType: startVisaType,
      updatedAt: new Date().toISOString()
    };

    if (onUpdatePlan) onUpdatePlan(newPlan);
    if (onUpdateProfile) onUpdateProfile(newProfile);
    setShowStartForm(false);
    onNavigateTab('relocation');
  };

  const handleOpenJourneyPlan = () => {
    if (startOrigin.trim() && startDestination.trim()) {
      const updatedPlan: RelocationPlan = {
        ...plan,
        id: plan.id && plan.id !== 'plan_portugal_d7' ? plan.id : `plan_${Date.now()}`,
        userId: profile.userId || 'user',
        title: `${startOrigin} to ${startDestination} Mobility Roadmap`,
        originCountry: startOrigin,
        destinationCountry: startDestination,
        notes: `Travel plan for ${startPurpose} via ${startVisaType}`,
        updatedAt: new Date().toISOString()
      };

      const updatedProfile: MobilityProfile = {
        ...profile,
        currentCountry: startOrigin,
        destinationCountries: [startDestination],
        purposeOfTravel: startPurpose,
        visaType: startVisaType,
        updatedAt: new Date().toISOString()
      };

      if (onUpdatePlan) onUpdatePlan(updatedPlan);
      if (onUpdateProfile) onUpdateProfile(updatedProfile);
    }
    onNavigateTab('relocation');
  };

  // 12 Tools configuration with categories and featured flag
  const portalCards = [
    {
      id: 'agent',
      title: 'AI Visa Advisor',
      desc: '24/7 Gemini-powered AI visa counselor for statutory guidance, requirement analysis, and instant legal clarifications.',
      icon: Bot,
      status: 'Ready • AI Online',
      action: 'Launch AI Advisor',
      category: 'immigration',
      isFeatured: true
    },
    {
      id: 'assessment',
      title: 'Visa Eligibility Audit',
      desc: 'Evaluate residency pathways (D7 Passive Income, Digital Nomad, Golden Visa) against official statutory rules.',
      icon: Compass,
      status: profile.visaType ? `Target: ${profile.visaType}` : 'Run Eligibility Audit',
      action: 'Run Audit',
      category: 'immigration',
      isFeatured: false
    },
    {
      id: 'relocation',
      title: 'Relocation Roadmap',
      desc: 'Timeline of housing, moving budget, document filings, and step-by-step relocation milestones.',
      icon: MapPin,
      status: hasActivePlan ? `${completedMilestones} of ${totalMilestones} Milestones Completed` : 'Start a Travel Plan',
      action: 'View Roadmap',
      category: 'immigration',
      isFeatured: true
    },
    {
      id: 'intelligence',
      title: 'Destination Intelligence',
      desc: 'Live climate data, living costs, tax regulations, healthcare quality, and neighborhood safety indices.',
      icon: Landmark,
      status: destination ? `${destination} • Destination Intel` : 'Select Destination',
      action: 'Explore Destination',
      category: 'immigration',
      isFeatured: false
    },
    {
      id: 'documents',
      title: 'Docs & Visa Vault',
      desc: 'Encrypted storage for passports, bank statements, and apostilled records with automated expiry tracking.',
      icon: FileText,
      status: documents.length > 0 ? (pendingDocsCount > 0 ? `${pendingDocsCount} Pending Documents` : 'All Documents Valid') : 'No Documents Vaulted',
      action: 'Open Vault',
      category: 'prep',
      isFeatured: true
    },
    {
      id: 'interview',
      title: 'Consular Interview Lab',
      desc: 'Simulated embassy Q&A sessions with AI feedback and required consular checklist preparation.',
      icon: BookOpen,
      status: interviews.length > 0 ? `Appointment: ${interviews[0].appointmentDate || interviews[0].date}` : 'Embassy Prep Ready',
      action: 'Practice Q&A',
      category: 'prep',
      isFeatured: false
    },
    {
      id: 'safety',
      title: 'Safety Check-In & SOS',
      desc: '24/7 location monitoring, automated check-in timers, emergency alerts, and consular hotline access.',
      icon: Shield,
      status: 'Monitoring Ready',
      action: 'Safety Dashboard',
      category: 'safety',
      isFeatured: false
    },
    {
      id: 'relief',
      title: 'Relief & Student Pathways',
      desc: 'Fast-track visa fee waivers, student entry routes, and emergency humanitarian sanctuary applications.',
      icon: HeartHandshake,
      status: 'Waivers & Relief Available',
      action: 'View Pathways',
      category: 'immigration',
      isFeatured: false
    },
    {
      id: 'residency',
      title: 'Residency & Business',
      desc: 'Tax residence regulations, corporate setup, real estate rules, and bank account creation guides.',
      icon: Briefcase,
      status: 'Tax & Business Guidelines',
      action: 'Explore Business',
      category: 'immigration',
      isFeatured: false
    },
    {
      id: 'profile',
      title: 'Mobility Profile',
      desc: 'Passport information, dependents, financial proof, and relocation parameters.',
      icon: User,
      status: profile.fullName ? `${profile.fullName} • Active` : 'Profile Unfilled',
      action: 'Edit Profile',
      category: 'account',
      isFeatured: false
    },
    {
      id: 'audit',
      title: 'Governance Audit Log',
      desc: 'Timestamped ledger tracking all statutory compliance checks and document updates.',
      icon: ScrollText,
      status: 'Tamper-Proof Ledger Signed',
      action: 'View Log',
      category: 'account',
      isFeatured: false
    },
    {
      id: 'alerts',
      title: 'Policy Risk Alerts',
      desc: 'Official updates on border policy modifications, fee revisions, processing delays, and advisories.',
      icon: Zap,
      status: activeAlertsCount > 0 ? `${activeAlertsCount} Priority Risk Alerts` : 'Low Risk Level',
      action: 'View Alerts',
      category: 'safety',
      isFeatured: false
    }
  ];

  // Filtering modules logic
  const filteredCards = portalCards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      card.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    return card.category === selectedCategory;
  });

  const originInfo = getCountryInfo(origin);
  const destInfo = getCountryInfo(destination);

  return (
    <div className="space-y-10 max-w-7xl mx-auto font-sans pb-16 px-4 sm:px-6">
      
      {/* 1. INTRO / WELCOME HERO */}
      <section className="relative isolate h-[150px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
        <img
          src={pathwaiTravellers}
          alt="International travellers walking through an airport terminal"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent" />

        <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-5 py-4 sm:px-8">
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/15 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-100 backdrop-blur-sm sm:text-[10px]">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Sovereign relocation intelligence</span>
          </div>
          <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
            Your journey, <span className="text-blue-300">clearly mapped.</span>
          </h1>
          <p className="mt-1.5 max-w-md text-xs font-medium leading-relaxed text-slate-100 sm:text-sm">
            Visa guidance, travel planning, and trusted mobility tools in one workspace.
          </p>
        </div>
      </section>

      {/* 2. DYNAMIC INPUT FORM CONTAINER (IF CREATING PLAN / EDITING PLAN) */}
      {showStartForm ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl relative overflow-hidden p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Configure Travel Route
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Enter relocation parameters for compliance check
                  </p>
                </div>
              </div>
              {hasActivePlan && (
                <button
                  onClick={() => setShowStartForm(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Welcome</span>
                </button>
              )}
            </div>

            <form onSubmit={handleCreatePlan} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Current Country (Origin)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nigeria"
                    value={startOrigin}
                    onChange={(e) => setStartOrigin(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-bold placeholder-slate-400 outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Target Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portugal"
                    value={startDestination}
                    onChange={(e) => setStartDestination(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-bold placeholder-slate-400 outline-none shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Purpose of Travel
                </label>
                <select
                  value={startPurpose}
                  onChange={(e) => setStartPurpose(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none font-bold shadow-sm cursor-pointer transition-all"
                >
                  <option value="visit">Short Visit / Tourism</option>
                  <option value="relocation">Relocation / Residency</option>
                  <option value="work">Employment / Work Permit</option>
                  <option value="digital_nomad">Digital Nomad / Remote</option>
                  <option value="education">Higher Education / Study</option>
                  <option value="business">Business / Corporate</option>
                  <option value="family">Family Reunification</option>
                  <option value="humanitarian">Humanitarian / Relief</option>
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1">
                <DestinationVisaSelector
                  destinationCountry={startDestination}
                  value={startVisaType}
                  onChange={(selected) => setStartVisaType(selected)}
                  purposeOfTravel={startPurpose}
                  label="Visa Program / Category"
                  placeholder="Select visa category..."
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-5 flex justify-end pt-2 gap-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Initialize Relocation Roadmap</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* 3. THREE-COLUMN USER CHOICES LANDING GRID */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Choice 1: Start a New Route Plan */}
          <div 
            onClick={() => setShowStartForm(true)}
            className="bg-white border border-slate-200 hover:border-blue-500/70 p-6 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group shadow-sm hover:shadow-md"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Start Travel Planning
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium">
                  Define origin &amp; destination countries to query live compliance checks, calculate your visa eligibility scores, and configure a step-by-step roadmap.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>Configure Route</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Choice 2: Resume Active Plan (Dynamic Pass) */}
          <div 
            onClick={handleOpenJourneyPlan}
            className="bg-gradient-to-br from-[#0A0D1A] via-[#141830] to-[#0A0D1A] border border-[#21274F] p-6 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 group shadow-md hover:shadow-lg text-white"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStartForm(true);
                    }}
                    className="p-1.5 bg-[#1B2144] hover:bg-[#252C5C] border border-[#2D366F] text-slate-200 hover:text-white rounded-lg transition-all"
                    title="Edit Route"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-200 tracking-wider">Active Journey</div>
                <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>{originInfo.flag} {originInfo.code}</span>
                  <span className="text-blue-400">➔</span>
                  <span className="text-blue-400">{destInfo.flag} {destInfo.code}</span>
                </div>
                <p className="text-[11px] text-slate-100 font-mono pt-1">
                  Program: {profile.visaType || 'Standard Visa Pathway'}
                </p>
                <div className="w-full bg-[#1C2246] h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-200 pt-1">
                  <span>Progress</span>
                  <span className="text-emerald-400 font-bold">{completedMilestones}/{totalMilestones} Completed</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#232B5B] flex items-center justify-between text-xs font-bold text-blue-300 group-hover:text-blue-200">
              <span>Resume Journey Roadmap</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Choice 3: Direct Services / Quick Actions */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-5 shadow-sm">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Direct Services
              </h3>
              
              {/* Vertical Links List */}
              <div className="space-y-2 text-xs font-bold">
                <button
                  onClick={() => onNavigateTab('agent')}
                  className="w-full text-left p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all flex items-center justify-between text-slate-700 hover:text-blue-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <span>Consult AI Visa Advisor</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigateTab('documents')}
                  className="w-full text-left p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all flex items-center justify-between text-slate-700 hover:text-blue-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>Open Documents Vault</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => onNavigateTab('safety')}
                  className="w-full text-left p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all flex items-center justify-between text-slate-700 hover:text-blue-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-500" />
                    <span>Safety Check-In &amp; SOS</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="pt-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider text-center">
              Direct access channels
            </div>
          </div>

        </div>
      )}

      {/* 4. EXPANDABLE SECTION FOR 12 WORKSPACE MODULES (Hiding Grid by default to prevent visual overload) */}
      <div className="pt-8 border-t border-slate-200/80 max-w-6xl mx-auto space-y-8">
        
        {/* Toggle Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowAllModules(!showAllModules)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{showAllModules ? 'Hide All Workspace Tools' : 'Explore All 12 Workspace Modules'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showAllModules ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Expandable Module Content (Quick Stats + Modules Grid) */}
        {showAllModules && (
          <div className="space-y-8 pt-4 animate-fadeIn">
            
            {/* Quick Status Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shrink-0 shadow-sm">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Phase</div>
                  <div className="text-xs font-extrabold text-slate-800 truncate">
                    {hasActivePlan ? (plan.currentPhase || 'Eligibility') : 'Not Started'}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Roadmap</div>
                  <div className="text-xs font-extrabold text-emerald-700">
                    {hasActivePlan ? `${completedMilestones} of ${totalMilestones} Done` : '0 Milestones'}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50 shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Docs Vault</div>
                  <div className="text-xs font-extrabold text-slate-800 truncate">
                    {documents.length > 0 ? (pendingDocsCount > 0 ? `${pendingDocsCount} Pending` : 'All Compliant') : 'None Vaulted'}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/50 shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safety Status</div>
                  <div className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Secure Location
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Grid with Categories & Search */}
            <div className="space-y-6">
              <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Workspace Tool Directory
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {filteredCards.length} of {portalCards.length} modules matching query
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
                {[
                  { id: 'all', label: 'All Modules', icon: Sparkles },
                  { id: 'immigration', label: 'Immigration & AI', icon: Compass },
                  { id: 'prep', label: 'Docs & Prep', icon: FileText },
                  { id: 'safety', label: 'Safety & Advisories', icon: Shield },
                  { id: 'account', label: 'Profile & Logs', icon: User }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isSelected = selectedCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shrink-0 transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tools List */}
              {filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCards.map((card) => {
                    const IconComp = card.icon;
                    return (
                      <div
                        key={card.id}
                        onClick={() => onNavigateTab(card.id)}
                        className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md ${
                          card.isFeatured
                            ? 'bg-gradient-to-br from-blue-50/70 to-indigo-50/20 border-blue-200/80 hover:border-blue-400 hover:shadow-indigo-50/80'
                            : 'bg-white border-slate-200/80 hover:border-blue-400/60 hover:shadow-slate-100'
                        }`}
                      >
                        {card.isFeatured && (
                          <span className="absolute top-4 right-4 px-2 py-0.5 bg-blue-600/10 text-blue-700 border border-blue-600/20 text-[9px] font-extrabold uppercase rounded-full tracking-wider">
                            Core Tool
                          </span>
                        )}

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              card.isFeatured
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105'
                                : 'bg-blue-50 text-blue-600 border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                            }`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            {!card.isFeatured && (
                              <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-md">
                                {card.status}
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium">
                              {card.desc}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                          <span>{card.action}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">No modules found</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Try searching for other topics or resetting filters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
