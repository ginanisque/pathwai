import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, MapPin, AlertTriangle, ExternalLink, Calendar, CheckCircle2, 
  ChevronRight, FileText, ArrowRight, Crown, Zap, Sparkles, Bot, Compass, 
  BookOpen, Lock, ShieldAlert, HeartHandshake, User, ScrollText, DollarSign,
  Briefcase, Activity, Landmark, Navigation, Plane, HelpCircle, Eye, ShieldCheck,
  FolderLock, Plus, X, Check, Globe, Layers, Send, FileCheck, LayoutGrid, ArrowLeft
} from 'lucide-react';
import { MobilityProfile, RelocationPlan, MobilityAlert, AuditLog, SafetyCheckinConfig, LastLocation, InterviewAppointment, UserTier, MobilityDocument, VisaRecord } from '../types';
import { DestinationWeatherWidget } from './DestinationWeatherWidget';
import { FrontPagePortal } from './FrontPagePortal';
import { DestinationVisaSelector } from './DestinationVisaSelector';
import { getVisaOptionsForRoute } from '../lib/visaRequirements';

interface OverviewDashboardProps {
  profile: MobilityProfile;
  plan: RelocationPlan;
  alerts: MobilityAlert[];
  auditLogs: AuditLog[];
  checkinConfig: SafetyCheckinConfig;
  lastLocation: LastLocation | null;
  interviews: InterviewAppointment[];
  documents?: MobilityDocument[];
  visaRecords?: VisaRecord[];
  onCheckinNow: () => void;
  onNavigateTab: (tab: string) => void;
  onUpdateProfile?: (updated: MobilityProfile) => void;
  onUpdatePlan?: (updated: RelocationPlan) => void;
  userTier?: UserTier;
  onOpenUpgradeModal?: (featureName?: string) => void;
  onOpenTour?: () => void;
  onOpenOfflineVault?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  profile,
  plan,
  alerts,
  auditLogs,
  checkinConfig,
  lastLocation,
  interviews,
  documents = [],
  visaRecords = [],
  onCheckinNow,
  onNavigateTab,
  onUpdateProfile,
  onUpdatePlan,
  userTier = 'free',
  onOpenUpgradeModal,
  onOpenTour,
  onOpenOfflineVault
}) => {
  const nextInterview = interviews[0];
  const origin = plan.originCountry || profile.currentCountry || profile.nationality || '';
  const destination = plan.destinationCountry || profile.destinationCountries?.[0] || '';
  const activeAlertsCount = alerts.filter(a => a.severity === 'high').length;

  const hasActivePlan = Boolean(
    (plan.originCountry?.trim() && plan.destinationCountry?.trim()) ||
    (profile.currentCountry?.trim() && profile.destinationCountries?.[0]?.trim()) ||
    (plan.milestones && plan.milestones.length > 0)
  );

  // New Travel Plan Creator state
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newOrigin, setNewOrigin] = useState(plan.originCountry || profile.currentCountry || profile.nationality || '');
  const [newDestination, setNewDestination] = useState(plan.destinationCountry || profile.destinationCountries?.[0] || '');
  const [newPurpose, setNewPurpose] = useState<MobilityProfile['purposeOfTravel']>(profile.purposeOfTravel || 'relocation');
  const [newVisaType, setNewVisaType] = useState(profile.visaType || '');
  const [newTargetDate, setNewTargetDate] = useState(plan.targetDate || '2026-12-01');

  // Synchronize state with incoming profile / plan updates
  useEffect(() => {
    const effOrigin = plan.originCountry || profile.currentCountry || profile.nationality || '';
    const effDest = plan.destinationCountry || profile.destinationCountries?.[0] || '';
    if (effOrigin) setNewOrigin(effOrigin);
    if (effDest) setNewDestination(effDest);
    if (profile.purposeOfTravel) setNewPurpose(profile.purposeOfTravel);
    if (profile.visaType) setNewVisaType(profile.visaType);
    if (plan.targetDate) setNewTargetDate(plan.targetDate);
  }, [plan.originCountry, plan.destinationCountry, plan.targetDate, profile.currentCountry, profile.nationality, profile.destinationCountries, profile.purposeOfTravel, profile.visaType]);

  // Dynamically update default visa category selection when purpose or destination changes
  useEffect(() => {
    if (newDestination) {
      const assessment = getVisaOptionsForRoute('', '', [newDestination], newPurpose);
      if (assessment.options && assessment.options.length > 0) {
        const matched = assessment.options.find(o => o.name === newVisaType);
        if (!matched) {
          setNewVisaType(assessment.options[0].name);
        }
      }
    }
  }, [newPurpose, newDestination]);

  // Milestone Completion Progress
  const completedMilestones = plan.milestones ? plan.milestones.filter(m => m.completed).length : 0;
  const totalMilestones = plan.milestones ? plan.milestones.length : 0;
  const milestoneProgressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const pendingDocs = documents.filter(d => d.status === 'pending_submission' || d.status === 'expiring_soon' || d.status === 'expired');

  const handleStartNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination.trim() || !newOrigin.trim()) return;

    const newPlan: RelocationPlan = {
      id: `plan_${Date.now()}`,
      userId: profile.userId || 'user',
      title: `${newOrigin} to ${newDestination} Mobility Roadmap`,
      originCountry: newOrigin,
      destinationCountry: newDestination,
      currentPhase: 'Eligibility',
      targetDate: newTargetDate || '2026-12-01',
      milestones: [
        { id: 'm1', title: `NIF / Tax ID & ${newDestination} Bank Setup`, dueDate: '', completed: false, stage: 'Eligibility', notes: 'Initial statutory administrative setup.' },
        { id: 'm2', title: 'Proof of Funds & Housing Lease/Booking', dueDate: '', completed: false, stage: 'Documentation', notes: 'Gather financial statements and residence proof.' },
        { id: 'm3', title: 'VFS / Consular Biometrics Appointment', dueDate: '', completed: false, stage: 'Interview', notes: 'Submit biometrics and original documents.' },
        { id: 'm4', title: 'Consular Visa Stamp & Flight Confirmation', dueDate: '', completed: false, stage: 'Entry', notes: 'Passport returned with entry visa stamp.' },
        { id: 'm5', title: `Residence Permit Card Collection in ${newDestination}`, dueDate: '', completed: false, stage: 'Settlement', notes: 'Convert entry visa to residency permit.' }
      ],
      budgetAllocation: { visaFees: 500, housing: 5000, flight: 1000, emergencyFund: 3000 },
      notes: `Travel plan created for ${newPurpose} via ${newVisaType}`,
      createdAt: new Date().toISOString()
    };

    const updatedProfile: MobilityProfile = {
      ...profile,
      currentCountry: newOrigin,
      destinationCountries: [newDestination],
      purposeOfTravel: newPurpose,
      visaType: newVisaType,
      updatedAt: new Date().toISOString()
    };

    if (onUpdatePlan) onUpdatePlan(newPlan);
    if (onUpdateProfile) onUpdateProfile(updatedProfile);

    setIsNewPlanModalOpen(false);
    onNavigateTab('relocation');
  };

  // Calculate profile completeness score
  const calculateProfileCompleteness = (prof: MobilityProfile) => {
    let score = 0;
    let total = 8;
    if (prof.fullName?.trim()) score++;
    if (prof.nationality?.trim()) score++;
    if (prof.currentCountry?.trim()) score++;
    if (prof.destinationCountries?.length > 0) score++;
    if (prof.purposeOfTravel?.trim()) score++;
    if (prof.workAuthorisation?.trim() || prof.schoolOrEmployer?.trim()) score++;
    if (prof.budget && prof.budget > 0) score++;
    if (prof.passportExpiration?.trim()) score++;
    return Math.round((score / total) * 100);
  };

  const profileCompletenessPct = calculateProfileCompleteness(profile);

  // Guided Journey Pathways (Visual Feature Introductions)
  const guidedPathways = [
    {
      id: 'pathway-plan',
      title: '1. Plan a Relocation Trip',
      subtitle: 'Roadmap & Budget Forecast',
      badge: 'Step 1 • Planning',
      badgeColor: 'bg-[#1D1B28] text-amber-300 border-amber-500/40',
      icon: Compass,
      glowColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      description: 'Map out step-by-step consular milestones, compare projected settlement costs, and analyze local living standards.',
      actions: [
        { label: 'Launch Relocation Planner', tab: 'relocation', primary: true, icon: MapPin },
        { label: 'Check Destination Intel', tab: 'intelligence', primary: false, icon: Landmark }
      ]
    },
    {
      id: 'pathway-visa',
      title: '2. Track Visa & Document Vault',
      subtitle: 'Statutory Verification',
      badge: 'Step 2 • Compliance',
      badgeColor: 'bg-[#15232A] text-purple-300 border-purple-500/40',
      icon: FileText,
      glowColor: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      description: 'Organize passports, apostilled FBI background checks, income statements, and practice simulated consular interviews.',
      actions: [
        { label: 'Track Visa & Documents', tab: 'documents', primary: true, icon: FileText },
        { label: 'Consular Interview Prep', tab: 'interview', primary: false, icon: BookOpen }
      ]
    },
    {
      id: 'pathway-options',
      title: '3. Explore Immigration Options',
      subtitle: 'AI Visa Eligibility & Rules',
      badge: 'Step 3 • Intelligence',
      badgeColor: 'bg-[#12222D] text-blue-300 border-blue-500/40',
      icon: Bot,
      glowColor: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      description: 'Review passport context, compare reported income with current official guidance, and consult the AI mobility assistant.',
      actions: [
        { label: 'Consult AI Agent', tab: 'agent', primary: true, icon: Bot },
        { label: 'Run Eligibility Audit', tab: 'assessment', primary: false, icon: Compass }
      ]
    },
    {
      id: 'pathway-safety',
      title: '4. Travel Safety & Emergency SOS',
      subtitle: 'Real-Time Protection',
      badge: 'Step 4 • Protection',
      badgeColor: 'bg-[#2D181A] text-red-300 border-red-500/40',
      icon: Shield,
      glowColor: 'from-red-500/20 via-rose-500/10 to-transparent',
      borderColor: 'border-red-500/30 hover:border-red-500/60',
      description: 'Set up automated emergency check-in timers, store credentials in an offline WebAuthn vault, and access embassy hotlines.',
      actions: [
        { label: 'Safety & Emergency SOS', tab: 'safety', primary: true, icon: Shield },
        { label: 'View Policy Risk Alerts', tab: 'alerts', primary: false, icon: ShieldAlert }
      ]
    }
  ];

  // Complete List of All App Modules
  const allModules = [
    {
      id: 'agent',
      title: 'Consult AI Mobility Agent',
      subtitle: '24/7 Statutory Visa Advisor',
      badge: 'AI Powered',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: Bot,
      color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
      description: 'Ask questions on D7/D2 visas, tax residency, income rules, apostilles, and consular requirements.'
    },
    {
      id: 'assessment',
      title: 'Visa Eligibility Audit',
      subtitle: 'Statutory Compliance Check',
      badge: 'Eligibility Audit',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: Compass,
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
      description: 'Verify passport strength and statutory minimum income thresholds for target country entry.'
    },
    {
      id: 'relocation',
      title: 'Relocation Roadmap',
      subtitle: 'Milestones & Budget Allocation',
      badge: 'Roadmap & Budget',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: MapPin,
      color: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
      description: 'Track consular milestones, settlement budget forecasts, and housing timeline progress.'
    },
    {
      id: 'intelligence',
      title: 'Destination Intelligence',
      subtitle: 'Climate, Costs & Local Norms',
      badge: 'Live Data',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      icon: Landmark,
      color: 'from-cyan-600/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
      description: 'Compare cost of living, currency conversion, healthcare, and tax structures.'
    },
    {
      id: 'documents',
      title: 'Document & Visa Tracker',
      subtitle: 'Encrypted Local Storage Vault',
      badge: 'Docs Vault',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      icon: FileText,
      color: 'from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400',
      description: 'Store and audit passports, FBI background checks, bank statements, and apostille verification.'
    },
    {
      id: 'interview',
      title: 'Consular Interview Prep',
      subtitle: 'Simulated Embassy Q&A Workspace',
      badge: nextInterview ? `Appt: ${nextInterview.appointmentDate}` : 'Practice Workspace',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      icon: BookOpen,
      color: 'from-indigo-600/20 to-purple-600/10 border-indigo-500/30 text-indigo-400',
      description: 'Practice simulated interviewer questions with instant AI feedback and appointment reminders.'
    },
    {
      id: 'safety',
      title: 'Safety & Emergency SOS',
      subtitle: 'Check-in & Hotline Registry',
      badge: checkinConfig.status === 'escalated' ? 'Needs Checkin' : 'Safety Active',
      badgeColor: checkinConfig.status === 'escalated' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: Shield,
      color: 'from-red-600/20 to-rose-600/10 border-red-500/30 text-red-400',
      description: 'Configure automated safety check-ins, trusted emergency contacts, and 24/7 consular hotlines.'
    },
    {
      id: 'alerts',
      title: 'Mobility Policy Alerts',
      subtitle: 'Official Policy Changes & Advisories',
      badge: `${alerts.length} Policy Updates`,
      badgeColor: activeAlertsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: ShieldAlert,
      color: 'from-amber-600/20 to-red-600/10 border-amber-500/30 text-amber-400',
      description: 'Stay updated on official wage adjustments, D7/D2 statutory changes, and regional security advisories.'
    }
  ];

  // View Mode: 'portal' (Front page clean portal) or 'dashboard' (Multi-widget command view)
  const [viewMode, setViewMode] = useState<'portal' | 'dashboard'>('portal');

  if (viewMode === 'portal') {
    return (
      <FrontPagePortal
        profile={profile}
        plan={plan}
        alerts={alerts}
        interviews={interviews}
        documents={documents}
        visaRecords={visaRecords}
        onNavigateTab={onNavigateTab}
        onUpdateProfile={onUpdateProfile}
        onUpdatePlan={onUpdatePlan}
        onOpenUpgradeModal={onOpenUpgradeModal}
        onOpenTour={onOpenTour}
        onOpenOfflineVault={onOpenOfflineVault}
        onSwitchToDashboardView={() => setViewMode('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto font-sans">
      
      {/* Navigation Return to Front Page Portal Banner */}
      <div className="bg-[#141726] border border-[#2B2F4A] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          <span>Multi-Widget Command Dashboard View</span>
        </div>
        <button
          onClick={() => setViewMode('portal')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Front Page Portal</span>
        </button>
      </div>
      
      {/* ================= HIGH IMPACT HERO SECTION ================= */}
      <div className="relative bg-gradient-to-br from-[#0F111A] via-[#141724] to-[#0D0F18] border border-[#2D3148] p-6 sm:p-10 rounded-3xl shadow-2xl overflow-hidden font-sans">
        {/* Ambient glow background accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Bar: Platform Header & System Utilities */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#25283D] pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-300 shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black uppercase tracking-widest text-blue-300">
                    PathWAI Command Center
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold rounded uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Travel Engine Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono font-medium">
                  Sovereign Relocation &amp; Statutory Visa Intelligence
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenTour && (
                <button
                  onClick={onOpenTour}
                  className="px-3.5 py-2 bg-[#1B1E2E] hover:bg-[#252A42] border border-[#333854] text-blue-300 hover:text-white font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>App Tour</span>
                </button>
              )}

              {onOpenOfflineVault && (
                <button
                  onClick={onOpenOfflineVault}
                  className="px-3.5 py-2 bg-[#1B1E2E] hover:bg-[#252A42] border border-[#333854] text-amber-300 hover:text-amber-200 font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5"
                >
                  <FolderLock className="w-4 h-4 text-amber-400" />
                  <span>Biometric Vault</span>
                </button>
              )}

              {userTier === 'pro' ? (
                <span className="px-3.5 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase rounded-lg flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" /> Pro Member
                </span>
              ) : (
                <button
                  onClick={() => onOpenUpgradeModal?.('Pro Upgrade')}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-300" /> Upgrade Pro
                </button>
              )}
            </div>
          </div>

          {/* Main Hero Layout: Status & CTAs on Left, Pending Docs Card on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: User Travel Status & Roadmap Progress */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {!hasActivePlan ? (
                <div className="space-y-4 bg-[#171A2E] p-6 border border-blue-500/40 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-400 tracking-wider">
                    <Plane className="w-4 h-4 text-blue-400" />
                    <span>No Active Travel Plan</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">Start Your Relocation &amp; Travel Plan</h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    You do not have an active travel plan yet. Define your origin and destination countries to launch your statutory milestone roadmap, visa eligibility audit, and document checklist.
                  </p>
                  <button
                    onClick={() => setIsNewPlanModalOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Start a Travel Plan Now</span>
                  </button>
                </div>
              ) : (
                /* Header Badges & Active Route */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-mono font-bold uppercase rounded-full flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-blue-400" />
                      Active Travel Status
                    </span>
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase rounded-full flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      Phase: {plan.currentPhase || 'Eligibility Phase'}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Safety Active
                    </span>
                  </div>

                  {/* Primary Route Title */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Current Travel Route &amp; Purpose
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white flex items-center gap-3 flex-wrap">
                        <span className="text-white">{origin}</span>
                        <span className="text-blue-500 font-light">➔</span>
                        <span className="text-blue-400">{destination}</span>
                      </h1>
                    </div>
                    <button
                      onClick={() => onNavigateTab('relocation')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-amber-300" />
                      <span>View Journey Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed font-medium">
                    Relocation for <strong className="text-white font-bold">{profile.fullName || 'Registered Traveller'}</strong> ({profile.purposeOfTravel || 'Relocation'}).
                    Target Departure Date: <strong className="text-amber-300 font-bold">{plan.targetDate || 'Not set'}</strong>.
                  </p>
                </div>
              )}

              {/* CIRCULAR COLOR-CODED STATUS BADGES GRID (At-a-Glance Mobility Health) */}
              <div className="space-y-2 pt-1 font-mono">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>At-A-Glance Mobility Profile Health</span>
                  <span className="text-emerald-400 text-[9px] font-mono">Real-Time Status Engine</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Badge 1: Visa Filing Deadline */}
                  <div
                    onClick={() => onNavigateTab('visa')}
                    className="p-3 bg-[#151828] hover:bg-[#1D2238] border border-[#2B2F4A] hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer flex items-center gap-3 group shadow-md"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full border-2 border-emerald-400 bg-emerald-950/50 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#151828] animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold truncate">Visa Filing</div>
                      <div className="text-xs font-black text-emerald-300 truncate">37d Remaining</div>
                      <div className="text-[9px] text-emerald-400/80 font-bold uppercase truncate">🟢 On Track</div>
                    </div>
                  </div>

                  {/* Badge 2: Pending Document Tasks */}
                  <div
                    onClick={() => onNavigateTab('documents')}
                    className={`p-3 bg-[#151828] hover:bg-[#1D2238] border ${
                      pendingDocs.length > 0 ? 'border-amber-500/50 hover:border-amber-400' : 'border-[#2B2F4A]'
                    } rounded-2xl transition-all cursor-pointer flex items-center gap-3 group shadow-md`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full border-2 ${
                        pendingDocs.length > 0 ? 'border-amber-400 bg-amber-950/50 text-amber-300 shadow-amber-500/20' : 'border-emerald-400 bg-emerald-950/50 text-emerald-300'
                      } flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#151828] ${
                        pendingDocs.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold truncate">Document Tasks</div>
                      <div className={`text-xs font-black truncate ${pendingDocs.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {pendingDocs.length > 0 ? `${pendingDocs.length} Pending` : 'All Verified'}
                      </div>
                      <div className={`text-[9px] font-bold uppercase truncate ${pendingDocs.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {pendingDocs.length > 0 ? '🟡 Action Required' : '🟢 100% Ready'}
                      </div>
                    </div>
                  </div>

                  {/* Badge 3: Consular Interview */}
                  <div
                    onClick={() => onNavigateTab('interviews')}
                    className="p-3 bg-[#151828] hover:bg-[#1D2238] border border-[#2B2F4A] hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer flex items-center gap-3 group shadow-md"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full border-2 border-blue-400 bg-blue-950/50 flex items-center justify-center text-blue-300 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-[#151828]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold truncate">Embassy Interview</div>
                      <div className="text-xs font-black text-blue-300 truncate">
                        {interviews.length > 0 ? interviews[0].date : 'Oct 14, 2026'}
                      </div>
                      <div className="text-[9px] text-blue-400 font-bold uppercase truncate">🔵 Confirmed</div>
                    </div>
                  </div>

                  {/* Badge 4: Travel Safety Beacon */}
                  <div
                    onClick={() => onNavigateTab('safety')}
                    className="p-3 bg-[#151828] hover:bg-[#1D2238] border border-[#2B2F4A] hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer flex items-center gap-3 group shadow-md"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full border-2 border-emerald-400 bg-emerald-950/50 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#151828] animate-ping" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold truncate">Safety Beacon</div>
                      <div className="text-xs font-black text-emerald-300 truncate">24/7 Monitored</div>
                      <div className="text-[9px] text-emerald-400 font-bold uppercase truncate">🟢 Protected</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Summary Box: Milestones & Profile Completeness */}
              <div className="bg-[#151828] border border-[#2B2F4A] p-5 rounded-2xl space-y-4 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Travel Milestones Progress
                  </span>
                  <span className="text-emerald-400 font-black text-sm">
                    {completedMilestones} of {totalMilestones} Completed ({milestoneProgressPct}%)
                  </span>
                </div>

                {/* Milestone Progress Bar */}
                <div className="w-full bg-[#0E101D] h-3 rounded-full overflow-hidden p-0.5 border border-[#22263C]">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${milestoneProgressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                  <div className="bg-[#1A1D30] p-2.5 rounded-lg border border-[#2E3352]">
                    <span className="text-slate-400 uppercase text-[9px] block font-bold">Target Visa Category</span>
                    <span className="text-white font-bold truncate block">{profile.visaType || 'D7 Passive Income'}</span>
                  </div>
                  <div className="bg-[#1A1D30] p-2.5 rounded-lg border border-[#2E3352]">
                    <span className="text-slate-400 uppercase text-[9px] block font-bold">Passport Expiry</span>
                    <span className="text-emerald-300 font-bold block">{profile.passportExpiration || '2029-08-15'}</span>
                  </div>
                  <div className="bg-[#1A1D30] p-2.5 rounded-lg border border-[#2E3352] col-span-2 sm:col-span-1">
                    <span className="text-slate-400 uppercase text-[9px] block font-bold">Relocation Score</span>
                    <button
                      onClick={() => onNavigateTab('profile')}
                      className="text-amber-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{profileCompletenessPct}% Complete</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Prominent Call-To-Action (CTA) Button & Quick Navigation */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsNewPlanModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-black font-black uppercase rounded-xl text-xs tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 font-mono group"
                >
                  <Plus className="w-4 h-4 text-black group-hover:rotate-90 transition-transform" />
                  <span>Begin New Travel Plan</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>

                <button
                  onClick={() => onNavigateTab('relocation')}
                  className="px-5 py-3.5 bg-[#1B1E2E] hover:bg-[#262B42] text-white border border-[#3A3F60] font-mono font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>View Relocation Roadmap</span>
                </button>
              </div>

            </div>

            {/* Right Column: Pending Document Tasks Card */}
            <div className="lg:col-span-5 bg-[#141726] border border-[#2B2F4A] p-6 rounded-2xl flex flex-col justify-between space-y-5 font-mono shadow-xl relative overflow-hidden">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#25283D] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase text-white tracking-wider">
                      Pending Document Tasks
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    pendingDocs.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {pendingDocs.length} Actions Required
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  Consular compliance requires valid statutory records. Resolve pending items before embassy filing:
                </p>

                {/* List of Pending / Expiring Documents */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {documents.length === 0 ? (
                    <div className="p-4 bg-[#111320] border border-[#22263C] rounded-xl text-center space-y-1">
                      <p className="text-xs text-slate-300 font-bold">No documents vaulted yet</p>
                      <p className="text-[10px] text-slate-500">Upload passports, financial statements, or civil records to start tracking validation deadlines.</p>
                    </div>
                  ) : (
                    documents.slice(0, 4).map((docItem) => {
                      const isPending = docItem.status === 'pending_submission' || docItem.status === 'expired' || docItem.status === 'expiring_soon';
                      return (
                        <div
                          key={docItem.id}
                          onClick={() => onNavigateTab('documents')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isPending
                              ? 'bg-[#1C1F32] border-amber-500/40 hover:border-amber-400'
                              : 'bg-[#111320] border-[#22263C] hover:border-[#333854]'
                          }`}
                        >
                          <div className="space-y-0.5 truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{docItem.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{docItem.notes || docItem.category}</p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              docItem.status === 'valid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : docItem.status === 'expiring_soon'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {docItem.status.replace('_', ' ')}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Document Vault Link CTA */}
              <div className="pt-2 border-t border-[#25283D]">
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="w-full py-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Open Document Vault ({documents.length} Items)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Begin New Travel Plan Builder Modal */}
        {isNewPlanModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#111118] border border-[#2D314A] w-full max-w-xl p-6 sm:p-8 rounded-2xl relative text-white space-y-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#22253A] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase text-white tracking-tight">
                      Begin New Travel &amp; Relocation Plan
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Configure origin, destination, visa parameters, and target relocation date.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStartNewPlan} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Origin Country
                    </label>
                    <input
                      type="text"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      placeholder="e.g. Canada, Nigeria, USA"
                      className="w-full bg-[#0B0D16] border border-[#303554] p-3 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      value={newDestination}
                      onChange={(e) => setNewDestination(e.target.value)}
                      placeholder="e.g. Portugal, Germany, Spain, UK"
                      className="w-full bg-[#0B0D16] border border-[#303554] p-3 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Primary Purpose of Travel
                    </label>
                    <select
                      value={newPurpose}
                      onChange={(e) => setNewPurpose(e.target.value as MobilityProfile['purposeOfTravel'])}
                      className="w-full bg-[#0B0D16] border border-[#303554] p-3 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="visit">Short Visit / Tourism / Visitor Visa</option>
                      <option value="relocation">Relocation / Residency</option>
                      <option value="work">Employment / Work Permit</option>
                      <option value="digital_nomad">Digital Nomad / Remote</option>
                      <option value="education">Education / Student Visa</option>
                      <option value="family">Family Reunification</option>
                      <option value="humanitarian">Humanitarian / Relief</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Target Relocation Date
                    </label>
                    <input
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full bg-[#0B0D16] border border-[#303554] p-3 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <DestinationVisaSelector
                  destinationCountry={newDestination}
                  value={newVisaType}
                  onChange={(selected) => setNewVisaType(selected)}
                  purposeOfTravel={newPurpose}
                  label="Target Visa Category / Program"
                  placeholder="Select prefilled visa category for destination..."
                />

                <div className="pt-4 border-t border-[#22253A] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewPlanModalOpen(false)}
                    className="px-4 py-2.5 bg-[#1B1E2E] hover:bg-[#252A42] text-slate-300 font-bold uppercase rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-black" />
                    <span>Initialize Plan &amp; Roadmap</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 2. Destination Weather & Local Time Bar */}
      <DestinationWeatherWidget
        destinationCountry={destination}
        originCountry={origin}
      />

      {/* PROMINENT RELOCATION PROFILE FOCUS BANNER */}
      <div className="bg-[#12121D] border border-blue-500/30 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 font-mono text-xs shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-300 shrink-0 mt-0.5">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded border border-blue-500/30">
                Relocation Profile Focus
              </span>
              <span className="text-white font-bold text-xs bg-[#1C1C2C] px-2 py-0.5 rounded border border-[#33334A]">
                Score: {profileCompletenessPct}% Complete
              </span>
            </div>
            <h3 className="text-white font-black text-sm sm:text-base tracking-tight">
              Keep Your Relocation Profile Updated For Accurate Consular & Visa Audit
            </h3>
            <p className="text-slate-200 text-[11px] sm:text-xs leading-relaxed max-w-2xl font-medium">
              Your profile parameters (passport country, passive/employment income, dependent family members) directly power our AI statutory visa eligibility checks, document templates, and consular interview preparation.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 self-stretch md:self-auto relative z-10">
          <button
            onClick={() => onNavigateTab('profile')}
            className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Update Relocation Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Upcoming Consular Interview Banner (if applicable) */}
      {nextInterview && (
        <div className="bg-gradient-to-r from-[#1E1B10] via-[#1A1812] to-[#14120E] border border-amber-500/40 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase rounded border border-amber-500/30">
                  Upcoming Consular Interview
                </span>
                <span className="text-[#AAA] text-[11px]">{nextInterview.appointmentDate} @ {nextInterview.appointmentTime}</span>
              </div>
              <h4 className="text-white font-bold text-sm mt-1">{nextInterview.title}</h4>
              <p className="text-[#888] text-[11px] mt-0.5">{nextInterview.embassyOrLocation}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('interview')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase rounded-lg text-xs transition-all shadow-md shadow-amber-500/20 shrink-0 flex items-center gap-1.5"
          >
            <span>Launch Prep Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. GUIDED JOURNEY PATHWAYS (What would you like to do?) */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              Guided Relocation & Travel Pathways
            </h2>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              Select your goal below for step-by-step guidance on planning, visa tracking, or safety.
            </p>
          </div>
          <span className="text-xs text-slate-300 font-bold hidden md:inline">4 Guided Pathways</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guidedPathways.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className={`bg-[#12121B] border ${path.borderColor} p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between space-y-5 group`}
              >
                {/* Subtle gradient glow background */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${path.glowColor} blur-2xl pointer-events-none`} />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-3 bg-[#1A1A28] border border-[#33334A] rounded-xl text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${path.badgeColor}`}>
                      {path.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-xs text-blue-300 font-black mt-0.5">{path.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-100 font-medium leading-relaxed">
                    {path.description}
                  </p>
                </div>

                {/* Direct Action Link Buttons */}
                <div className="pt-4 border-t border-[#26263A] flex flex-wrap items-center gap-2 relative z-10">
                  {path.actions.map((act, i) => {
                    const ActIcon = act.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => onNavigateTab(act.tab)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
                          act.primary
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                            : 'bg-[#222234] hover:bg-[#2C2C42] text-white border border-[#444462]'
                        }`}
                      >
                        <ActIcon className="w-3.5 h-3.5" />
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ALL MODULES DIRECTORY */}
      <div className="space-y-4 font-mono pt-4">
        <div className="flex items-center justify-between border-b border-[#2C2C3E] pb-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Full Module Directory & Workspace Links
            </h2>
            <p className="text-xs text-slate-200 font-medium mt-0.5">
              Direct access to all 8 core workspace modules.
            </p>
          </div>
          <span className="text-xs text-slate-300 font-bold">{allModules.length} Modules Available</span>
        </div>

        {/* Responsive Flex-Box Layout for Module Links */}
        <div className="flex flex-col md:flex-row flex-wrap gap-4 sm:gap-5">
          {allModules.map((link) => {
            const Icon = link.icon;
            return (
              <div
                key={link.id}
                onClick={() => onNavigateTab(link.id)}
                className="group cursor-pointer bg-[#13131D] hover:bg-[#1A1A28] border border-[#2A2A3E] hover:border-[#424262] p-5 rounded-xl transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-0.5 relative overflow-hidden w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.9rem)] flex-grow min-w-[280px]"
              >
                {/* Accent line on top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${link.color}`} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2.5 rounded-lg bg-[#1E1E2C] border border-[#33334A] text-blue-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-black uppercase rounded-full border ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      <span>{link.title}</span>
                    </h3>
                    <p className="text-xs text-slate-300 font-mono font-bold mt-0.5">{link.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-100 font-medium leading-relaxed line-clamp-2">
                    {link.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#222234] flex items-center justify-between text-xs font-mono font-black text-blue-300 group-hover:text-blue-200">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Compact Policy & Risk Alert Strip */}
      {alerts && alerts.length > 0 && (
        <div className="bg-[#181826] border border-amber-500/40 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-amber-300 font-black uppercase block text-[11px]">Official Policy Advisory ({alerts[0].date})</span>
              <p className="text-white font-black text-xs mt-0.5">{alerts[0].title}</p>
              <p className="text-slate-200 font-medium text-[11px] line-clamp-1 mt-0.5">{alerts[0].summary}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('alerts')}
            className="px-4 py-2 bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-500/50 rounded-lg text-xs font-black uppercase transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>View All Advisories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

