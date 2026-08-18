import React from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { UserTier } from '../types';

interface ProFeatureGuardProps {
  userTier: UserTier;
  featureName: string;
  onOpenUpgradeModal: (featureName?: string) => void;
  children: React.ReactNode;
  fallbackText?: string;
  badgeOnly?: boolean;
}

export const ProFeatureGuard: React.FC<ProFeatureGuardProps> = ({
  userTier,
  featureName,
  onOpenUpgradeModal,
  children,
  fallbackText,
  badgeOnly = false,
}) => {
  const isPro = userTier === 'pro';

  if (isPro) {
    return <>{children}</>;
  }

  if (badgeOnly) {
    return (
      <button
        onClick={() => onOpenUpgradeModal(featureName)}
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold rounded hover:bg-amber-500/25 transition-colors cursor-pointer"
        title={`Upgrade to Pro to unlock ${featureName}`}
      >
        <Crown className="w-3 h-3 text-amber-400 fill-amber-400/30" />
        <span>PRO UNLOCK</span>
      </button>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-lg border border-amber-500/30 bg-[#16141D] p-6 text-center my-4">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-3">
        <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400">
          <Crown className="w-5 h-5 fill-amber-400/20" />
        </div>

        <div className="inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase rounded">
          PathWAI Pro Sovereign Feature
        </div>

        <h4 className="text-base font-bold text-white uppercase tracking-tight">
          Unlock {featureName}
        </h4>

        <p className="text-xs font-mono text-[#AAA]">
          {fallbackText || `Gain full access to ${featureName}, unlimited AI queries, embassy interview simulator, document OCR verification, and real-time emergency broadcast tools.`}
        </p>

        <button
          onClick={() => onOpenUpgradeModal(featureName)}
          className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase text-xs px-5 py-2.5 rounded-md shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-black" /> Upgrade to Pro (Local PPP Subsidies Available)
        </button>
      </div>
    </div>
  );
};
