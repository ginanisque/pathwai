import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, AlertCircle, CheckCircle2, ArrowRight, Shield, 
  RefreshCw, FileText, UserCheck, Scale, GraduationCap, HeartHandshake, HelpCircle,
  Edit3, ExternalLink, FileSearch, UploadCloud, Check, X, ShieldCheck, Layers, Award,
  AlertTriangle, FileCheck, Crown, Zap, Lock
} from 'lucide-react';
import { MobilityProfile, UserTier } from '../types';
import { checkProfileCompleteness } from '../lib/profileUtils';
import { auth } from '../lib/firebase';

interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  missingFields?: string[];
  extractedUpdates?: Record<string, any>;
  suggestedActions?: Array<{ label: string; targetTab: string; actionType: string }>;
  statutoryReferences?: string[];
  confidenceRating?: 'high' | 'medium' | 'low';
  memoriesUsed?: AgentMemorySummary[];
  responseMode?: 'live_ai' | 'offline_fallback';
}

interface AgentMemorySummary {
  id: string;
  kind: string;
  content: string;
  similarity?: number;
  updatedAt: string;
}

interface ExtractedDocumentItem {
  id: string;
  name: string;
  type: 'passport' | 'proof_of_funds' | 'employment' | 'diploma' | 'police_check' | 'insurance' | 'visa_scan';
  extractedData?: {
    documentNumber?: string;
    expiryDate?: string;
    verifiedValue?: string;
    issuingAuthority?: string;
  };
  status?: 'verified' | 'flagged' | 'pending';
  confidenceScore?: number;
}

interface AssessmentReport {
  destinationCountry: string;
  visaPurpose: string;
  applicantNationality: string;
  overallEligibilityScore: number;
  complianceStatus: 'Verified Compliant' | 'Conditional / Missing Documents' | 'High Risk of Rejection';
  summaryHeadline: string;
  summaryParagraph: string;
  extractedDocuments: Array<{
    documentId: string;
    title: string;
    category: string;
    extractedFields: Record<string, string>;
    status: 'verified' | 'flagged' | 'expired';
    confidenceScore: number;
    policyMappingNotes: string;
  }>;
  policyRuleMappings: Array<{
    ruleName: string;
    statutoryRequirement: string;
    extractedValueFromDoc: string;
    ruleStatus: 'passed' | 'failed' | 'action_needed';
    statutoryReference: string;
  }>;
  missingMandatoryDocs: string[];
  actionRecommendations: string[];
  disclaimer: string;
}

interface MobilityAiAgentViewProps {
  profile: MobilityProfile;
  onUpdateProfile: (updatedProfile: Partial<MobilityProfile>) => void;
  onNavigateTab: (tab: string) => void;
  userTier?: UserTier;
  onOpenUpgradeModal?: (featureName?: string) => void;
}

