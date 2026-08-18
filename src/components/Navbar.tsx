import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, ShieldAlert, User, Activity, Bell, FileText, MapPin, Calendar, Compass, Lock, 
  Trash2, RefreshCw, Globe, Crown, Zap, HelpCircle, ChevronDown, Bot, Landmark, 
  HeartHandshake, BookOpen, ScrollText
} from 'lucide-react';
import { UserRole, UserTier } from '../types';
import { SupportedLanguage, SUPPORTED_LANGUAGES, t } from '../lib/i18n';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userEmail: string | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSignOut: () => void;
  unreadAlertCount: number;
  safetyStatus: 'active' | 'overdue' | 'escalated';
  onTriggerSOS: () => void;
  isDemoDataActive?: boolean;
  onClearDemoData?: () => void;
  onLoadDemoData?: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  userTier?: UserTier;
  onOpenUpgradeModal?: (featureName?: string) => void;
  onOpenTour?: () => void;
  onOpenOfflineVault?: () => void;
  onOpenUserManagement?: () => void;
  isOnline?: boolean;
  setIsOnline?: (status: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  userEmail,
  onOpenAuth,
  onSignOut,
  unreadAlertCount,
  safetyStatus,
  onTriggerSOS,
  isDemoDataActive = false,
  onClearDemoData,
  onLoadDemoData,
  language,
  onLanguageChange,
  userTier = 'free',
  onOpenUpgradeModal,
  onOpenTour,
  onOpenOfflineVault,
  onOpenUserManagement,
  isOnline = true,
  setIsOnline = () => {}
}) => {
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (catId: string) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    setActiveFlyout(catId);
  };

  const handleMouseLeave = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 150);
  };

  // Grouped Menu Categories
  const navCategories = [
    {
      id: 'overview',
      label: t('nav.overview', language, 'Overview'),
      isDirect: true,
      tabId: 'overview'
    },
    {
      id: 'immigration',
      label: t('nav.group_immigration', language, 'Immigration & AI'),
      tabIds: ['agent', 'assessment', 'relocation', 'intelligence', 'relief'],
      items: [
        { id: 'agent', key: 'nav.agent', label: 'Consult AI Agent', icon: Bot, desc: '24/7 AI visa advisor' },
        { id: 'assessment', key: 'nav.assessment', label: 'Visa Eligibility Audit', icon: Compass, desc: 'Statutory compliance check' },
        { id: 'relocation', key: 'nav.relocation', label: 'Relocation Roadmap', icon: MapPin, desc: 'Milestones & budget' },
        { id: 'intelligence', key: 'nav.intelligence', label: 'Destination Intelligence', icon: Landmark, desc: 'Weather & living costs' },
        { id: 'relief', key: 'nav.relief', label: 'Relief & Student Pathways', icon: HeartHandshake, desc: 'Emergency wavers' },
      ]
    },
    {
      id: 'prep',
      label: t('nav.group_prep', language, 'Docs & Prep'),
      tabIds: ['documents', 'interview'],
      items: [
        { id: 'documents', key: 'nav.documents', label: 'Document & Visa Tracker', icon: FileText, desc: 'Encrypted document vault' },
        { id: 'interview', key: 'nav.interview', label: 'Consular Interview Prep', icon: BookOpen, desc: 'Simulated embassy Q&A' },
      ]
    },
    {
      id: 'safety',
      label: t('nav.group_safety', language, 'Safety & Policy'),
      tabIds: ['safety', 'alerts'],
      badge: safetyStatus === 'escalated' ? 'PING' : unreadAlertCount > 0 ? String(unreadAlertCount) : null,
      items: [
        { id: 'safety', key: 'nav.safety', label: 'Safety & Emergency SOS', icon: Shield, desc: 'Check-in & hotlines', badge: safetyStatus === 'escalated' ? 'PING' : null },
        { id: 'alerts', key: 'nav.alerts', label: 'Policy Risk Alerts', icon: ShieldAlert, desc: 'Official statutory updates', badge: unreadAlertCount > 0 ? String(unreadAlertCount) : null },
      ]
    },
    {
      id: 'account',
      label: t('nav.group_account', language, 'Account & Logs'),
      tabIds: ['profile', 'audit', 'admin'],
      items: [
        { id: 'profile', key: 'nav.profile', label: 'Mobility Profile', icon: User, desc: 'Credentials & passport' },
        { id: 'audit', key: 'nav.audit', label: 'Governance Audit Log', icon: ScrollText, desc: 'Immutable history' },
        ...(userRole === 'admin' ? [{ id: 'admin', key: 'nav.admin', label: 'Admin Review', icon: Activity, desc: 'System governance' }] : []),
      ]
    }
  ];

  return (
    <header className="bg-[#0A0A0E] border-b border-[#222234] text-[#F0F0F0] sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => {
            setCurrentTab('overview');
            setActiveFlyout(null);
          }}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center rounded-lg font-black text-xl tracking-tighter shadow-md shadow-blue-600/30 border border-blue-400/40 group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight uppercase block leading-none text-white font-mono">
                Path<span className="text-blue-400">WAI</span>
              </span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-mono font-bold rounded uppercase">
                v2.5
              </span>
            </div>
            <span className="text-[11px] font-mono tracking-wider text-blue-300 font-semibold uppercase block mt-1">
              Global Mobility &amp; Visa Intelligence
            </span>
          </div>
        </div>

        {/* Clean Grouped Header Menu Navigation */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs font-bold uppercase">
          {navCategories.map((cat) => {
            if (cat.isDirect) {
              const isActive = currentTab === cat.tabId;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCurrentTab(cat.tabId!);
                    setActiveFlyout(null);
                  }}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#222234] text-white font-black border border-[#444462] shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            }

            const isCatActive = cat.tabIds?.includes(currentTab);
            const isOpen = activeFlyout === cat.id;

            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Category Menu Trigger */}
                <button
                  onClick={() => setActiveFlyout(isOpen ? null : cat.id)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    isCatActive || isOpen
                      ? 'bg-[#222234] text-blue-300 font-black border border-[#444462] shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-[#181826]'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && cat.badge === 'PING' && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                  {cat.badge && cat.badge !== 'PING' && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-bold rounded-sm">
                      {cat.badge}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
                </button>

                {/* Flyout Submenu Panel */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                      {cat.items?.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = currentTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setCurrentTab(sub.id);
                              setActiveFlyout(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 group ${
                              isSubActive
                                ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold'
                                : 'hover:bg-slate-50 text-slate-800 hover:text-slate-900'
                            }`}
                          >
                            <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${isSubActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600 group-hover:scale-105 transition-transform'}`}>
                              <SubIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs truncate block text-slate-900">{t(sub.key, language, sub.label)}</span>
                                {sub.badge && sub.badge === 'PING' && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                                )}
                                {sub.badge && sub.badge !== 'PING' && (
                                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[9px] font-bold rounded-sm shrink-0">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600 normal-case font-medium block truncate mt-0.5">{sub.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Section: Emergency SOS, Role Selector & Session Status */}
        <div className="flex items-center gap-3">
          {/* HIGH PRIORITY EMERGENCY SOS BUTTON */}
          <button
            onClick={onTriggerSOS}
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase px-3 py-1.5 rounded-sm transition-all shadow-md flex items-center gap-1.5 animate-pulse shrink-0 border border-red-400"
            title="Trigger Immediate High-Priority Emergency SOS Alert"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{t('btn.emergency_sos', language, 'EMERGENCY SOS')}</span>
            <span className="sm:hidden">SOS</span>
          </button>

          {/* Clear Demo Data Button */}
          {onClearDemoData && (
            <button
              onClick={onClearDemoData}
              className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-sm transition-all flex items-center gap-1 shrink-0"
              title="Clear sample demo profile & data to use your clean personal details"
            >
              <Trash2 className="w-3 h-3 text-amber-400" />
              <span className="hidden xl:inline">{t('btn.clear_demo', language, 'Clear Demo Data')}</span>
            </button>
          )}

          {/* Membership Tier Switcher Button */}
          {onOpenUpgradeModal && (
            <button
              onClick={() => onOpenUpgradeModal()}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 border shadow-sm ${
                userTier === 'pro'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25'
              }`}
              title="View PathWAI Membership Plans & Tiers"
            >
              {userTier === 'pro' ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                  <span className="hidden sm:inline">{t('btn.pro_member', language, 'PRO MEMBER')}</span>
                  <span className="sm:hidden">PRO</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">{t('btn.free_plan', language, 'FREE PLAN')}</span>
                  <span className="sm:hidden">FREE</span>
                </>
              )}
            </button>
          )}

          {/* Offline Mode Status & Vault Button */}
          {onOpenOfflineVault && (
            <OfflineStatusIndicator
              onOpenVault={onOpenOfflineVault}
              isOnline={isOnline}
              setIsOnline={setIsOnline}
            />
          )}

          {/* Guided Tour Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase transition-colors"
              title="Launch Guided App Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">{t('btn.take_tour', language, 'Take Tour')}</span>
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#2A2A2A] hover:border-[#444] px-2.5 py-1 rounded transition-colors">
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-transparent text-[11px] font-bold uppercase text-white focus:outline-none cursor-pointer font-mono"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#111] text-white">
                  {lang.flag} {lang.nativeName} {lang.dir === 'rtl' ? '(RTL)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Account & Role Manager Button */}
          {onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 px-2.5 py-1 rounded text-[11px] font-bold font-mono uppercase transition-colors flex items-center gap-1.5"
              title="Manage Account Status & User Roles"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">Account &amp; Roles</span>
              <span className="xl:hidden">Auth</span>
            </button>
          )}

          {/* Role selector badge */}
          <div className="hidden lg:flex items-center gap-2 bg-[#181822] border border-[#333348] px-2.5 py-1 rounded">
            <span className="text-[10px] text-slate-300 font-mono font-bold uppercase">{t('label.role', language, 'ROLE')}:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-[11px] font-black uppercase text-white focus:outline-none cursor-pointer font-mono"
            >
              <option value="traveller" className="bg-[#111] text-white">Traveller</option>
              <option value="emergency_contact" className="bg-[#111] text-white">Emergency Contact</option>
              <option value="admin" className="bg-[#111] text-white">Admin / Reviewer</option>
            </select>
          </div>

          {/* Secure Session Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#181822] border border-[#333348] rounded">
            <div className={`w-2 h-2 rounded-full ${safetyStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-200 hidden sm:inline">
              {safetyStatus === 'active' ? t('status.secure', language, 'SECURE') : safetyStatus.toUpperCase()}
            </span>
          </div>

          {/* User Email or Auth Buttons */}
          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-200 font-mono font-medium hidden xl:inline max-w-[120px] truncate">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="text-[10px] uppercase font-bold border border-[#444] hover:border-white px-2.5 py-1 rounded text-white hover:bg-[#222]"
              >
                {t('btn.sign_out', language, 'Sign Out')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black uppercase px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1 shadow-sm"
              >
                {t('btn.create_account', language, 'Create Account')}
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="border border-[#555] hover:border-white text-white text-[11px] font-bold uppercase px-3 py-1.5 rounded-sm transition-colors hidden sm:inline-block"
              >
                {t('btn.sign_in', language, 'Sign In')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="lg:hidden flex overflow-x-auto border-t border-[#2A2A38] px-4 py-2 gap-2 text-[10px] font-bold uppercase tracking-wider no-scrollbar">
        {[
          { id: 'overview', key: 'nav.overview', label: 'Overview' },
          { id: 'agent', key: 'nav.agent', label: 'AI Agent' },
          { id: 'assessment', key: 'nav.assessment', label: 'Visa Audit' },
          { id: 'relocation', key: 'nav.relocation', label: 'Roadmap' },
          { id: 'intelligence', key: 'nav.intelligence', label: 'Intel' },
          { id: 'relief', key: 'nav.relief', label: 'Relief' },
          { id: 'documents', key: 'nav.documents', label: 'Docs' },
          { id: 'interview', key: 'nav.interview', label: 'Interview' },
          { id: 'safety', key: 'nav.safety', label: 'Safety' },
          { id: 'alerts', key: 'nav.alerts', label: 'Alerts' },
          { id: 'profile', key: 'nav.profile', label: 'Profile' },
          { id: 'audit', key: 'nav.audit', label: 'Audit' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`px-3 py-1 rounded whitespace-nowrap ${currentTab === item.id ? 'bg-white text-black font-black' : 'text-slate-100 bg-[#1D1D28] border border-[#333348]'}`}
          >
            {t(item.key, language, item.label)}
          </button>
        ))}
      </div>
    </header>
  );
};

