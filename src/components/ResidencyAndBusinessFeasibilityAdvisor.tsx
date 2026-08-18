import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, DollarSign, Building2, Scale, 
  Sparkles, RefreshCw, ArrowRight, Compass, HelpCircle, ChevronRight, Check, X, Info
} from 'lucide-react';
import { MobilityProfile } from '../types';
import { fetchResidencyBusinessFeasibility, ResidencyBusinessFeasibilityResult } from '../lib/api';
import { checkProfileCompleteness } from '../lib/profileUtils';

interface ResidencyAndBusinessFeasibilityAdvisorProps {
  profile: MobilityProfile;
  onNavigateTab?: (tab: string) => void;
}

export const ResidencyAndBusinessFeasibilityAdvisor: React.FC<ResidencyAndBusinessFeasibilityAdvisorProps> = ({ profile, onNavigateTab }) => {
  const profileCompleteness = checkProfileCompleteness(profile);
  const [originCountry, setOriginCountry] = useState<string>(profile.currentCountry || profile.nationality || 'Nigeria');
  const [targetCountry, setTargetCountry] = useState<string>(profile.destinationCountries?.[0] || 'Ghana');
  const [intent, setIntent] = useState<string>('Business Establishment & PR');
  const [liquidCapital, setLiquidCapital] = useState<number>(profile.budget || 25000);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResidencyBusinessFeasibilityResult | null>(null);

  useEffect(() => {
    const orig = profile.currentCountry || profile.nationality || 'Nigeria';
    const dest = profile.destinationCountries?.[0] || 'Ghana';
    setOriginCountry(orig);
    setTargetCountry(dest);
    if (profile.budget) setLiquidCapital(profile.budget);
  }, [profile.currentCountry, profile.nationality, profile.destinationCountries, profile.budget]);

  const handleAnalyze = async (overrideTarget?: string) => {
    const orig = originCountry || profile.currentCountry || profile.nationality || 'Nigeria';
    const target = overrideTarget || targetCountry || profile.destinationCountries?.[0] || 'Ghana';
    const cap = liquidCapital || profile.budget || 25000;
    setLoading(true);
    try {
      const res = await fetchResidencyBusinessFeasibility(
        orig,
        target,
        intent,
        cap
      );
      setResult(res);
    } catch (err) {
      console.error('Feasibility evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyze();
  }, [profile.currentCountry, profile.nationality, profile.destinationCountries]);

  // Comparison matrix of key regional & global destinations
  const COUNTRY_FEASIBILITY_MATRIX = [
    {
      country: 'Ghana',
      statute: 'GIPC Act 865 (Sec 28)',
      minCapital: '$100,000 USD (JV) / $1,000,000 (Retail)',
      prHorizon: 'Rarely Granted / 10+ Years',
      prRating: 'prohibitive',
      keyNote: 'High foreign capital barrier for foreigners (including ECOWAS). No clear small-business PR path.'
    },
    {
      country: 'Rwanda',
      statute: 'RDB Law No 57/2018',
      minCapital: '$0 USD (100% Foreign Ownership)',
      prHorizon: '3-5 Years',
      prRating: 'high',
      keyNote: 'Zero minimum capital barrier. 6-hour online business registration & transparent investor PR.'
    },
    {
      country: 'Mauritius',
      statute: 'Immigration Act (Occupancy Permit)',
      minCapital: '$35,000 USD (Innovator/Self-Employed)',
      prHorizon: '3-10 Years',
      prRating: 'high',
      keyNote: 'Self-employed & innovator permits with structured 10-year Permanent Residence status.'
    },
    {
      country: 'Kenya',
      statute: 'Investment Promotion Act / Class G',
      minCapital: '$100,000 USD (Class G Investor)',
      prHorizon: '7 Years',
      prRating: 'medium',
      keyNote: 'Class G requires $100k, but EAC trade protocols & tech incubation grant specialized permits.'
    },
    {
      country: 'Portugal',
      statute: 'Immigration Act Law 23/2007 (D2/D7)',
      minCapital: '€30,000 Capital / Remote Income Proof',
      prHorizon: '5 Years',
      prRating: 'high',
      keyNote: 'EU permanent residency and citizenship guaranteed after 5 years of legal status.'
    },
    {
      country: 'UAE (Dubai)',
      statute: 'Commercial Companies Law (Green Visa)',
      minCapital: '$0 - $13,000 USD (Free Zone)',
      prHorizon: '5-10 Years Green/Golden Visa',
      prRating: 'medium',
      keyNote: '100% foreign business ownership in Free Zones, but naturalization citizenship is restricted.'
    }
  ];

  return (
    <div className="p-6 bg-[#111] border border-[#222] rounded-sm space-y-6">
      {/* Profile Requirement Banner */}
      {!profileCompleteness.isFilled && (
        <div className="p-4 bg-amber-950/40 border-2 border-amber-500/60 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-300">
                  Profile Details Required Before Residency Feasibility Assessment
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/30 text-amber-200 text-[9px] font-bold rounded">
                  {profileCompleteness.percentage}% Complete
                </span>
              </div>
              <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                Evaluating statutory foreign minimum capital laws and PR viability requires your filled mobility profile ({profileCompleteness.missingFields.map(m => m.label).join(', ')}). Please update your profile before relying on advice.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer font-bold"
            >
              <span>Update Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Module Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Residency & Foreign Business Feasibility Advisor</span>
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono font-extrabold uppercase rounded">
              STATUTORY PROTECTION
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium mt-1 max-w-3xl">
            Evaluates foreign minimum capital laws (e.g. Ghana GIPC $100k+ requirement), statutory permanent residency viability, and legal hurdles before you relocate or deploy capital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Avoid Relocation Pitfalls</span>
          </span>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin Passport */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-700 font-extrabold uppercase">
              Origin Passport / Citizenship
            </label>
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="e.g. Nigeria"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs p-2.5 rounded font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Destination Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-700 font-extrabold uppercase">
              Target Destination Country
            </label>
            <input
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="e.g. Ghana"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs p-2.5 rounded font-bold focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Relocation Goal / Intent */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-700 font-extrabold uppercase">
              Primary Relocation Goal
            </label>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs p-2.5 rounded font-bold focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="Short Visit & Tourism">Short Visit & Tourism (Visitor Visa)</option>
              <option value="Business Establishment & PR">Business Establishment & PR</option>
              <option value="Permanent Residency Only">Permanent Residency Search</option>
              <option value="Freelancer & Remote Work">Freelance / Remote Work</option>
              <option value="Employment & Corporate Mobility">Local Employment & Work Permit</option>
            </select>
          </div>

          {/* Liquid Capital */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-700 font-extrabold uppercase">
              Available Capital (USD)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs text-slate-500 font-mono font-bold">$</span>
              <input
                type="number"
                value={liquidCapital}
                onChange={(e) => setLiquidCapital(Number(e.target.value))}
                placeholder="25000"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs p-2.5 pl-6 rounded font-bold focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] font-mono text-slate-700 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Tests statutory acts (GIPC Act 865, RDB, EAC, ECOWAS, EU Directives) for capital & PR rules.</span>
          </p>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-extrabold uppercase text-xs rounded shadow-sm tracking-widest flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Statutory Laws...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Feasibility Check</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feasibility Assessment Result Card */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Warning & Status Banner */}
          <div className={`p-5 rounded-xl border ${
            result.prFeasibilityRating === 'prohibitive' || result.capitalBarrierStatus === 'capital_insufficient_warning'
              ? 'bg-red-50 border-red-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded border shrink-0 ${
                  result.capitalBarrierStatus === 'capital_insufficient_warning'
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                }`}>
                  {result.capitalBarrierStatus === 'capital_insufficient_warning' ? (
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      {result.targetCountry}: Statutory Feasibility Assessment
                    </h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase rounded border ${
                      result.prFeasibilityRating === 'prohibitive'
                        ? 'bg-red-200 text-red-900 border-red-400'
                        : result.prFeasibilityRating === 'high'
                        ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                        : 'bg-amber-200 text-amber-900 border-amber-400'
                    }`}>
                      PR Pathway: {result.prFeasibilityRating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-mono font-medium">
                    Passport: <strong className="text-slate-900">{result.originCountry}</strong> | Target: <strong className="text-slate-900">{result.targetCountry}</strong> | Available Capital: <strong className="text-amber-800">${result.liquidCapitalUSD.toLocaleString()} USD</strong>
                  </p>
                </div>
              </div>

              {/* Statutory Minimum Stat Box */}
              <div className="p-3 bg-white border border-slate-300 rounded-lg text-right self-start md:self-auto min-w-[200px] shadow-sm">
                <p className="text-[9px] font-mono text-slate-600 font-extrabold uppercase">Statutory Minimum Capital</p>
                <p className="text-xl font-black font-mono text-amber-700 mt-0.5">
                  ${result.minimumCapitalUSD.toLocaleString()} USD
                </p>
                <p className="text-[9px] font-mono text-slate-600 font-bold truncate">{result.statutoryAct}</p>
              </div>
            </div>

            {/* Direct Recommendation Advisory Box */}
            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg space-y-2 shadow-sm">
              <span className="text-[10px] font-mono font-extrabold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                SENIOR LEGAL ADVISORY SUMMARY
              </span>
              <p className="text-xs text-slate-900 leading-relaxed font-bold">
                {result.recommendedStrategy}
              </p>
            </div>
          </div>

          {/* Key Statutory Warnings List */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-black uppercase text-red-700 tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Crucial Foreign Legal & Statutory Warnings ({result.targetCountry})</span>
            </h4>

            <div className="space-y-2.5">
              {result.keyWarnings.map((warn, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 bg-red-200 text-red-900 font-mono text-[10px] font-extrabold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    0{i + 1}
                  </span>
                  <p className="text-xs text-slate-900 leading-normal font-mono font-medium">
                    {warn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended High-Feasibility Country Alternatives */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Better Matched Regional & Global Destinations for {result.originCountry} Passport</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-600 font-bold">Higher PR Viability & Lower Capital Barriers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.betterMatchedAlternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg space-y-3 flex flex-col justify-between transition-colors shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-black text-slate-900 uppercase tracking-wider">{alt.country}</h5>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold uppercase rounded">
                        PR: {alt.prHorizon}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {alt.advantage}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 font-bold">Min Capital: <strong className="text-amber-800">{alt.capitalRequirement}</strong></span>
                    <button
                      onClick={() => {
                        setTargetCountry(alt.country);
                        handleAnalyze(alt.country);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-extrabold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <span>Analyze {alt.country}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global & Regional Capital Law Reference Matrix Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Statutory Foreign Capital & Permanent Residency Matrix</span>
            </h4>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Key foreign investment threshold acts and residency viability benchmarks.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 text-[10px] uppercase font-extrabold">
                <th className="p-3">Country</th>
                <th className="p-3">Governing Statute / Act</th>
                <th className="p-3">Min Foreign Capital</th>
                <th className="p-3">PR Horizon</th>
                <th className="p-3">Statutory Feasibility Note</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {COUNTRY_FEASIBILITY_MATRIX.map((row) => (
                <tr key={row.country} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-extrabold text-slate-900 uppercase">{row.country}</td>
                  <td className="p-3 text-slate-600 font-medium">{row.statute}</td>
                  <td className="p-3 text-amber-800 font-extrabold">{row.minCapital}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      row.prRating === 'prohibitive' ? 'bg-red-100 text-red-900 border border-red-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      {row.prHorizon}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-700 font-medium max-w-xs">{row.keyNote}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setTargetCountry(row.country);
                        handleAnalyze(row.country);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-extrabold uppercase rounded shadow-sm transition-colors cursor-pointer"
                    >
                      Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
