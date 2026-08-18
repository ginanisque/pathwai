import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { MobilityAlert, AuditLog } from '../types';

interface AdminReviewViewProps {
  alerts: MobilityAlert[];
  onVerifyAlert: (alertId: string) => void;
  onPublishAlert: (alert: MobilityAlert) => void;
  onRemoveAlert: (alertId: string) => void;
}

export const AdminReviewView: React.FC<AdminReviewViewProps> = ({
  alerts,
  onVerifyAlert,
  onPublishAlert,
  onRemoveAlert
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newEffectiveDate, setNewEffectiveDate] = useState('');

  const handleManualPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSourceUrl.trim()) return;

    const alert: MobilityAlert = {
      id: `alert_admin_${Date.now()}`,
      userId: 'global',
      alertType: 'visa_policy',
      title: newTitle.trim(),
      summary: newSummary.trim() || 'Official gazette update verified by research team.',
      sourceUrl: newSourceUrl.trim(),
      publicationDate: new Date().toISOString().split('T')[0],
      effectiveDate: newEffectiveDate || new Date().toISOString().split('T')[0],
      affectedGroups: ['All Travellers'],
      confidenceLevel: 'high',
      recommendedAction: 'Verify documentation against official statute.',
      requiresLegalAdvice: true,
      isRead: false,
      verifiedByAdmin: true,
      createdAt: new Date().toISOString()
    };

    onPublishAlert(alert);
    setNewTitle('');
    setNewSummary('');
    setNewSourceUrl('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-yellow-500 font-mono font-black uppercase tracking-[0.2em] mb-2">08 RESEARCH REVIEWER & ADMIN PANEL</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Rule Verification & Publishing
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Review AI-generated rule alerts, verify official gazette URLs, and publish statutory warnings.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-sm text-xs font-mono text-yellow-400 font-bold">
          <span>ROLE: ADMINISTRATOR</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Unverified / Pending Rule Alerts Queue */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
            Immigration Rule Verification Queue
          </h3>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-3">
                  <div>
                    <h4 className="text-lg font-black uppercase text-white leading-tight">{alert.title}</h4>
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-yellow-400 font-mono underline flex items-center gap-1 mt-1"
                    >
                      Source URL: {alert.sourceUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.verifiedByAdmin ? (
                      <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                        VERIFIED BY ADMIN
                      </span>
                    ) : (
                      <button
                        onClick={() => onVerifyAlert(alert.id)}
                        className="px-3 py-1 bg-white hover:bg-neutral-200 text-black font-black uppercase text-[10px] rounded"
                      >
                        Approve & Verify Source
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveAlert(alert.id)}
                      className="text-[#555] hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#AAA] leading-relaxed">{alert.summary}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] bg-[#0A0A0A] p-3 rounded">
                  <div>
                    <span className="text-[#666] block">PUBLISHED</span>
                    <span className="text-white font-bold">{alert.publicationDate}</span>
                  </div>
                  <div>
                    <span className="text-[#666] block">EFFECTIVE</span>
                    <span className="text-yellow-400 font-bold">{alert.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-[#666] block">CONFIDENCE</span>
                    <span className="text-white font-bold">{alert.confidenceLevel.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[#666] block">LEGAL ADVICE</span>
                    <span className={alert.requiresLegalAdvice ? 'text-red-400 font-bold' : 'text-green-400'}>
                      {alert.requiresLegalAdvice ? 'REQUIRED' : 'OPTIONAL'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Publish Verified Official Rule Alert Form */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleManualPublish} className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
              Publish Verified Official Rule Alert
            </h3>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Alert Title</label>
              <input
                type="text"
                placeholder="e.g. Portugal SEF/AIMA Appointment Statute"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none rounded-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Official Gazette / Source URL (Mandatory)</label>
              <input
                type="url"
                placeholder="https://dre.pt/official-gazette-..."
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white font-mono focus:outline-none rounded-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Effective Date</label>
              <input
                type="date"
                value={newEffectiveDate}
                onChange={(e) => setNewEffectiveDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] px-3 py-2 text-xs text-white font-mono focus:outline-none rounded-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#777] mb-1">Executive Summary</label>
              <textarea
                rows={3}
                placeholder="Detailed regulatory summary for affected travellers..."
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333] p-2 text-xs text-white focus:outline-none rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs py-3 rounded-sm tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-black" />
              Publish Verified Alert
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
