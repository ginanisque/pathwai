import React, { useState, useEffect } from 'react';
import { Bell, ExternalLink, AlertTriangle, ShieldAlert, Sparkles, CheckCircle, Info, RefreshCw, Search, Globe, Plus, ArrowRight } from 'lucide-react';
import { MobilityAlert, MobilityProfile } from '../types';
import { fetchMobilityRuleAlerts, fetchLiveGoogleSearchNews, GoogleSearchNewsResult, GoogleSearchNewsItem } from '../lib/api';

interface MobilityAlertsViewProps {
  alerts: MobilityAlert[];
  profile: MobilityProfile;
  onAddAlert: (alert: MobilityAlert) => void;
  onMarkRead: (id: string) => void;
}

export const MobilityAlertsView: React.FC<MobilityAlertsViewProps> = ({
  alerts,
  profile,
  onAddAlert,
  onMarkRead
}) => {
  const [loadingAiAlerts, setLoadingAiAlerts] = useState(false);
  const [legalDisclaimer, setLegalDisclaimer] = useState<string>(
    'IMMIGRATION DISCLAIMER: Pathway AI provides intelligence and verified official reference links. It does not guarantee admission, entry, or visa issuance and does not constitute regulated legal advice.'
  );

  // Google Search Live News State
  const [searchCountry, setSearchCountry] = useState<string>(
    profile.destinationCountries?.[0] || 'Target Destination'
  );
  const [searchVisaType, setSearchVisaType] = useState<string>(
    profile.visaType || 'Selected Visa'
  );
  const [loadingGoogleSearch, setLoadingGoogleSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<GoogleSearchNewsResult | null>(null);

  useEffect(() => {
    const dest = profile.destinationCountries?.[0] || 'Target Destination';
    const visa = profile.visaType || 'Selected Visa';
    setSearchCountry(dest);
    setSearchVisaType(visa);
  }, [profile.destinationCountries, profile.visaType]);

  const handleFetchGoogleSearchNews = async (countryToSearch?: string) => {
    const country = countryToSearch || searchCountry || profile.destinationCountries?.[0] || 'Target Destination';
    const visa = searchVisaType || profile.visaType || 'Selected Visa';
    setLoadingGoogleSearch(true);
    try {
      const res = await fetchLiveGoogleSearchNews(country, visa);
      setSearchResult(res);
    } catch (err) {
      console.error('Failed to fetch Google Search news:', err);
    } finally {
      setLoadingGoogleSearch(false);
    }
  };

  useEffect(() => {
    const target = profile.destinationCountries?.[0];
    if (target) {
      handleFetchGoogleSearchNews(target);
    }
  }, [profile.destinationCountries, profile.visaType]);

  const handleImportNewsAsAlert = (item: GoogleSearchNewsItem) => {
    const newAlert: MobilityAlert = {
      id: `alert_gsearch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: profile.userId,
      alertType: (item.category as any) || 'visa_policy',
      title: `[Google Search Headline] ${item.title}`,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      publicationDate: item.publicationDate || new Date().toISOString().split('T')[0],
      effectiveDate: item.effectiveDate || new Date().toISOString().split('T')[0],
      affectedGroups: item.affectedGroups || ['Travelers', 'Applicants'],
      confidenceLevel: item.confidenceLevel || 'high',
      recommendedAction: item.recommendedAction,
      requiresLegalAdvice: true,
      isRead: false,
      verifiedByAdmin: true,
      createdAt: new Date().toISOString()
    };

    onAddAlert(newAlert);
  };

  const handleFetchRules = async () => {
    setLoadingAiAlerts(true);
    try {
      const data = await fetchMobilityRuleAlerts(profile);
      if (data.disclaimer) setLegalDisclaimer(data.disclaimer);

      (data.alerts || []).forEach((item, index) => {
        const newAlert: MobilityAlert = {
          id: `alert_ai_${Date.now()}_${index}`,
          userId: profile.userId,
          alertType: (item.alertType as any) || 'visa_policy',
          title: item.title || 'Regulatory Policy Update',
          summary: item.summary || 'Rule update evaluated by Gemini mobility engine.',
          sourceUrl: item.sourceUrl || 'https://europa.eu/official-gazette',
          publicationDate: item.publicationDate || new Date().toISOString().split('T')[0],
          effectiveDate: item.effectiveDate || new Date().toISOString().split('T')[0],
          affectedGroups: item.affectedGroups || ['Visa Applicants', 'Foreign Workers'],
          confidenceLevel: item.confidenceLevel || 'high',
          recommendedAction: item.recommendedAction || 'Review income records and official documentation.',
          requiresLegalAdvice: item.requiresLegalAdvice ?? true,
          isRead: false,
          verifiedByAdmin: false,
          createdAt: new Date().toISOString()
        };
        onAddAlert(newAlert);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiAlerts(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] text-[#666] font-mono font-black uppercase tracking-[0.2em] mb-2">06 RULE ALERTS & INTELLIGENCE</h2>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Personalised Mobility Alerts
          </h1>
          <p className="text-sm text-[#888] mt-2 font-medium">
            Immigration rule updates, statutory threshold changes, and official source URL verification.
          </p>
        </div>

        <button
          onClick={handleFetchRules}
          disabled={loadingAiAlerts}
          className="bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs px-5 py-3 tracking-widest flex items-center gap-2 rounded-sm transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-black" />
          {loadingAiAlerts ? 'Evaluating Rules...' : 'Re-Evaluate Regulatory Rules'}
        </button>
      </div>

      {/* Mandatory Regulatory Disclaimer Card */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-sm text-xs text-yellow-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black uppercase text-[10px] tracking-widest">Mandatory Legal & Information Disclaimer</p>
          <p className="text-[11px] leading-relaxed opacity-90">{legalDisclaimer}</p>
        </div>
      </div>

      {/* GOOGLE SEARCH REAL-TIME HEADLINE TRAVEL & VISA POLICY NEWS CARD */}
      <div className="p-6 bg-gradient-to-r from-[#0C1929] via-[#0A121D] to-[#111111] border border-blue-500/30 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-sm">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">
                  Google Search Live Policy Headlines
                </h3>
                <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold uppercase">
                  GROUNDED AI SEARCH
                </span>
              </div>
              <p className="text-xs text-[#AAA] mt-0.5">
                Fetches real-time travel alerts, border policy shifts, and visa regulatory news for your destination country using Google Search.
              </p>
            </div>
          </div>

          {/* Controls Form */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-1.5 bg-[#080E17] border border-blue-900/60 px-2.5 py-1.5 rounded-sm text-xs">
              <span className="text-[10px] font-mono text-[#777] uppercase font-bold">Country:</span>
              <input
                type="text"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="e.g. Portugal"
                className="bg-transparent text-white font-mono text-xs focus:outline-none w-28"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#080E17] border border-blue-900/60 px-2.5 py-1.5 rounded-sm text-xs">
              <span className="text-[10px] font-mono text-[#777] uppercase font-bold">Visa:</span>
              <input
                type="text"
                value={searchVisaType}
                onChange={(e) => setSearchVisaType(e.target.value)}
                placeholder="e.g. D7 Visa"
                className="bg-transparent text-white font-mono text-xs focus:outline-none w-28"
              />
            </div>

            <button
              onClick={() => handleFetchGoogleSearchNews()}
              disabled={loadingGoogleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase text-xs rounded-sm tracking-wider flex items-center gap-2 transition-colors shrink-0"
            >
              {loadingGoogleSearch ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Fetch Policy News</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results Display */}
        {searchResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#AAA]">
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                Query: <strong className="text-white">"{searchResult.searchQuery}"</strong>
              </span>
              <span className="text-blue-300 font-bold uppercase">
                {searchResult.newsHeadlines.length} Live Grounded Headlines Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult.newsHeadlines.map((news, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#080E17] border border-blue-900/50 hover:border-blue-500/50 rounded-sm space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold uppercase rounded border border-blue-500/30">
                        {news.category?.replace('_', ' ') || 'policy headline'}
                      </span>
                      <span className="text-[10px] font-mono text-[#888]">
                        Pub: {news.publicationDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white uppercase leading-snug">
                      {news.title}
                    </h4>

                    <p className="text-xs text-[#BBB] leading-relaxed">
                      {news.summary}
                    </p>

                    {news.recommendedAction && (
                      <div className="p-2.5 bg-blue-950/40 border-l-2 border-blue-400 text-[11px] text-blue-200">
                        <strong className="text-[9px] font-mono uppercase text-blue-300 block mb-0.5">Action Item:</strong>
                        {news.recommendedAction}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between gap-2 text-xs font-mono">
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-bold text-[11px] flex items-center gap-1 truncate"
                    >
                      <span>{news.sourceDomain || 'Official Gazette'}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                    </a>

                    <button
                      onClick={() => handleImportNewsAsAlert(news)}
                      className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 shrink-0 transition-colors"
                      title="Add this headline directly into your main alerts list"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Import Alert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Alert Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 border rounded-sm space-y-4 transition-all ${
                alert.isRead ? 'bg-[#0A0A0A] border-[#222] opacity-80' : 'bg-[#111] border-[#333]'
              }`}
            >
              {/* Alert Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase rounded-sm ${
                    alert.confidenceLevel === 'high' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    CONFIDENCE: {alert.confidenceLevel.toUpperCase()}
                  </span>

                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#222] text-white rounded">
                    {alert.alertType.replace('_', ' ')}
                  </span>

                  {alert.verifiedByAdmin && (
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                      ADMIN VERIFIED SOURCE
                    </span>
                  )}
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => onMarkRead(alert.id)}
                    className="text-[10px] font-mono text-[#AAA] hover:text-white uppercase underline"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              {/* Alert Content */}
              <div>
                <h3 className="text-xl font-black uppercase text-white leading-tight">{alert.title}</h3>
                <p className="text-xs text-[#CCC] leading-relaxed mt-2 font-sans">{alert.summary}</p>
              </div>

              {/* Mandatory Attributes: Official Source URL, Publication Date, Effective Date, Affected Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0A0A0A] border border-[#222] rounded-sm font-mono text-xs">
                <div>
                  <p className="text-[9px] text-[#666] uppercase">Publication Date</p>
                  <p className="text-white font-bold mt-0.5">{alert.publicationDate}</p>
                </div>

                <div>
                  <p className="text-[9px] text-[#666] uppercase">Effective Date</p>
                  <p className="text-yellow-400 font-bold mt-0.5">{alert.effectiveDate}</p>
                </div>

                <div>
                  <p className="text-[9px] text-[#666] uppercase">Official Source Domain</p>
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white font-bold hover:underline flex items-center gap-1 mt-0.5 text-[11px] truncate"
                  >
                    {alert.sourceUrl.replace('https://', '').split('/')[0]}
                    <ExternalLink className="w-3 h-3 text-yellow-500 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Affected Groups */}
              {alert.affectedGroups && alert.affectedGroups.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-[#666] uppercase mb-1">Affected Groups</p>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.affectedGroups.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#1C1C1C] border border-[#2D2D2D] text-white text-[10px] font-mono rounded-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div className="p-3 bg-[#181818] rounded-sm border-l-2 border-white text-xs space-y-1">
                <p className="text-[10px] font-mono uppercase font-bold text-white">Recommended Action</p>
                <p className="text-[#DDD] text-[11px] font-sans">{alert.recommendedAction}</p>
              </div>

              {/* Mandatory Legal Advice Warning */}
              {alert.requiresLegalAdvice && (
                <div className="p-3 bg-red-950/20 border border-red-600/30 rounded-sm text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-bold text-[10px] uppercase">
                    WARNING: Regulated immigration attorney / professional advice required for this change.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Sidebar: Categories & Legend */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-[#222] pb-3">
              Information Integrity Protocol
            </h3>
            <div className="space-y-3 text-xs text-[#888] leading-relaxed">
              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm">
                <p className="font-bold text-white uppercase text-[10px]">1. User Provided Data</p>
                <p className="text-[11px]">Inputs directly supplied in Mobility Profile & Document Tracker.</p>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm">
                <p className="font-bold text-white uppercase text-[10px]">2. Official Information</p>
                <p className="text-[11px]">Strictly verified gazettes and consular portal URLs (e.g. dre.pt).</p>
              </div>

              <div className="p-3 bg-[#0A0A0A] border border-[#222] rounded-sm">
                <p className="font-bold text-white uppercase text-[10px]">3. AI Interpretation</p>
                <p className="text-[11px]">Gemini 2.5 server-side summary & confidence calculation.</p>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-600/30 rounded-sm text-red-400">
                <p className="font-bold uppercase text-[10px]">4. Regulated Advice</p>
                <p className="text-[11px]">Must be confirmed by a licensed attorney or regulated consultant.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
