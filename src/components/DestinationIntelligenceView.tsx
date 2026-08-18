import React, { useState, useEffect } from 'react';
import { 
  Globe, Scale, Building2, Home, ShieldAlert, AlertTriangle, CheckCircle2, 
  Sparkles, RefreshCw, ArrowRight, DollarSign, Flag, Compass, Check, X, Info, FileText, Lock
} from 'lucide-react';
import { MobilityProfile } from '../types';
import { fetchDestinationIntelligence, DestinationIntelligenceResult } from '../lib/api';

interface DestinationIntelligenceViewProps {
  profile: MobilityProfile;
}

export const DestinationIntelligenceView: React.FC<DestinationIntelligenceViewProps> = ({ profile }) => {
  const [originCountry, setOriginCountry] = useState<string>(profile.nationality || profile.currentCountry || '');
  const [targetCountry, setTargetCountry] = useState<string>(profile.destinationCountries?.[0] || '');
  const [capitalUSD, setCapitalUSD] = useState<number>(profile.budget || 25000);
  const [userGoal, setUserGoal] = useState<string>('Business Establishment & Land Purchase');

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DestinationIntelligenceResult | null>(null);

  useEffect(() => {
    const newOrigin = profile.nationality || profile.currentCountry || '';
    const newTarget = profile.destinationCountries?.[0] || '';
    if (newOrigin) setOriginCountry(newOrigin);
    if (newTarget) setTargetCountry(newTarget);
    if (profile.budget) setCapitalUSD(profile.budget);
  }, [profile.nationality, profile.currentCountry, profile.destinationCountries, profile.budget]);

  const handleRunAnalysis = async (overrideTarget?: string, overrideOrigin?: string, overrideCap?: number) => {
    const origin = overrideOrigin || originCountry || profile.nationality || profile.currentCountry || 'Nigeria';
    const target = overrideTarget || targetCountry || profile.destinationCountries?.[0] || 'Ghana';
    const cap = overrideCap ?? capitalUSD;
    setLoading(true);
    try {
      const res = await fetchDestinationIntelligence(origin, target, cap, userGoal);
      setData(res);
    } catch (err) {
      console.error('Destination Intelligence analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, [profile.nationality, profile.currentCountry, profile.destinationCountries]);

  const QUICK_PRESETS = [
    { name: 'Ghana (ECOWAS / 50-Yr Trap)', origin: 'Nigeria', target: 'Ghana', cap: 25000 },
    { name: 'Rwanda ($0 Cap / Fast PR)', origin: 'Nigeria', target: 'Rwanda', cap: 15000 },
    { name: 'Portugal (EU D2/D7 Visa)', origin: 'Nigeria', target: 'Portugal', cap: 50000 },
    { name: 'UAE (Dubai Free Zone)', origin: 'Nigeria', target: 'United Arab Emirates', cap: 30000 },
    { name: 'Kenya (EAC Trade & Tech)', origin: 'Nigeria', target: 'Kenya', cap: 40000 },
    { name: 'Mauritius ($35k Innovator)', origin: 'Nigeria', target: 'Mauritius', cap: 35000 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-sm">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase text-white tracking-wider">
                  Destination Intelligence & Land Legal Audit
                </h1>
                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-bold uppercase">
                  STATUTORY REASONING ENGINE
                </span>
              </div>
              <p className="text-xs text-[#AAA] mt-1 max-w-3xl">
                Contrasts citizenship rights, foreign business capital thresholds, permanent residency legal viability, and land/property purchase risks (such as Ghana's 50-year lease reversion trap under Art 266).
              </p>
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {QUICK_PRESETS.slice(0, 3).map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setOriginCountry(p.origin);
                setTargetCountry(p.target);
                setCapitalUSD(p.cap);
                handleRunAnalysis(p.target);
              }}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#222] border border-[#333] text-[10px] font-mono text-[#CCC] hover:text-white rounded-sm transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Input Card */}
      <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase flex items-center gap-1">
              <Flag className="w-3 h-3 text-blue-400" />
              <span>Your Origin Citizenship</span>
            </label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="e.g. Nigeria"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Target Relocation Country</span>
            </label>
            <input
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="e.g. Ghana"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-green-400" />
              <span>Available Investment Capital (USD)</span>
            </label>
            <input
              type="number"
              value={capitalUSD}
              onChange={(e) => setCapitalUSD(Number(e.target.value))}
              placeholder="25000"
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#888] font-bold uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3 text-purple-400" />
              <span>Primary Intent / Objective</span>
            </label>
            <select
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              className="w-full bg-[#181818] border border-[#333] text-white font-mono text-xs p-2.5 rounded-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Business Establishment & Land Purchase">Business & Land Acquisition</option>
              <option value="Permanent Residency & Real Estate Investment">Permanent Residency & Property</option>
              <option value="Remote Freelancer & Digital Nomad">Remote Work / Freelancing</option>
              <option value="Employment & Corporate Mobility">Local Employment & Work Quota</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-[#222] gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#888]">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Executes multi-layered statutory evaluation of immigration acts, capital barriers & property lease rules.</span>
          </div>

          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-xs rounded-sm tracking-widest flex items-center gap-2 transition-colors shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini Legal Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Destination Intelligence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {data && (
        <div className="space-y-8">
          {/* 1. Scorecard & Status Banner */}
          <div className={`p-6 rounded-sm border ${
            data.riskLevel === 'prohibitive' || data.riskLevel === 'high'
              ? 'bg-gradient-to-r from-[#1C0909] via-[#140A0A] to-[#0A0A0A] border-red-500/50'
              : 'bg-gradient-to-r from-[#091C10] via-[#0A140E] to-[#0A0A0A] border-green-500/50'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-[#0A0A0A] border border-[#333] rounded-sm shrink-0 min-w-[90px]">
                  <span className="text-[9px] font-mono text-[#888] font-bold uppercase">Viability</span>
                  <span className={`text-2xl font-black font-mono ${
                    data.overallScore >= 70 ? 'text-green-400' : data.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {data.overallScore}/100
                  </span>
                  <span className="text-[9px] font-mono uppercase mt-0.5 text-[#AAA]">{data.riskLevel} Risk</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                      {data.targetCountry} Intelligence Overview
                    </h2>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded uppercase font-bold">
                      {data.originCountry} Passport Holder
                    </span>
                  </div>

                  <p className="text-xs text-[#DDD] leading-relaxed max-w-3xl">
                    {data.overviewSummary}
                  </p>
                </div>
              </div>

              {/* Capital & Act Summary Box */}
              <div className="p-4 bg-[#000]/60 border border-[#333] rounded-sm text-right self-start md:self-auto min-w-[220px]">
                <p className="text-[9px] font-mono text-[#888] font-bold uppercase">Statutory Foreign Capital</p>
                <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                  ${data.legalBusiness.minimumCapitalUSD.toLocaleString()} USD
                </p>
                <p className="text-[9px] font-mono text-[#AAA] mt-1 line-clamp-2">{data.legalBusiness.statutoryAct}</p>
              </div>
            </div>
          </div>

          {/* 2. CRITICAL FEATURE CARD: Land & Property Purchase Insights & Traps */}
          <div className="p-6 bg-gradient-to-b from-[#180F06] to-[#0F0A05] border-2 border-amber-500/50 rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/30 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-sm">
                  <Home className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black uppercase text-white tracking-wider">
                      Land & Property Purchase Statutory Audit ({data.targetCountry})
                    </h3>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold uppercase rounded">
                      REVERSION RISK & TRAPS
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Critical legal rules governing foreign leaseholds, renewal rights, stool land title traps, and development risks.
                  </p>
                </div>
              </div>

              {/* Leasehold Stat Badge */}
              <div className="px-3.5 py-2 bg-black/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase rounded-sm self-start sm:self-auto">
                Max Leasehold: <strong className="text-white">{data.propertyLand.maxLeaseholdYears}</strong>
              </div>
            </div>

            {/* Ghana 50-Year Lease Trap Explicit Highlight Callout */}
            {data.targetCountry.toLowerCase().includes('ghana') && (
              <div className="p-4 bg-red-950/60 border-l-4 border-red-500 rounded-r-sm space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-black uppercase">
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>CRITICAL WARNING: THE GHANA 50-YEAR LEASE REVERSION TRAP (ART 266 / ACT 1052)</span>
                </div>
                <p className="text-xs text-red-100 leading-relaxed">
                  Under Article 266 of the 1992 Ghana Constitution and the Land Act 2020 (Act 1052), non-Ghanaian citizens <strong>CANNOT own freehold land</strong> and are restricted to a maximum 50-year leasehold. 
                  <br />
                  <strong className="text-white bg-red-900/50 px-1 py-0.5 rounded font-bold">THE TRAP:</strong> Ghanaian statutory law does <strong>NOT grant foreign nationals an automatic right to extend or renew</strong> the 50-year lease. Upon expiration of 50 years, the land <em>AND all permanent buildings, houses, factories, and improvements erected on it revert automatically to the allodial stool, chief, or Ghanaian landlord</em>. If you build without negotiated pre-emptive renewal covenants, <strong>you are inadvertently building for them</strong>.
                </p>
              </div>
            )}

            {/* Property Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Renewal Rights & Opportunities */}
              <div className="space-y-4">
                <div className="p-4 bg-[#0A0A0A] border border-amber-900/40 rounded-sm space-y-2">
                  <h4 className="text-xs font-black uppercase text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    Statutory Renewal Rights & Lease Terms
                  </h4>
                  <p className="text-xs text-[#DDD] leading-relaxed font-mono">
                    {data.propertyLand.renewalRights}
                  </p>
                </div>

                <div className="p-4 bg-[#0A0A0A] border border-amber-900/40 rounded-sm space-y-2">
                  <h4 className="text-xs font-black uppercase text-green-400 font-mono tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Property Purchase Opportunities
                  </h4>
                  <ul className="space-y-1.5">
                    {data.propertyLand.opportunities.map((opp, i) => (
                      <li key={i} className="text-xs text-[#CCC] flex items-start gap-2">
                        <span className="text-green-400 font-bold">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Traps, Risks & Required Permissions */}
              <div className="space-y-4">
                <div className="p-4 bg-[#140A0A] border border-red-900/50 rounded-sm space-y-2">
                  <h4 className="text-xs font-black uppercase text-red-400 font-mono tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Key Property Traps & Real Estate Risks
                  </h4>
                  <div className="space-y-2">
                    {data.propertyLand.trapsAndRisks.map((risk, i) => (
                      <div key={i} className="p-2.5 bg-red-950/40 border border-red-900/30 rounded-sm text-xs text-red-200 leading-normal">
                        {risk}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#0A0A0A] border border-amber-900/40 rounded-sm space-y-2">
                  <h4 className="text-xs font-black uppercase text-blue-400 font-mono tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Mandatory Permissions & Registration
                  </h4>
                  <ul className="space-y-1.5">
                    {data.propertyLand.requiredPermissions.map((perm, i) => (
                      <li key={i} className="text-xs text-[#CCC] flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Mitigations Box */}
            <div className="p-4 bg-[#0A0A0A] border border-amber-500/30 rounded-sm space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-300 font-mono tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Senior Real Estate Legal Mitigations & Safeguards
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {data.propertyLand.recommendedMitigations.map((mit, i) => (
                  <div key={i} className="p-3 bg-[#141414] border border-[#333] rounded-sm text-xs text-[#DDD] leading-relaxed">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">SAFEGUARD 0{i + 1}</span>
                    {mit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Citizenship Contrast & Treaty Rights */}
          <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-400" />
                  <span>Citizenship Rights Contrast: {data.originCountry} vs {data.targetCountry}</span>
                </h3>
                <p className="text-xs text-[#888] mt-0.5">
                  Evaluates treaty agreements (ECOWAS, EAC, EU) vs domestic immigration restrictions.
                </p>
              </div>

              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold uppercase rounded">
                {data.citizenshipContrast.treatyStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entry & Establishment */}
              <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-3">
                <h4 className="text-xs font-bold uppercase text-white font-mono">Entry & Establishment Rights</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#181818] border border-[#333] rounded-sm">
                    <strong className="text-[10px] font-mono text-[#888] uppercase block">Entry Rights:</strong>
                    <span className="text-white font-mono">{data.citizenshipContrast.entryRights}</span>
                  </div>
                  <div className="p-2.5 bg-[#181818] border border-[#333] rounded-sm">
                    <strong className="text-[10px] font-mono text-[#888] uppercase block">Right of Establishment vs Domestic Laws:</strong>
                    <span className="text-[#CCC] leading-relaxed block mt-0.5">{data.citizenshipContrast.rightOfEstablishment}</span>
                  </div>
                </div>
              </div>

              {/* Key Disadvantages & Advantages */}
              <div className="space-y-3">
                <div className="p-4 bg-[#140A0A] border border-red-900/40 rounded-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase text-red-400 font-mono">Passport Restrictions & Disadvantages</h4>
                  <ul className="space-y-1 text-xs text-red-200">
                    {data.citizenshipContrast.keyDisadvantages.map((dis, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">✕</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-[#0A140E] border border-green-900/40 rounded-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase text-green-400 font-mono">Regional Treaty Advantages</h4>
                  <ul className="space-y-1 text-xs text-green-200">
                    {data.citizenshipContrast.keyAdvantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 font-bold">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Statutory Business & Permanent Residency Requirements */}
          <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-6">
            <div className="border-b border-[#222] pb-3">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Statutory Business & PR Framework ({data.legalBusiness.statutoryAct})</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm">
                <span className="text-[9px] font-mono text-[#777] uppercase font-bold">Min Capital</span>
                <p className="text-lg font-black font-mono text-amber-400 mt-0.5">
                  ${data.legalBusiness.minimumCapitalUSD.toLocaleString()} USD
                </p>
              </div>

              <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm">
                <span className="text-[9px] font-mono text-[#777] uppercase font-bold">PR Viability</span>
                <p className="text-sm font-bold font-mono text-white mt-1">
                  {data.legalBusiness.prViability}
                </p>
              </div>

              <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm">
                <span className="text-[9px] font-mono text-[#777] uppercase font-bold">PR Horizon</span>
                <p className="text-sm font-bold font-mono text-blue-400 mt-1">
                  {data.legalBusiness.prHorizonYears}
                </p>
              </div>

              <div className="p-3.5 bg-[#111] border border-[#222] rounded-sm">
                <span className="text-[9px] font-mono text-[#777] uppercase font-bold">Corporate Ownership</span>
                <p className="text-xs font-mono text-[#DDD] mt-1 line-clamp-2">
                  {data.legalBusiness.foreignOwnershipAllowed}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#111] border border-[#222] rounded-sm space-y-2">
              <h4 className="text-xs font-bold uppercase text-white font-mono">Work Permit & Business Registration Steps</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.legalBusiness.keyWorkPermitSteps.map((step, i) => (
                  <div key={i} className="p-3 bg-[#161616] border border-[#333] rounded-sm text-xs text-[#CCC] flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      0{i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Better Matched Country Alternatives */}
          <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-sm font-black uppercase text-green-400 tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Recommended Alternative Destinations for {data.originCountry} Passport</span>
              </h3>
              <span className="text-[10px] font-mono text-[#777]">Higher PR Viability & Fairer Property Laws</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.alternativeRecommendations.map((alt, i) => (
                <div key={i} className="p-4 bg-[#111] border border-[#333] hover:border-green-500/50 rounded-sm space-y-3 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-white uppercase">{alt.country}</h4>
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-[9px] font-mono font-bold uppercase rounded">
                        {alt.keyAdvantage}
                      </span>
                    </div>
                    <p className="text-xs text-[#BBB] leading-relaxed">
                      {alt.whyBetter}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTargetCountry(alt.country);
                      handleRunAnalysis(alt.country);
                    }}
                    className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] font-mono font-bold uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Analyze {alt.country} Intelligence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Actionable Relocation Checklist */}
          <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-sm space-y-4">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-[#222] pb-3">
              <Check className="w-4 h-4 text-amber-400" />
              <span>Actionable Legal & Property Preparation Checklist</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.actionableChecklist.map((item, i) => (
                <div key={i} className="p-3 bg-[#111] border border-[#222] rounded-sm flex items-start gap-3">
                  <div className="p-1 bg-amber-500/20 text-amber-400 rounded-sm shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-[#DDD] font-mono leading-snug">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