export const MobilityAiAgentView: React.FC<MobilityAiAgentViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  userTier = 'free',
  onOpenUpgradeModal
}) => {
  // Agent Sub-Mode State: 'chat' or 'realtime_visa_doc_agent'
  const [activeAgentMode, setActiveAgentMode] = useState<'chat' | 'realtime_visa_doc_agent'>('chat');

  // Chat State
  const [messages, setMessages] = useState<AgentChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'agent',
      text: `Hello ${profile.fullName || 'Traveller'}. I am your **PathWai Mobility Information Assistant**.

I have loaded your active profile:
- **Nationality:** ${profile.nationality || 'Not specified'}
- **Current Location:** ${profile.currentCountry || 'Not specified'}
- **Target Destination(s):** ${profile.destinationCountries?.join(', ') || 'None selected'}
- **Status / Visa:** ${profile.currentImmigrationStatus || 'Unspecified'} (${profile.visaType || 'No visa category selected'})
- **Liquid Capital / Budget:** $${profile.budget?.toLocaleString() || 0} USD

When persistent memory is enabled, you do not need to repeat approved context. I can help organize questions and next steps, but I am not a lawyer or emergency service. Verify requirements with official authorities or a qualified professional. How can I help today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Run Real-Time Visa & Doc Extraction Agent', targetTab: 'agent', actionType: 'switch_mode' },
        { label: 'Check F-1 & SEVIS Status', targetTab: 'relief', actionType: 'navigate' },
        { label: 'Run Visa Eligibility Audit', targetTab: 'assessment', actionType: 'navigate' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [memoryItems, setMemoryItems] = useState<AgentMemorySummary[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [memoryError, setMemoryError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentApiBase = (import.meta.env.VITE_AGENT_API_URL || '').replace(/\/$/, '');
  const memoryUserId = profile.userId || 'pathwai-demo-traveller';

  const getAuthorizationHeaders = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadMemories = async () => {
    setMemoryStatus('loading');
    try {
      const authorization = await getAuthorizationHeaders();
      if (!authorization.Authorization) throw new Error('Sign in to use persistent memory.');
      const result = await fetch(`${agentApiBase}/api/memory`, { headers: authorization });
      if (!result.ok) throw new Error('memory unavailable');
      const data = await result.json();
      setMemoryItems(data.memories || []);
      setMemoryStatus('ready');
      setMemoryError('');
    } catch (error) {
      setMemoryError(error instanceof Error ? error.message : 'Memory service unavailable.');
      setMemoryStatus('unavailable');
    }
  };

  const handleMemoryToggle = async () => {
    const next = !memoryEnabled;
    if (next && !auth.currentUser) {
      setMemoryError('Sign in before enabling persistent memory.');
      setMemoryStatus('unavailable');
      return;
    }
    setMemoryEnabled(next);
    if (!next) return;
    try {
      const authorization = await getAuthorizationHeaders();
      await fetch(`${agentApiBase}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({
          kind: 'profile',
          content: `Traveller context: nationality ${profile.nationality || 'unspecified'}; current country ${profile.currentCountry || 'unspecified'}; destination ${profile.destinationCountries?.join(', ') || 'unspecified'}; purpose ${profile.purposeOfTravel || 'unspecified'}; budget USD ${profile.budget || 0}.`,
          metadata: { source: 'explicit-memory-opt-in' }
        })
      });
      await loadMemories();
    } catch {
      setMemoryStatus('unavailable');
    }
  };

  const handleForgetMemory = async (memoryId: string) => {
    const authorization = await getAuthorizationHeaders();
    await fetch(`${agentApiBase}/api/memory/${memoryId}`, {
      method: 'DELETE',
      headers: authorization
    });
    setMemoryItems(items => items.filter(item => item.id !== memoryId));
  };

  // Real-Time Document Extraction Agent State
  const [destCountry, setDestCountry] = useState<string>(profile.destinationCountries?.[0] || 'Portugal');
  const [visaPurpose, setVisaPurpose] = useState<string>(profile.purposeOfTravel || 'digital_nomad');
  const [uploadedDocs, setUploadedDocs] = useState<ExtractedDocumentItem[]>([
    {
      id: 'doc-1',
      name: 'Passport_Biometric_Scan.pdf',
      type: 'passport',
      extractedData: {
        documentNumber: 'P-98241029',
        expiryDate: '2033-01-14',
        verifiedValue: 'Valid Passport (Exp 2033 - 7+ Yrs Remaining)',
        issuingAuthority: `${profile.nationality || 'Canada'} Passport Office`
      },
      status: 'verified',
      confidenceScore: 97
    },
    {
      id: 'doc-2',
      name: 'Bank_Statement_Liquid_Equity.pdf',
      type: 'proof_of_funds',
      extractedData: {
        documentNumber: 'BS-882109',
        expiryDate: 'N/A',
        verifiedValue: `$${(profile.budget || 25000).toLocaleString()} USD Liquid Capital Balance`,
        issuingAuthority: 'Tier 1 Chartered Bank'
      },
      status: 'verified',
      confidenceScore: 93
    },
    {
      id: 'doc-3',
      name: 'Remote_Employment_Contract.pdf',
      type: 'employment',
      extractedData: {
        documentNumber: 'EMP-9012',
        expiryDate: 'Indefinite',
        verifiedValue: 'Full-Time Remote Tech Contract ($4,800/mo)',
        issuingAuthority: 'Global Tech Corp'
      },
      status: 'verified',
      confidenceScore: 91
    }
  ]);

  const [isExtractingDocs, setIsExtractingDocs] = useState(false);
  const [docAssessmentReport, setDocAssessmentReport] = useState<AssessmentReport | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const profileCompletenessInfo = checkProfileCompleteness(profile);
  const profileScore = profileCompletenessInfo.percentage;
  const missingProfileFields = profileCompletenessInfo.missingFields;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const authorization = await getAuthorizationHeaders();
      if (agentApiBase && !authorization.Authorization) {
        throw new Error('Sign in to use the deployed PathWai agent.');
      }
      const response = await fetch(`${agentApiBase}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({
          prompt: query,
          profile,
          currentTab: 'agent',
          history: historyPayload,
          memoryEnabled
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error response');
      }

      const data = await response.json();

      const agentMsg: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || 'I have analyzed your parameters against current statutory frameworks.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        missingFields: data.missingFields || [],
        extractedUpdates: data.extractedUpdates || {},
        suggestedActions: data.suggestedActions || [],
        statutoryReferences: data.statutoryReferences || [],
        confidenceRating: data.confidenceRating || 'high',
        memoriesUsed: data.memoriesUsed || [],
        responseMode: data.responseMode || 'live_ai'
      };

      setMessages(prev => [...prev, agentMsg]);
      if (memoryEnabled) loadMemories();

      // If AI extracted automatic profile updates, trigger callback if valid
      if (data.extractedUpdates && Object.keys(data.extractedUpdates).length > 0) {
        onUpdateProfile(data.extractedUpdates);
      }

    } catch (err) {
      console.error('AI Agent request failed:', err);
      const errorMsg: AgentChatMessage = {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        text: `I experienced a temporary communication issue connecting to statutory databases. 

**Quick Recommendations based on your saved profile:**
- **Passport:** ${profile.passportExpiration ? `Expires on ${profile.passportExpiration}` : 'Please add your passport expiration date.'}
- **Visa Goal:** ${profile.visaType || 'Select a visa category in Visa Assessment.'}
- **Need Humanitarian/Student Support?** You can navigate to **Student & Relief** to evaluate SEVIS reinstatement or emergency legal safeguards.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Go to Student & Relief', targetTab: 'relief', actionType: 'navigate' },
          { label: 'Update Profile Details', targetTab: 'profile', actionType: 'navigate' }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run Real-time Document AI Visa Assessment
  const handleRunRealtimeDocAssessment = async () => {
    setIsExtractingDocs(true);
    setDocAssessmentReport(null);

    try {
      const response = await fetch('/api/agent/visa-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          documents: uploadedDocs,
          destinationCountry: destCountry,
          visaPurpose: visaPurpose
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run document assessment');
      }

      const report: AssessmentReport = await response.json();
      setDocAssessmentReport(report);

      // Auto-post an agent notification message in chat
      const agentMsg: AgentChatMessage = {
        id: `agent-report-${Date.now()}`,
        sender: 'agent',
        text: `### Real-Time Visa Requirement Assessment Complete for ${report.destinationCountry}

**Eligibility Score:** ${report.overallEligibilityScore}/100 (${report.complianceStatus})

${report.summaryParagraph}

- **Extracted Documents Audited:** ${report.extractedDocuments.length}
- **Policy Rules Evaluated:** ${report.policyRuleMappings.length}
- **Missing Mandatory Docs:** ${report.missingMandatoryDocs.length === 0 ? 'None (Full Set Uploaded)' : report.missingMandatoryDocs.join(', ')}

You can review the full extraction matrix below or ask me any questions regarding your document validation!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        statutoryReferences: report.policyRuleMappings.map(r => r.statutoryReference).filter(Boolean)
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Error running real-time doc assessment:', err);
    } finally {
      setIsExtractingDocs(false);
    }
  };

  const handleAddSampleDoc = (docType: ExtractedDocumentItem['type'], name: string) => {
    const newDoc: ExtractedDocumentItem = {
      id: `doc-${Date.now()}`,
      name,
      type: docType,
      extractedData: {
        documentNumber: `FILE-${Math.floor(10000 + Math.random() * 90000)}`,
        expiryDate: '2026-12-31',
        verifiedValue: 'Sample Verified Attachment',
        issuingAuthority: 'Official Issuer'
      },
      status: 'verified',
      confidenceScore: 95
    };
    setUploadedDocs(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 font-mono animate-fadeIn">
      {/* Profile Incomplete Banner */}
      {!profileCompletenessInfo.isFilled && (
        <div className="p-4 bg-amber-950/40 border-2 border-amber-500/60 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-300">
                  Profile Details Required Before Visa Evaluation
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/30 text-amber-200 text-[9px] font-bold rounded">
                  {profileCompletenessInfo.percentage}% Complete
                </span>
              </div>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                To provide relevant informational guidance, PathWai needs these profile fields: {profileCompletenessInfo.missingFields.map(m => m.label).join(', ')}. Do not enter document numbers or other highly sensitive data.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>Update Profile Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Mode Header & Switcher */}
      <div className="p-5 bg-[#111] border border-[#222] rounded-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/40 rounded-sm flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase text-white tracking-wider">
                  PATHWAY DEDICATED AI MOBILITY AGENT
                </h2>
                {userTier === 'pro' ? (
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold uppercase rounded-sm flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                    PRO UNLIMITED CONSULTATIONS
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenUpgradeModal?.('Unlimited AI Consultations')}
                    className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30 text-[9px] font-bold uppercase rounded-sm flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Zap className="w-3 h-3 text-blue-400" />
                    FREE PLAN (3 DAILY QUOTA) — UPGRADE TO UNLIMITED PRO
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#888] mt-0.5">
                Performs real-time visa requirement assessments, extracting information from uploaded documents and mapping against immigration policy rules.
              </p>
            </div>
          </div>

          {/* Agent Sub-Mode Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-[#181818] p-1 border border-[#2A2A2A] rounded-sm shrink-0">
            <button
              onClick={() => setActiveAgentMode('chat')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1.5 transition-all ${
                activeAgentMode === 'chat'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Mobility Guidance Chat</span>
            </button>
            <button
              onClick={() => setActiveAgentMode('realtime_visa_doc_agent')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1.5 transition-all ${
                activeAgentMode === 'realtime_visa_doc_agent'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Real-Time Visa & Doc Agent</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161616] p-3 rounded-sm border border-[#222]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-[#CCC]">
              Active Profile: <strong className="text-white">{profile.fullName || 'Traveller'}</strong> ({profile.nationality || 'Unspecified'}) &rarr; Target: <strong className="text-amber-400">{profile.destinationCountries?.[0] || 'Portugal'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase">
            <span className="text-[#888]">Readiness:</span>
            <span className={profileScore >= 80 ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>{profileScore}% Synced</span>
          </div>
        </div>
      </div>

      {/* MODE 2: Dedicated Real-Time Visa Requirement & Document Extraction Agent */}
      {activeAgentMode === 'realtime_visa_doc_agent' && (
        <div className="space-y-6">
          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  REAL-TIME DOCUMENT EXTRACTION & POLICY MAPPING ENGINE
                </h3>
              </div>
              <span className="text-[10px] text-[#777] font-mono">
                Powered by Gemini AI Vision OCR
              </span>
            </div>

            {/* Target Parameters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#141414] p-3 border border-[#262626] rounded-sm">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#888] block mb-1">Target Destination Country</label>
                <select
                  value={destCountry}
                  onChange={(e) => setDestCountry(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333] text-white text-xs p-2 rounded-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="Portugal">Portugal (D7 / Digital Nomad / D2)</option>
                  <option value="Spain">Spain (Digital Nomad / Non-Lucrative)</option>
                  <option value="Germany">Germany (Opportunity Card / Skilled Worker)</option>
                  <option value="United States">United States (F-1 / O-1 / EB-2 NIW)</option>
                  <option value="United Kingdom">United Kingdom (Skilled Worker / Global Talent)</option>
                  <option value="Rwanda">Rwanda (Entrepreneur / Investor RDB)</option>
                  <option value="Ghana">Ghana (Business & Residence GIPC)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#888] block mb-1">Visa Category / Purpose</label>
                <select
                  value={visaPurpose}
                  onChange={(e) => setVisaPurpose(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#333] text-white text-xs p-2 rounded-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="visit">Short Visit / Tourism / Visitor Visa</option>
                  <option value="digital_nomad">Digital Nomad & Remote Work</option>
                  <option value="student_f1">Student & Higher Education (F-1/SEVIS)</option>
                  <option value="business_investor">Business & Foreign Investment</option>
                  <option value="permanent_residence">Permanent Residency & Skilled Migration</option>
                  <option value="family_reunification">Spousal / Family Reunification</option>
                </select>
              </div>
            </div>

            {/* Document Upload & Pre-Loaded Files Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white">
                  Uploaded Documents to Extract & Audit ({uploadedDocs.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#777]">Add Sample Document:</span>
                  <button
                    onClick={() => handleAddSampleDoc('police_check', 'Police_Clearance_Apostille.pdf')}
                    className="px-2 py-1 bg-[#222] hover:bg-[#333] text-amber-400 text-[10px] font-bold rounded-sm border border-[#333]"
                  >
                    + Police Record
                  </button>
                  <button
                    onClick={() => handleAddSampleDoc('diploma', 'University_Degree_Apostille.pdf')}
                    className="px-2 py-1 bg-[#222] hover:bg-[#333] text-amber-400 text-[10px] font-bold rounded-sm border border-[#333]"
                  >
                    + Degree Diploma
                  </button>
                  <button
                    onClick={() => handleAddSampleDoc('insurance', 'Schengen_Health_Insurance.pdf')}
                    className="px-2 py-1 bg-[#222] hover:bg-[#333] text-amber-400 text-[10px] font-bold rounded-sm border border-[#333]"
                  >
                    + Health Policy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="p-3 bg-[#141414] border border-[#262626] rounded-sm space-y-2 relative group">
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="absolute top-2 right-2 text-[#666] hover:text-red-400 p-1 transition-colors"
                      title="Remove document"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate pr-4">
                        <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                        <span className="text-[9px] uppercase font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                          {doc.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {doc.extractedData && (
                      <div className="text-[10px] text-[#999] space-y-0.5 bg-[#0C0C0C] p-2 rounded-sm border border-[#1E1E1E]">
                        <p><strong className="text-white">Extracted:</strong> {doc.extractedData.verifiedValue}</p>
                        <p><strong className="text-white">Issuer:</strong> {doc.extractedData.issuingAuthority}</p>
                        <p><strong className="text-white">Expiry:</strong> {doc.extractedData.expiryDate}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Drag and Drop Zone Simulator */}
                <div className="p-4 border-2 border-dashed border-[#333] hover:border-amber-500/60 bg-[#121212] rounded-sm flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors"
                     onClick={() => handleAddSampleDoc('insurance', `Custom_Scan_${Date.now().toString().slice(-4)}.pdf`)}>
                  <UploadCloud className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Upload New Document</span>
                    <span className="text-[10px] text-[#666]">PDF, JPG, PNG (Passport, Bank Statement, Visa)</span>
                  </div>
                </div>
              </div>

              {/* Action Button to Run Assessment */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRunRealtimeDocAssessment}
                  disabled={isExtractingDocs || uploadedDocs.length === 0}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-xs rounded-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  {isExtractingDocs ? (
                    <>
                      <Sparkles className="w-4 h-4 text-black animate-spin" />
                      <span>Extracting Data & Mapping Statutory Policy Rules...</span>
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 text-black" />
                      <span>RUN REAL-TIME AI VISA ASSESSMENT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Assessment Report Results Card */}
          {docAssessmentReport && (
            <div className="p-5 bg-[#0F0F0F] border border-amber-500/30 rounded-sm space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <h3 className="text-sm font-black uppercase text-white">
                      {docAssessmentReport.summaryHeadline}
                    </h3>
                  </div>
                  <p className="text-xs text-[#AAA] mt-1">
                    {docAssessmentReport.summaryParagraph}
                  </p>
                </div>

                <div className="p-3 bg-[#181818] border border-[#2A2A2A] rounded-sm text-right shrink-0">
                  <span className="text-[10px] text-[#888] font-bold uppercase block">Compliance Score</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black text-amber-400">
                      {docAssessmentReport.overallEligibilityScore}
                    </span>
                    <span className="text-xs text-green-400 font-bold uppercase">
                      / 100 ({docAssessmentReport.complianceStatus})
                    </span>
                  </div>
                </div>
              </div>

              {/* Policy Rule Mapping Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Statutory Policy Rule Mapping Matrix
                </h4>

                <div className="overflow-x-auto border border-[#222] rounded-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181818] text-[#888] uppercase font-bold text-[10px] border-b border-[#262626]">
                      <tr>
                        <th className="p-2.5">Immigration Policy Rule</th>
                        <th className="p-2.5">Statutory Requirement</th>
                        <th className="p-2.5">Extracted Document Data</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Statutory Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] bg-[#111]">
                      {docAssessmentReport.policyRuleMappings.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-[#161616] transition-colors">
                          <td className="p-2.5 font-bold text-white">{rule.ruleName}</td>
                          <td className="p-2.5 text-[#AAA]">{rule.statutoryRequirement}</td>
                          <td className="p-2.5 text-amber-300 font-mono text-[11px]">{rule.extractedValueFromDoc}</td>
                          <td className="p-2.5">
                            {rule.ruleStatus === 'passed' ? (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/40 rounded-sm text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                                <Check className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Action Needed
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-[10px] text-[#777] font-mono">{rule.statutoryReference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations & Action Plan */}
              <div className="p-4 bg-[#141414] border border-[#262626] rounded-sm space-y-2">
                <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Next Mandatory Action Steps
                </h4>
                <ul className="list-disc list-inside text-xs text-[#CCC] space-y-1">
                  {docAssessmentReport.actionRecommendations.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[10px] text-[#666] italic">
                {docAssessmentReport.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODE 1: General mobility guidance stream (or embedded below Mode 2) */}
      {(activeAgentMode === 'chat' || docAssessmentReport) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#888] font-mono">
            <span>LIVE AGENT INTERACTIVE CONSULTATION</span>
            <span>Ask follow-up questions on documents, SEVIS, VAWA, tax & capital rules</span>
          </div>

          <section className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4" aria-labelledby="agent-memory-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 id="agent-memory-heading" className="text-sm font-bold text-white">Persistent trip memory</h3>
                <p className="mt-1 text-xs text-cyan-100/70">Opt in to let the agent recall your saved context from CockroachDB across sessions. Avoid storing passport numbers or precise locations.</p>
              </div>
              <button
                type="button"
                onClick={handleMemoryToggle}
                aria-pressed={memoryEnabled}
                className={`rounded-md px-4 py-2 text-xs font-bold ${memoryEnabled ? 'bg-cyan-400 text-slate-950' : 'border border-cyan-400/50 text-cyan-200'}`}
              >
                {memoryEnabled ? 'Memory on' : 'Enable memory'}
              </button>
            </div>
            {memoryEnabled && (
              <div className="mt-3 border-t border-cyan-500/20 pt-3">
                <div className="mb-2 flex items-center justify-between text-xs text-cyan-100/70">
                  <span>{memoryStatus === 'unavailable' ? (memoryError || 'Memory service unavailable') : `${memoryItems.length} saved memories`}</span>
                  <button type="button" onClick={loadMemories} className="text-cyan-300 hover:text-white">Refresh</button>
                </div>
                <div className="max-h-36 space-y-2 overflow-y-auto">
                  {memoryItems.slice(0, 6).map(memory => (
                    <div key={memory.id} className="flex items-start justify-between gap-3 rounded bg-black/20 p-2 text-xs">
                      <div><span className="mr-2 text-cyan-300">{memory.kind}</span><span className="text-slate-300">{memory.content}</span></div>
                      <button type="button" onClick={() => handleForgetMemory(memory.id)} aria-label={`Forget ${memory.kind} memory`} className="shrink-0 text-rose-300 hover:text-rose-200">Forget</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Suggested Quick Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => handleSendMessage("How can Pathway AI help an F-1 student who is currently out of status or had their SEVIS record terminated?")}
              className="p-3 bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-amber-500/50 rounded-sm text-left transition-all space-y-1 group"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <GraduationCap className="w-4 h-4" />
                <span className="font-bold uppercase text-[11px] text-white group-hover:text-amber-300">F-1 & SEVIS Relief</span>
              </div>
              <p className="text-[10px] text-[#777] line-clamp-2">Reinstatement I-539 rules & grace period timelines</p>
            </button>

            <button
              onClick={() => handleSendMessage("What statutory protection or self-petition options (VAWA/T-Visa) exist if a spouse holds my documents or if I face abuse?")}
              className="p-3 bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-purple-500/50 rounded-sm text-left transition-all space-y-1 group"
            >
              <div className="flex items-center gap-2 text-purple-400">
                <Scale className="w-4 h-4" />
                <span className="font-bold uppercase text-[11px] text-white group-hover:text-purple-300">VAWA & Abuse Relief</span>
              </div>
              <p className="text-[10px] text-[#777] line-clamp-2">Confidential self-petition & document protection</p>
            </button>

            <button
              onClick={() => handleSendMessage("Based on my profile capital and target destination, what foreign investment capital barriers or property traps exist?")}
              className="p-3 bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-blue-500/50 rounded-sm text-left transition-all space-y-1 group"
            >
              <div className="flex items-center gap-2 text-blue-400">
                <FileText className="w-4 h-4" />
                <span className="font-bold uppercase text-[11px] text-white group-hover:text-blue-300">Capital & Property Traps</span>
              </div>
              <p className="text-[10px] text-[#777] line-clamp-2">GIPC $100k limits, Rwanda $0 capital, 50-yr leases</p>
            </button>

            <button
              onClick={() => handleSendMessage("Evaluate my 183-day tax residency risk and corporate Permanent Establishment (PE) liability.")}
              className="p-3 bg-[#111] hover:bg-[#181818] border border-[#222] hover:border-emerald-500/50 rounded-sm text-left transition-all space-y-1 group"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span className="font-bold uppercase text-[11px] text-white group-hover:text-emerald-300">183-Day Tax Risk</span>
              </div>
              <p className="text-[10px] text-[#777] line-clamp-2">Physical presence tax logging & remote employer rules</p>
            </button>
          </div>

          {/* Main Conversation Stream */}
          <div className="bg-[#0D0D0D] border border-[#222] rounded-sm flex flex-col h-[520px]">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/40 rounded-sm flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-amber-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-sm p-4 text-xs space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#1C1C1C] border border-[#333] text-white'
                        : 'bg-[#141414] border border-[#262626] text-[#DDD]'
                    }`}
                  >
                    {msg.sender === 'agent' && msg.responseMode && (
                      <div className={`inline-flex rounded px-2 py-1 text-[9px] font-bold uppercase ${msg.responseMode === 'live_ai' ? 'bg-green-950/50 text-green-300' : 'bg-amber-950/50 text-amber-300'}`}>
                        {msg.responseMode === 'live_ai' ? 'Live AI response' : 'Offline fallback — verify before acting'}
                      </div>
                    )}
                    {/* Header info */}
                    <div className="flex items-center justify-between text-[10px] text-[#777] border-b border-[#222] pb-1.5 font-mono">
                      <span className="font-bold uppercase text-[#999]">
                        {msg.sender === 'user' ? (profile.fullName || 'You') : 'Pathway AI Agent'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Body (Markdown formatted view) */}
                    <div className="whitespace-pre-wrap leading-relaxed font-mono">
                      {msg.text}
                    </div>

                    {/* Statutory References Badge */}
                    {msg.statutoryReferences && msg.statutoryReferences.length > 0 && (
                      <div className="pt-2 border-t border-[#222] flex flex-wrap items-center gap-1.5 text-[9px]">
                        <span className="text-[#666] uppercase font-bold">Statutory Frameworks:</span>
                        {msg.statutoryReferences.map((ref, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#222] border border-[#333] text-amber-300 rounded-sm">
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}

                    {msg.memoriesUsed && msg.memoriesUsed.length > 0 && (
                      <div className="rounded border border-cyan-500/30 bg-cyan-950/20 p-2 text-[10px] text-cyan-100">
                        Recalled from CockroachDB: {msg.memoriesUsed.map(memory => memory.kind).join(', ')}
                      </div>
                    )}

                    {/* Extracted Updates Prompt if any */}
                    {msg.extractedUpdates && Object.keys(msg.extractedUpdates).length > 0 && (
                      <div className="p-2.5 bg-green-950/30 border border-green-500/40 rounded-sm text-[11px] text-green-300 space-y-1">
                        <span className="font-bold uppercase text-[10px] block text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Auto-Synchronized to Profile:
                        </span>
                        <p className="text-[10px] text-[#CCC]">
                          {JSON.stringify(msg.extractedUpdates)}
                        </p>
                      </div>
                    )}

                    {/* Suggested Action Buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-[#222] flex flex-wrap gap-2">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.actionType === 'switch_mode') {
                                setActiveAgentMode('realtime_visa_doc_agent');
                              } else {
                                onNavigateTab(act.targetTab);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-white text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 transition-colors"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3 text-amber-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 bg-[#222] border border-[#333] rounded-sm flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/40 rounded-sm flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                  </div>
                  <div className="p-3 bg-[#141414] border border-[#262626] rounded-sm text-xs text-[#AAA] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Analyzing statutory immigration frameworks & user profile parameters...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#111] border-t border-[#222] flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about document extraction, F-1 reinstatement, VAWA, visa rules, or capital barriers..."
                className="flex-1 bg-[#1A1A1A] border border-[#333] text-white text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500 placeholder-[#666]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputQuery.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-xs rounded-sm transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">Ask Agent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
