import React, { useState } from 'react';
import { Shield, Sparkles, Check, Zap, X, Crown, ArrowRight, Lock, Bell, FileText, Bot, AlertTriangle, Globe, Banknote, Smartphone } from 'lucide-react';
import { UserTier } from '../types';
import { CURRENCY_OPTIONS, getCurrencyByCode, CurrencyOption } from '../lib/pricing';

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
  onSelectTier: (tier: UserTier) => void;
  triggeredFeatureName?: string;
  selectedCurrencyCode?: string;
  onCurrencyChange?: (currencyCode: string) => void;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  userTier,
  onSelectTier,
  triggeredFeatureName,
  selectedCurrencyCode = 'NGN',
  onCurrencyChange,
}) => {
  const [internalCurrency, setInternalCurrency] = useState(selectedCurrencyCode);

  if (!isOpen) return null;

  const currentCurrency = getCurrencyByCode(onCurrencyChange ? selectedCurrencyCode : internalCurrency);

  const handleCurrencySelect = (code: string) => {
    setInternalCurrency(code);
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121215] border border-[#2D2D35] rounded-xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888] hover:text-white p-2 rounded-lg bg-[#1C1C22] border border-[#2A2A32] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-mono font-bold uppercase mb-3">
            <Crown className="w-3.5 h-3.5" /> PathWAI Membership Plans
          </div>
          {triggeredFeatureName ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-mono mb-3">
              <span className="font-bold uppercase text-white">Pro Feature Requested:</span> {triggeredFeatureName} requires a PathWAI Pro subscription.
            </div>
          ) : null}
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Choose Your Mobility Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#999] mt-2 font-mono">
            Empower your relocation, statutory visa applications, and global safety with tailored AI intelligence.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="mb-8 p-4 bg-[#181820] border border-[#2E2E3A] rounded-xl font-mono">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Payment Currency & Local Pricing
                </span>
              </div>
              <p className="text-[11px] text-[#A0A0B0]">
                {currentCurrency.notes}
              </p>
            </div>

            {/* Currency Selector Control */}
            <div className="w-full md:w-auto shrink-0">
              <select
                value={currentCurrency.code}
                onChange={(e) => handleCurrencySelect(e.target.value)}
                className="w-full md:w-auto bg-[#101014] border border-[#3A3A48] text-amber-300 font-bold text-xs px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-amber-500"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.name} — {curr.proPriceFormatted}/mo
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Currency Pills */}
          <div className="mt-3 pt-3 border-t border-[#252532] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-[#777] uppercase shrink-0 font-bold mr-1">Select Currency:</span>
            {['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'ZAR', 'XOF', 'EGP'].map((code) => {
              const opt = getCurrencyByCode(code);
              const isActive = currentCurrency.code === code;
              return (
                <button
                  key={code}
                  onClick={() => handleCurrencySelect(code)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold shrink-0 transition-colors flex items-center gap-1 border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-[#121216] text-[#AAA] border-[#2A2A35] hover:text-white'
                  }`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.code}</span>
                  <span className="text-[9px] opacity-75">({opt.proPriceFormatted})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier Card */}
          <div className={`rounded-xl p-6 border transition-all flex flex-col justify-between ${
            userTier === 'free' 
              ? 'bg-[#18181C] border-blue-500/50 shadow-lg shadow-blue-500/5' 
              : 'bg-[#141417] border-[#2A2A32] opacity-80 hover:opacity-100'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-mono text-blue-400 font-bold uppercase">Standard Plan</span>
                  <h3 className="text-xl font-bold text-white uppercase mt-0.5">Free Explorer</h3>
                </div>
                {userTier === 'free' && (
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold rounded uppercase">
                    Current Active
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="text-3xl font-black text-white">Free</span>
                <span className="text-xs text-[#888] font-mono uppercase ml-2.5">/ forever</span>
                <p className="text-xs text-[#888] mt-1 font-mono">Essential tools for individual travellers and initial route planning.</p>
              </div>

              <div className="space-y-3 border-t border-[#25252D] pt-4">
                {[
                  { text: 'Basic Visa Assessment & Eligibility Check', included: true },
                  { text: '3 AI Agent Consultations per day', included: true },
                  { text: 'Standard Document Expiry Reminders', included: true },
                  { text: 'Manual Safety Check-in Timer', included: true },
                  { text: 'Standard Destination Intelligence Intel', included: true },
                  { text: 'Unlimited AI Agent Queries', included: false },
                  { text: 'AI Visa Interview Simulator & Scoring', included: false },
                  { text: 'Document OCR & Scanning Reticle', included: false },
                  { text: 'Emergency SOS Broadcast Alerts', included: false },
                  { text: 'Custom PDF Roadmap Export', included: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-mono">
                    {item.included ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-[#444] shrink-0 mt-0.5" />
                    )}
                    <span className={item.included ? 'text-[#CCC]' : 'text-[#555] line-through'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTier('free');
                onClose();
              }}
              disabled={userTier === 'free'}
              className={`w-full mt-6 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                userTier === 'free'
                  ? 'bg-[#222] text-[#777] cursor-default border border-[#333]'
                  : 'bg-[#25252E] hover:bg-[#30303A] text-white border border-[#3D3D4A]'
              }`}
            >
              {userTier === 'free' ? 'Currently Selected' : 'Switch to Free Explorer'}
            </button>
          </div>

          {/* Pro Tier Card */}
          <div className={`rounded-xl p-6 border relative transition-all flex flex-col justify-between ${
            userTier === 'pro' 
              ? 'bg-gradient-to-b from-[#1C182A] to-[#121218] border-amber-500/60 shadow-xl shadow-amber-500/10' 
              : 'bg-gradient-to-b from-[#1A1822] to-[#131217] border-amber-500/40 hover:border-amber-500/70'
          }`}>
            {/* Pro Badge */}
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black uppercase font-mono px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black" /> Most Popular Choice
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Pro Sovereign Plan
                  </span>
                  <h3 className="text-xl font-bold text-white uppercase mt-0.5">PathWAI Pro</h3>
                </div>
                {userTier === 'pro' && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold rounded uppercase">
                    Active Membership
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{currentCurrency.proPriceFormatted}</span>
                  <span className="text-xs text-[#888] font-mono uppercase">/ month</span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1 font-mono">Complete statutory visa, emergency broadcast & AI simulation suite.</p>
              </div>

              <div className="space-y-3 border-t border-amber-500/20 pt-4">
                {[
                  { text: 'Everything in Free Explorer', bold: true },
                  { text: 'Unlimited AI Mobility Agent Queries', highlight: true },
                  { text: 'Embassy Interview AI Mock & Scoring', highlight: true },
                  { text: 'Document Smart OCR & Reticle Verification', highlight: true },
                  { text: 'Instant Emergency SOS SMS & Broadcast Trigger', highlight: true },
                  { text: 'Custom PDF Roadmap Export & Printing', highlight: true },
                  { text: 'Priority Statutory Policy Alerts (Real-Time Push)', highlight: true },
                  { text: 'Humanitarian & Student Fast-Track Relief Advisor', highlight: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-mono">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className={`text-[#EEE] ${item.highlight ? 'font-semibold text-amber-100' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectTier('pro');
                onClose();
              }}
              className={`w-full mt-6 py-3 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                userTier === 'pro'
                  ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25'
              }`}
            >
              <Crown className="w-4 h-4 fill-black" />
              {userTier === 'pro' ? 'Maintain Pro Membership' : `Upgrade to PathWAI Pro (${currentCurrency.proPriceFormatted}/mo)`}
            </button>
          </div>
        </div>

        {/* Local Payment Options Notice */}
        <div className="mt-6 p-3 bg-[#16161C] border border-[#262632] rounded-lg flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#AAA] gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supported Local Payment Methods: <strong>Mobile Money (M-Pesa, MTN MoMo, Telebirr)</strong>, Bank Transfer, Flutterwave, Paystack & Cards.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-emerald-400 font-bold">
            <Shield className="w-3.5 h-3.5" /> 1-Click Instant Activation
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-[#22222A] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#888] gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cancel or switch tiers anytime with 1-click. Instant access.</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Encrypted Data Privacy • Zero Data Selling Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

