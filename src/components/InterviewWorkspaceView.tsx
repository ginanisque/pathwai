import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles, MessageSquare, CheckCircle, HelpCircle, User, Award, Crown, Zap, Lock } from 'lucide-react';
import { InterviewAppointment, InterviewQuestion, MobilityProfile, UserTier } from '../types';
import { generateInterviewPrep } from '../lib/api';

interface InterviewWorkspaceViewProps {
  interviews: InterviewAppointment[];
  profile: MobilityProfile;
  onUpdateInterview: (interview: InterviewAppointment) => void;
  userTier?: UserTier;
  onOpenUpgradeModal?: (featureName?: string) => void;
}

export const InterviewWorkspaceView: React.FC<InterviewWorkspaceViewProps> = ({
  interviews,
  profile,
  onUpdateInterview,
  userTier = 'free',
  onOpenUpgradeModal
}) => {
  const [selectedInterview, setSelectedInterview] = useState<InterviewAppointment | null>(
    interviews.length > 0 ? interviews[0] : null
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const handleAiGenerateQuestions = async () => {
    if (!selectedInterview) return;
    setLoadingAi(true);

    try {
      const targetCountry = profile.destinationCountries?.[0] || 'Target Destination';
      const visaCategory = profile.visaType || 'Selected Visa Category';
      const data = await generateInterviewPrep(
        targetCountry,
        visaCategory,
        selectedInterview.stage || 'Consular Interview',
        profile
      );

      const updatedQuestions: InterviewQuestion[] = (data.questions || []).map((q, idx) => ({
        id: `q_ai_${Date.now()}_${idx}`,
        question: q.question,
        suggestedAnswer: q.suggestedAnswer,
        confidence: q.confidence || 'high'
      }));

      const updatedAppt: InterviewAppointment = {
        ...selectedInterview,
        questions: [...selectedInterview.questions, ...updatedQuestions],
        prepNotes: selectedInterview.prepNotes + (data.prepGuide ? `\n• AI Guide: ${data.prepGuide}` : '')
      };

      setSelectedInterview(updatedAppt);
      onUpdateInterview(updatedAppt);
    } catch (err) {
      console.error('Error generating prep:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUserAnswerChange = (qId: string, text: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: text }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-[#666] font-mono font-black uppercase tracking-[0.2em] mb-2">04 INTERVIEW PREPARATION</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Consular & Biometrics Workspace
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Interview appointment details, embassy guidelines, and AI-assisted question practice workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {userTier === 'free' && (
            <button
              onClick={() => onOpenUpgradeModal?.('Interactive AI Embassy Officer Simulator')}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold uppercase text-xs px-4 py-3 rounded-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span>Unlock AI Mock Officer Simulator (PRO)</span>
            </button>
          )}

          {selectedInterview && (
            <button
              onClick={handleAiGenerateQuestions}
              disabled={loadingAi}
              className="bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#333] text-white font-black uppercase text-xs px-5 py-3 tracking-widest flex items-center gap-2 rounded-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              {loadingAi ? 'Generating Questions...' : 'AI Consular Q&A Generator'}
            </button>
          )}
        </div>
      </div>

      {selectedInterview ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 4 Cols: Appointment Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-5">
              <div className="border-b border-[#222] pb-3">
                <span className="text-[9px] font-mono uppercase bg-yellow-500 text-black px-2 py-0.5 font-black">
                  {selectedInterview.status.toUpperCase()}
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-2 leading-tight">
                  {selectedInterview.title}
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <p className="text-[10px] text-[#666] uppercase">Consulate / Center</p>
                  <p className="text-white font-sans font-bold mt-0.5">{selectedInterview.embassyOrLocation}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-[#666] uppercase">Date</p>
                    <p className="text-white font-bold mt-0.5">{selectedInterview.appointmentDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666] uppercase">Time</p>
                    <p className="text-white font-bold mt-0.5">{selectedInterview.appointmentTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#666] uppercase">Stage</p>
                  <p className="text-yellow-400 font-bold mt-0.5">{selectedInterview.stage}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#222]">
                <p className="text-[10px] font-mono text-[#666] uppercase mb-1">Preparation Directives</p>
                <p className="text-xs text-[#AAA] leading-relaxed whitespace-pre-line bg-[#0A0A0A] p-3 rounded border border-[#222]">
                  {selectedInterview.prepNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Right 8 Cols: Interactive Q&A Practice Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white" />
                  Consular Interview Questions ({selectedInterview.questions.length})
                </h3>
                <span className="text-[10px] font-mono text-[#777]">PRACTICE WORKSPACE</span>
              </div>

              <div className="space-y-6">
                {selectedInterview.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-5 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white uppercase leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                        q.confidence === 'high' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {q.confidence} CONFIDENCE
                      </span>
                    </div>

                    {/* AI Suggested Response */}
                    <div className="p-4 bg-[#141414] border-l-2 border-white rounded-r-sm space-y-1">
                      <p className="text-[10px] font-mono uppercase text-[#777]">Recommended Consular Answer Strategy</p>
                      <p className="text-xs text-[#DDD] leading-relaxed font-sans">{q.suggestedAnswer}</p>
                    </div>

                    {/* User Practice Response Area */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                        Your Personalized Practice Answer & Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Type your rehearsed answer here to practice..."
                        value={userAnswers[q.id] || q.userNotes || ''}
                        onChange={(e) => handleUserAnswerChange(q.id, e.target.value)}
                        className="w-full bg-[#111] border border-[#333] p-2.5 text-xs text-white focus:border-white focus:outline-none rounded-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#111] border border-[#222] text-[#777]">
          No interview appointments scheduled yet.
        </div>
      )}
    </div>
  );
};
