import React, { useState, useEffect } from 'react';
import { Compass, Bot, FileText, Sparkles, ChevronRight, ChevronLeft, X, CheckCircle, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export interface TourStep {
  id: string;
  tabId: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlights: { icon: string; title: string; text: string }[];
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    tabId: 'overview',
    badge: 'Step 1 of 3 • Navigation Baseline',
    title: 'Command Overview & Mobility Roadmap',
    icon: Compass,
    description: 'Your central command hub for tracking international relocation, statutory visa workflows, and real-time safety status.',
    highlights: [
      {
        icon: '📍',
        title: 'Live Route Tracking',
        text: 'View origin-to-destination milestones, statutory timelines, and embassy interview schedules.'
      },
      {
        icon: '🛡️',
        title: 'Safety & SOS Monitor',
        text: 'Keep track of active check-in timers and emergency escalation triggers for total peace of mind.'
      },
      {
        icon: '📊',
        title: 'Audit & Action Hub',
        text: 'Get immediate prompts on required next steps, document deadlines, and profile updates.'
      }
    ],
    tip: 'Tip: You can customize your relocation origin and target country directly from your Profile settings anytime.'
  },
  {
    id: 'agent',
    tabId: 'agent',
    badge: 'Step 2 of 3 • AI Guidance',
    title: 'Sovereign AI Mobility Assistant',
    icon: Bot,
    description: 'A 24/7 intelligent immigration advisor trained on statutory visa regulations, relocation requirements, and embassy protocols.',
    highlights: [
      {
        icon: '💬',
        title: 'Instant Visa Answers',
        text: 'Ask questions in plain language about visa categories (Digital Nomad, D7, Express Entry, Study Permits).'
      },
      {
        icon: '🔍',
        title: 'Document Auditing',
        text: 'Paste or upload letter excerpts for instant statutory risk analysis and requirement checks.'
      },
      {
        icon: '🌍',
        title: 'Country Guidance',
        text: 'Get tailored advice on proof of funds, local accommodation, health insurance, and tax residency.'
      }
    ],
    tip: 'Tip: Click suggested prompt pills in the AI Agent chat to quickly trigger deep visa analyses.'
  },
  {
    id: 'documents',
    tabId: 'documents',
    badge: 'Step 3 of 3 • Secure Vault',
    title: 'Document Vault & Risk Assessor',
    icon: FileText,
    description: 'Encrypt, organize, and verify all required relocation documentation before submitting to consulates.',
    highlights: [
      {
        icon: '📁',
        title: 'Categorized Storage',
        text: 'Keep bank statements, police clearances, birth certificates, and sponsor letters securely organized.'
      },
      {
        icon: '⚠️',
        title: 'Automated Risk Scoring',
        text: 'Identify missing stamps, invalid dates, insufficient funds, or formatting errors before submission.'
      },
      {
        icon: '🔐',
        title: 'Client-Side Privacy',
        text: 'All documents are protected with high-grade local encryption and granular access permissions.'
      }
    ],
    tip: 'Tip: Use the "Run Compliance Check" tool inside the Vault to audit your application bundle.'
  }
];

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTab: (tabId: string) => void;
  onCompleteTour: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onSwitchTab,
  onCompleteTour
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];

  // Auto-switch tab in parent when step changes
  useEffect(() => {
    if (isOpen && step) {
      onSwitchTab(step.tabId);
    }
  }, [isOpen, currentStepIndex, step, onSwitchTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = () => {
    onCompleteTour();
    onClose();
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      {/* Spotlight overlay container */}
      <div className="bg-[#111116] border border-[#2D2D3B] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans text-white">
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
                PathWAI Onboarding Guide
              </span>
              <span className="text-xs text-[#888] font-mono">
                Guided App Walkthrough
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white hover:bg-[#22222C] rounded-lg transition-colors flex items-center gap-1 text-xs font-mono"
            title="Skip tour"
          >
            <span>Skip</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono text-[#AAA] mb-2">
            <span className="font-bold text-blue-300">{step.badge}</span>
            <span>{Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}% Completed</span>
          </div>
          <div className="h-1.5 w-full bg-[#1C1C24] rounded-full overflow-hidden flex gap-1 p-0.5 border border-[#2A2A38]">
            {TOUR_STEPS.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-full rounded-full flex-1 transition-all cursor-pointer ${
                  idx <= currentStepIndex ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-[#252532]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-5 relative z-10">
          {/* Title & Icon Header */}
          <div className="flex items-start gap-3.5 bg-[#16161E] p-4 rounded-xl border border-[#272736]">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-mono">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#AAA] mt-1 font-mono leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlights List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {step.highlights.map((item, idx) => (
              <div key={idx} className="bg-[#14141B] border border-[#242432] p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="text-lg mb-1">{item.icon}</div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#888] font-mono leading-snug">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro-Tip Box */}
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-200 text-xs font-mono flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{step.tip}</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-8 pt-4 border-t border-[#22222E] flex items-center justify-between gap-4 relative z-10">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all ${
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-[#666]'
                : 'text-[#AAA] hover:text-white bg-[#1A1A24] hover:bg-[#252533] border border-[#2D2D3D]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="text-xs font-mono text-[#888] hover:text-[#CCC] px-3 py-2 transition-colors hidden sm:block"
            >
              End Tour
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-mono text-xs uppercase rounded-lg shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>
                  <span>Got It — Launch App</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
