import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, Circle, Clock, DollarSign, MapPin, Sparkles, Plus, Trash2, Scale, Building2, Check, ArrowRight, ShieldCheck, Layers } from 'lucide-react';
import { RelocationPlan, RelocationMilestone, MobilityProfile } from '../types';
import { fetchRelocationAssessment } from '../lib/api';
import { ResidencyAndBusinessFeasibilityAdvisor } from './ResidencyAndBusinessFeasibilityAdvisor';
import { DestinationVisaSelector } from './DestinationVisaSelector';
import { PreDepartureAssessmentView } from './PreDepartureAssessmentView';

interface RelocationPlannerViewProps {
  plan: RelocationPlan;
  profile: MobilityProfile;
  onUpdatePlan: (updated: RelocationPlan) => void;
  onUpdateProfile?: (updated: MobilityProfile) => void;
  initialProcessStep?: 'roadmap' | 'assessment' | 'feasibility' | 'budget' | 'all';
  onNavigateTab?: (tab: string) => void;
}

export const RelocationPlannerView: React.FC<RelocationPlannerViewProps> = ({
  plan,
  profile,
  onUpdatePlan,
  onUpdateProfile,
  initialProcessStep = 'all',
  onNavigateTab
}) => {
  const [activePlan, setActivePlan] = useState<RelocationPlan>({ ...plan });
  const [activeStep, setActiveStep] = useState<'roadmap' | 'assessment' | 'feasibility' | 'budget' | 'all'>(initialProcessStep);

  useEffect(() => {
    setActivePlan({ ...plan });
  }, [plan]);

  useEffect(() => {
    if (initialProcessStep) {
      setActiveStep(initialProcessStep);
    }
  }, [initialProcessStep]);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneStage, setNewMilestoneStage] = useState<RelocationMilestone['stage']>('Documentation');
  const [aiAssessing, setAiAssessing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any[] | null>(null);

  const stages: RelocationMilestone['stage'][] = ['Eligibility', 'Documentation', 'Interview', 'Entry', 'Settlement'];

  const toggleMilestone = (id: string) => {
    const updatedMilestones = activePlan.milestones.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    const updated = { ...activePlan, milestones: updatedMilestones };
    setActivePlan(updated);
    onUpdatePlan(updated);
  };

  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM: RelocationMilestone = {
      id: `m_${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: newMilestoneDate || new Date().toISOString().split('T')[0],
      completed: false,
      stage: newMilestoneStage
    };

    const updated = {
      ...activePlan,
      milestones: [...activePlan.milestones, newM]
    };
    setActivePlan(updated);
    onUpdatePlan(updated);
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const removeMilestone = (id: string) => {
    const updated = {
      ...activePlan,
      milestones: activePlan.milestones.filter(m => m.id !== id)
    };
    setActivePlan(updated);
    onUpdatePlan(updated);
  };

  const runAiAssessment = async () => {
    setAiAssessing(true);
    try {
      const targets = profile.destinationCountries.length > 0 ? profile.destinationCountries : [profile.destinationCountries?.[0] || 'Target Destination'];
      const origin = profile.currentCountry || profile.nationality || 'Origin Country';
      const data = await fetchRelocationAssessment(origin, targets, profile);
      setComparisonResults(data.destinations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAssessing(false);
    }
  };

  const totalBudget = (activePlan.budgetAllocation.visaFees || 0) +
    (activePlan.budgetAllocation.housing || 0) +
    (activePlan.budgetAllocation.flight || 0) +
    (activePlan.budgetAllocation.emergencyFund || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-[#666] font-mono font-black uppercase tracking-[0.2em] mb-2">02 RELOCATION ROADMAP</h2>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none">
            {activePlan.originCountry} <span className="text-transparent" style={{ WebkitTextStroke: '1px #666' }}>TO</span> {activePlan.destinationCountry}
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Structured relocation roadmap, statutory milestone tracking, budget allocation, and destination comparison.
          </p>
        </div>

        <button
          onClick={runAiAssessment}
          disabled={aiAssessing}
          className="bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs px-5 py-3 tracking-widest flex items-center gap-2 rounded-sm transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-black" />
          {aiAssessing ? 'Analyzing Destinations...' : 'AI Destination Comparison'}
        </button>
      </div>

      {/* Travel Plan Process Steps Navigation Bar */}
      <div className="bg-[#121524] border border-[#2B3150] p-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1">
          <button
            type="button"
            onClick={() => setActiveStep('all')}
            className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStep === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#1A1D30] text-slate-300 hover:text-white hover:bg-[#252945]'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-300" />
            <span>Full Travel Plan Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('roadmap')}
            className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStep === 'roadmap'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#1A1D30] text-slate-300 hover:text-white hover:bg-[#252945]'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>1. Visa Roadmap & Milestones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('assessment')}
            className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStep === 'assessment'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-[#1A1D30] text-slate-300 hover:text-white hover:bg-[#252945]'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>2. Visa Eligibility Audit</span>
            <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-200 text-[9px] rounded font-mono font-extrabold uppercase">
              Step 2
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('feasibility')}
            className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStep === 'feasibility'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#1A1D30] text-slate-300 hover:text-white hover:bg-[#252945]'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>3. PR & Business Feasibility</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('budget')}
            className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeStep === 'budget'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#1A1D30] text-slate-300 hover:text-white hover:bg-[#252945]'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>4. Budget & Financials</span>
          </button>
        </div>
      </div>

      {/* Target Visa Program Selector for Destination */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
        <DestinationVisaSelector
          destinationCountry={activePlan.destinationCountry}
          value={profile.visaType || ''}
          purposeOfTravel={profile.purposeOfTravel}
          onChange={(selectedVisa) => {
            const updatedPlan = {
              ...activePlan,
              notes: activePlan.notes ? `${activePlan.notes} (Selected: ${selectedVisa})` : `Target Visa: ${selectedVisa}`
            };
            const updatedProfile = {
              ...profile,
              visaType: selectedVisa
            };
            setActivePlan(updatedPlan);
            onUpdatePlan(updatedPlan);
            if (onUpdateProfile) onUpdateProfile(updatedProfile);
          }}
          label={`Target Visa Category / Program for ${activePlan.destinationCountry}`}
          placeholder={`Select available prefilled visa program for ${activePlan.destinationCountry}...`}
        />
      </div>

      {/* PROCESS STEP 2: VISA ELIGIBILITY AUDIT (Integrated directly into the Travel Plan process) */}
      {(activeStep === 'assessment' || activeStep === 'all') && (
        <div className="bg-white border-2 border-emerald-500 p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                Travel Plan Process Step 2 — Visa Eligibility Audit & Statutory Compliance
              </h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-mono font-bold uppercase">
              Route: {activePlan.originCountry} → {activePlan.destinationCountry}
            </span>
          </div>

          {/* Integrated Audit Component initialized with travel plan parameters */}
          <PreDepartureAssessmentView
            profile={profile}
            plan={activePlan}
            onUpdateProfile={onUpdateProfile}
            onNavigateTab={onNavigateTab}
          />
        </div>
      )}

      {/* PROCESS STEP 1: VISUAL STAGE PROGRESS STEPPER & MILESTONES */}
      {(activeStep === 'roadmap' || activeStep === 'all') && (
        <div className="p-8 bg-white border border-slate-200 rounded-xl relative space-y-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">
            Travel Plan Process Step 1 — Visa Roadmap Stage
          </h3>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="hidden md:block w-full absolute h-0.5 bg-slate-200 top-5 left-0 z-0" />
            
            {stages.map((stage, idx) => {
              const isCurrent = stage === activePlan.currentPhase;
              const isCompleted = stages.indexOf(activePlan.currentPhase) > idx;

              return (
                <div 
                  key={stage}
                  onClick={() => {
                    const updated = { ...activePlan, currentPhase: stage };
                    setActivePlan(updated);
                    onUpdatePlan(updated);
                  }}
                  className={`relative flex md:flex-col items-center gap-3 z-10 cursor-pointer group ${!isCurrent && !isCompleted ? 'opacity-50' : ''}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      isCurrent 
                        ? 'bg-amber-500 text-slate-900 ring-8 ring-amber-100' 
                        : isCompleted 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-900 group-hover:text-amber-600">{stage}</p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase font-bold">
                      {activePlan.milestones.filter(m => m.stage === stage && m.completed).length} / {activePlan.milestones.filter(m => m.stage === stage).length} done
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROCESS STEP 3: STATUTORY PR & BUSINESS FEASIBILITY */}
      {(activeStep === 'feasibility' || activeStep === 'all') && (
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 px-1">
            Travel Plan Process Step 3 — Permanent Residency & Business Feasibility
          </h3>
          <ResidencyAndBusinessFeasibilityAdvisor profile={profile} onNavigateTab={onNavigateTab} />
        </div>
      )}

      {/* PROCESS STEP 4: ACTION MILESTONES & BUDGET ALLOCATION */}
      {(activeStep === 'budget' || activeStep === 'all' || activeStep === 'roadmap') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 8 Cols: Milestones Tracker */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 border-b border-slate-200 pb-3 flex items-center justify-between">
                <span>Action Milestones ({activePlan.milestones.filter(m => m.completed).length} / {activePlan.milestones.length})</span>
                <span className="text-[10px] font-mono font-bold text-slate-600">TARGET DATE: {activePlan.targetDate}</span>
              </h3>

            {/* List of Milestones */}
            <div className="space-y-3">
              {activePlan.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 border rounded-lg flex items-start justify-between gap-4 transition-all ${
                    m.completed ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleMilestone(m.id)}
                      className="mt-0.5 text-slate-900 hover:text-amber-600 focus:outline-none cursor-pointer"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-bold ${m.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {m.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-600 font-bold">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-900 uppercase rounded-sm border border-slate-200">{m.stage}</span>
                        <span>DUE: {m.dueDate}</span>
                      </div>
                      {m.notes && <p className="text-xs text-slate-600 mt-2 italic font-medium">{m.notes}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Milestone Form */}
            <form onSubmit={addMilestone} className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <p className="text-xs font-black uppercase text-slate-700 tracking-widest">Add Relocation Milestone</p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Milestone title e.g. Consular Marriage Certificate Apostille"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="sm:col-span-6 bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 rounded shadow-sm"
                />
                <select
                  value={newMilestoneStage}
                  onChange={(e) => setNewMilestoneStage(e.target.value as RelocationMilestone['stage'])}
                  className="sm:col-span-3 bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold uppercase focus:outline-none rounded shadow-sm cursor-pointer"
                >
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="sm:col-span-3 bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold font-mono focus:outline-none rounded shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold uppercase text-xs py-2.5 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Milestone to Roadmap
              </button>
            </form>
          </div>
        </div>

        {/* Right 4 Cols: Budget Allocation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white border border-slate-200 text-slate-900 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest">Relocation Budget</h3>
              <span className="text-xs font-mono font-bold">${totalBudget.toLocaleString()} USD</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-sans uppercase font-bold">Visa & Legal Fees</span>
                <span className="font-bold text-slate-900">${activePlan.budgetAllocation.visaFees.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-sans uppercase font-bold">Housing Lease Deposit</span>
                <span className="font-bold text-slate-900">${activePlan.budgetAllocation.housing.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-sans uppercase font-bold">Flight & Logistics</span>
                <span className="font-bold text-slate-900">${activePlan.budgetAllocation.flight.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans uppercase font-bold">Emergency Reserve</span>
                <span className="font-bold text-slate-900">${activePlan.budgetAllocation.emergencyFund.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
              <strong>Financial Proof Note:</strong> Minimum statutory financial proof requirements depend on {activePlan.destinationCountry || profile.destinationCountries?.[0] || 'the target destination'} rules for {profile.visaType || 'the selected visa category'}.
            </div>
          </div>

          {/* AI Comparison Output Box */}
          {comparisonResults && (
            <div className="p-6 bg-[#111] border-2 border-yellow-500 rounded-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-yellow-500 tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Destination Assessment
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comparisonResults.map((dest, i) => (
                  <div key={i} className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-black uppercase text-white">{dest.country}</p>
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-mono font-bold">
                        {dest.suitabilityScore}% SUITABLE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888]">{dest.summary}</p>
                    <div className="text-[10px] font-mono text-[#666] pt-1">
                      Visas: {dest.keyVisas?.join(', ')} • ~${dest.estimatedMonthlyCostUSD}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
