import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, ShieldCheck, HardDrive, ArrowRight, Sparkles } from 'lucide-react';
import { OfflineManager } from '../lib/offlineManager';

interface OfflineStatusIndicatorProps {
  onOpenVault: () => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  onOpenVault,
  isOnline,
  setIsOnline
}) => {
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [setIsOnline]);

  return (
    <>
      {/* Offline Alert Banner at top if disconnected */}
      {!isOnline && showOfflineBanner && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 font-mono text-xs flex items-center justify-between gap-3 animate-fadeIn z-40 sticky top-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>You are currently offline.</strong> PathWAI Service Worker is serving cached mobility data, emergency contacts, and visas.
            </span>
          </div>

          <button
            onClick={onOpenVault}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase rounded text-[11px] shrink-0 transition-colors flex items-center gap-1"
          >
            <span>Open Offline Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Button to open Offline Vault in Navbar */}
      <button
        onClick={onOpenVault}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase transition-all ${
          isOnline
            ? 'bg-[#15151C] hover:bg-[#20202A] border border-[#2D2D3B] text-[#AAA] hover:text-white'
            : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse'
        }`}
        title="View Offline Cached Visas & Emergency Contacts"
      >
        {isOnline ? (
          <HardDrive className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <span className="hidden sm:inline">{isOnline ? 'Offline Vault' : 'OFFLINE MODE'}</span>
      </button>
    </>
  );
};
