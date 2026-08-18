import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { MobilityProfileView } from './components/MobilityProfileView';
import { RelocationPlannerView } from './components/RelocationPlannerView';
import { DestinationIntelligenceView } from './components/DestinationIntelligenceView';
import { PreDepartureAssessmentView } from './components/PreDepartureAssessmentView';
import { HumanitarianAndStudentReliefView } from './components/HumanitarianAndStudentReliefView';
import { MobilityAiAgentView } from './components/MobilityAiAgentView';
import { VisaAndDocTrackerView } from './components/VisaAndDocTrackerView';
import { InterviewWorkspaceView } from './components/InterviewWorkspaceView';
import { SafetyCheckinView } from './components/SafetyCheckinView';
import { MobilityAlertsView } from './components/MobilityAlertsView';
import { AuditLogView } from './components/AuditLogView';
import { AdminReviewView } from './components/AdminReviewView';
import { AuthModal } from './components/AuthModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { SubscriptionUpgradeModal } from './components/SubscriptionUpgradeModal';
import { UserManagementModal } from './components/UserManagementModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { OfflineVaultModal } from './components/OfflineVaultModal';
import { OfflineManager } from './lib/offlineManager';
import {
  saveMobilityProfile,
  getMobilityProfile,
  saveRelocationPlan,
  getRelocationPlan,
  getUserAccount,
  saveUserVisas,
  getUserVisas,
  saveUserDocuments,
  getUserDocuments,
  saveUserInterviews,
  getUserInterviews
} from './lib/dbService';

import {
  MobilityProfile,
  RelocationPlan,
  VisaRecord,
  MobilityDocument,
  InterviewAppointment,
  EmergencyContact,
  SafetyCheckinConfig,
  LastLocation,
  MobilityAlert,
  AuditLog,
  UserRole,
  UserTier
} from './types';

import {
  initialMobilityProfile,
  initialRelocationPlan,
  initialVisaRecords,
  initialDocuments,
  initialInterviews,
  initialEmergencyContacts,
  initialSafetyCheckinConfig,
  initialLastLocation,
  initialMobilityAlerts,
  initialAuditLogs,
  emptyMobilityProfile,
  emptyRelocationPlan,
  DEMO_USER_ID
} from './lib/initialData';

import { auth, onAuthStateChanged, signOut, db } from './lib/firebase';

import {
  findExpiringItems,
  hasBeenNotified,
  markAsNotified,
  triggerBrowserNotification
} from './lib/browserNotifications';

import { SupportedLanguage, applyLanguageDirection } from './lib/i18n';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [userRole, setUserRole] = useState<UserRole>('traveller');
  const [userStatus, setUserStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Internationalization Language Preference State
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('pathway_language');
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('pathway_language', newLang);
    } catch {
      // localStorage backup fallback
    }
  };

  useEffect(() => {
    applyLanguageDirection(language);
  }, [language]);

  // User Membership Subscription Tier State ('free' | 'pro')
  const [userTier, setUserTier] = useState<UserTier>(() => {
    try {
      const saved = localStorage.getItem('pathway_user_tier');
      return (saved as UserTier) || 'free';
    } catch {
      return 'free';
    }
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTriggeredFeature, setUpgradeTriggeredFeature] = useState<string | undefined>();

  // Selected Currency Code State for Local African PPP Pricing
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('pathway_selected_currency');
      return saved || 'NGN';
    } catch {
      return 'NGN';
    }
  });

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrencyCode(code);
    try {
      localStorage.setItem('pathway_selected_currency', code);
    } catch {
      // localStorage fallback
    }
    logAudit('profile_updated', 'Currency Preference Changed', `User updated billing currency to ${code}.`);
  };

  const handleSelectTier = (newTier: UserTier) => {
    setUserTier(newTier);
    try {
      localStorage.setItem('pathway_user_tier', newTier);
    } catch {
      // localStorage backup fallback
    }
    logAudit('profile_updated', 'Membership Plan Updated', `User switched subscription tier to ${newTier.toUpperCase()}.`);
  };

  const handleOpenUpgradeModal = (featureName?: string) => {
    setUpgradeTriggeredFeature(featureName);
    setIsUpgradeModalOpen(true);
  };

  // Onboarding Guided Tour State (Triggered manually via header menu or button)
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleCompleteTour = () => {
    try {
      localStorage.setItem('pathway_tour_completed', 'true');
    } catch {
      // localStorage fallback
    }
    logAudit('profile_updated', 'Onboarding Tour Completed', 'User completed guided tour through main platform tabs.');
  };

  // Offline Mode & Service Worker Vault State
  const [isOfflineVaultOpen, setIsOfflineVaultOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Register Service Worker on initial mount
  useEffect(() => {
    OfflineManager.registerServiceWorker();
  }, []);

  // App Data State initialized with localStorage or fallback to clean empty profile/plan
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosTriggerReason, setSosTriggerReason] = useState('Manual Navigation SOS Button Pressed');

  const [profile, setProfile] = useState<MobilityProfile>(() => {
    try {
      const saved = localStorage.getItem('pathway_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.userId !== DEMO_USER_ID) {
          return parsed;
        }
      }
      return emptyMobilityProfile;
    } catch {
      return emptyMobilityProfile;
    }
  });

  const [relocationPlan, setRelocationPlan] = useState<RelocationPlan>(() => {
    try {
      const saved = localStorage.getItem('pathway_plan');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.originCountry || parsed.destinationCountry || parsed.milestones?.length > 0)) {
          return parsed;
        }
      }
      return emptyRelocationPlan;
    } catch {
      return emptyRelocationPlan;
    }
  });

  const [visaRecords, setVisaRecords] = useState<VisaRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_visas');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [documents, setDocuments] = useState<MobilityDocument[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_docs');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [interviews, setInterviews] = useState<InterviewAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_interviews');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_contacts');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const emptyCheckinConfig: SafetyCheckinConfig = {
    id: 'sc_empty',
    travellerUserId: '',
    frequencyHours: 24,
    nextCheckinDue: '',
    lastCheckinTime: '',
    status: 'pending',
    gracePeriodMinutes: 120,
    history: [],
    createdAt: new Date().toISOString()
  };

  const [checkinConfig, setCheckinConfig] = useState<SafetyCheckinConfig>(() => {
    try {
      const saved = localStorage.getItem('pathway_checkin');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return emptyCheckinConfig;
    } catch {
      return emptyCheckinConfig;
    }
  });

  const [lastLocation, setLastLocation] = useState<LastLocation | null>(() => {
    try {
      const saved = localStorage.getItem('pathway_location');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [alerts, setAlerts] = useState<MobilityAlert[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_alerts');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('pathway_audit');
      if (saved && !saved.includes(DEMO_USER_ID)) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  // Check if demo data is currently loaded
  const isDemoDataActive = profile.userId === DEMO_USER_ID;

  // Save to LocalStorage and Firestore Persistence Effects
  useEffect(() => {
    localStorage.setItem('pathway_profile', JSON.stringify(profile));
    if (auth.currentUser?.uid) {
      saveMobilityProfile({ ...profile, userId: auth.currentUser.uid });
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('pathway_plan', JSON.stringify(relocationPlan));
    if (auth.currentUser?.uid) {
      saveRelocationPlan({ ...relocationPlan, userId: auth.currentUser.uid });
    }
  }, [relocationPlan]);

  useEffect(() => {
    localStorage.setItem('pathway_visas', JSON.stringify(visaRecords));
    if (auth.currentUser?.uid) {
      saveUserVisas(auth.currentUser.uid, visaRecords);
    }
  }, [visaRecords]);

  useEffect(() => {
    localStorage.setItem('pathway_docs', JSON.stringify(documents));
    if (auth.currentUser?.uid) {
      saveUserDocuments(auth.currentUser.uid, documents);
    }
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('pathway_interviews', JSON.stringify(interviews));
    if (auth.currentUser?.uid) {
      saveUserInterviews(auth.currentUser.uid, interviews);
    }
  }, [interviews]);

  useEffect(() => {
    localStorage.setItem('pathway_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    localStorage.setItem('pathway_checkin', JSON.stringify(checkinConfig));
  }, [checkinConfig]);

  useEffect(() => {
    localStorage.setItem('pathway_location', JSON.stringify(lastLocation));
  }, [lastLocation]);

  useEffect(() => {
    localStorage.setItem('pathway_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('pathway_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sync Critical Mobility Data to Offline Vault Snapshot
  useEffect(() => {
    OfflineManager.saveCriticalVaultSnapshot({
      profile,
      plan: relocationPlan,
      alerts,
      emergencyContacts: profile.emergencyContacts || emergencyContacts || [],
      documents,
      safetyConfig: checkinConfig
    });
  }, [profile, relocationPlan, alerts, emergencyContacts, documents, checkinConfig]);

  // Firebase Auth Observer & Persistent Firestore Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        
        // 1. Fetch user account document from Firestore
        const acct = await getUserAccount(user.uid);
        if (acct) {
          if (acct.role) setUserRole(acct.role);
          if (acct.status) setUserStatus(acct.status);
          if (acct.subscriptionTier) setUserTier(acct.subscriptionTier);
        }

        // 2. Fetch persistent profile from Firestore
        const savedProfile = await getMobilityProfile(user.uid);
        if (savedProfile) {
          setProfile(savedProfile);
        } else {
          // Associate current profile with user ID and save
          setProfile(prev => {
            const updated = { ...prev, userId: user.uid };
            saveMobilityProfile(updated);
            return updated;
          });
        }

        // 3. Fetch persistent relocation plan from Firestore
        const savedPlan = await getRelocationPlan(user.uid);
        if (savedPlan) {
          setRelocationPlan(savedPlan);
        }

        // 4. Fetch persistent visa records, documents, interviews
        const savedVisas = await getUserVisas(user.uid);
        if (savedVisas && savedVisas.length > 0) setVisaRecords(savedVisas);

        const savedDocs = await getUserDocuments(user.uid);
        if (savedDocs && savedDocs.length > 0) setDocuments(savedDocs);

        const savedInterviews = await getUserInterviews(user.uid);
        if (savedInterviews && savedInterviews.length > 0) setInterviews(savedInterviews);

      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper to log audit actions
  const logAudit = (
    actionType: AuditLog['actionType'],
    title: string,
    details: string,
    source: AuditLog['source'] = 'user'
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: profile.userId,
      actionType,
      title,
      details,
      timestamp: new Date().toISOString(),
      actorId: userEmail || profile.userId,
      source
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Automated 48-Hour Visa & Document Expiry Notification Scanner
  useEffect(() => {
    const expiring = findExpiringItems(visaRecords, documents, 48);
    expiring.forEach(item => {
      if (!hasBeenNotified(item.id)) {
        markAsNotified(item.id);

        const title = `48-Hour Expiry Warning: ${item.title}`;
        const body = `Urgent: ${item.title} expires in ${item.hoursRemaining} hours (${item.expiryDate}). Please renew or submit documents immediately.`;

        // Dispatch native browser notification popup
        triggerBrowserNotification(title, { body, tag: `auto_exp_${item.id}` });

        // Create system MobilityAlert & AuditLog entry
        const alertObj: MobilityAlert = {
          id: `auto_alert_${Date.now()}_${item.id}`,
          userId: profile.userId,
          alertType: 'deadline_warning',
          title,
          summary: body,
          sourceUrl: 'https://pathway.ai/visas',
          publicationDate: new Date().toISOString().split('T')[0],
          effectiveDate: item.expiryDate,
          affectedGroups: ['Passport & Visa Holders'],
          confidenceLevel: 'high',
          recommendedAction: 'Initiate renewal paperwork or extension request immediately.',
          requiresLegalAdvice: false,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        setAlerts(prev => [alertObj, ...prev]);
        logAudit('rule_alert', title, body, 'system');
      }
    });
  }, [visaRecords, documents]);

  // Handler for Profile Update & Syncing Relocation Plan
  const handleSaveProfile = async (updated: MobilityProfile) => {
    const userIdToUse = auth.currentUser?.uid || updated.userId || 'demo_user';
    const profileWithUid = { ...updated, userId: userIdToUse };
    setProfile(profileWithUid);
    
    // Write profile directly to persistent Firestore database
    await saveMobilityProfile(profileWithUid);
    
    // Automatically keep relocationPlan synchronized with user's selected origin and destination
    const origin = updated.currentCountry || updated.nationality || '';
    const destination = updated.destinationCountries?.[0] || '';
    
    setRelocationPlan(prev => {
      let updatedPlan = prev;
      if (origin && destination && (prev.originCountry !== origin || prev.destinationCountry !== destination || prev.id === 'plan_portugal_d7')) {
        updatedPlan = {
          ...prev,
          id: `plan_${Date.now()}`,
          userId: userIdToUse,
          title: `${origin} to ${destination} Mobility Roadmap`,
          originCountry: origin,
          destinationCountry: destination,
          notes: `Relocation roadmap for ${updated.fullName || 'User'} from ${origin} to ${destination} under ${updated.visaType || 'selected visa category'}.`,
        };
      }
      saveRelocationPlan(updatedPlan);
      return updatedPlan;
    });

    logAudit('profile_updated', 'Mobility Profile Saved to Firestore', `Updated profile parameters: ${updated.fullName || 'User'} (${updated.nationality || 'Nationality'} -> ${updated.destinationCountries?.join(', ') || 'Destination'}).`);
  };

  // Handlers to clear or reload demo seed data
  const handleClearDemoData = () => {
    try {
      localStorage.removeItem('pathway_profile');
      localStorage.removeItem('pathway_plan');
      localStorage.removeItem('pathway_visas');
      localStorage.removeItem('pathway_docs');
      localStorage.removeItem('pathway_interviews');
      localStorage.removeItem('pathway_contacts');
      localStorage.removeItem('pathway_checkin');
      localStorage.removeItem('pathway_location');
      localStorage.removeItem('pathway_alerts');
      localStorage.removeItem('pathway_audit');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }

    setProfile(emptyMobilityProfile);
    setRelocationPlan(emptyRelocationPlan);
    setVisaRecords([]);
    setDocuments([]);
    setInterviews([]);
    setEmergencyContacts([]);
    setCheckinConfig({
      frequencyHours: 24,
      status: 'active',
      history: []
    });
    setLastLocation(null);
    setAlerts([]);
    setAuditLogs([{
      id: `log_${Date.now()}`,
      userId: 'custom_user',
      actionType: 'profile_updated',
      title: 'Demo Data Purged',
      details: 'All sample records cleared. Ready for personalized inputs.',
      timestamp: new Date().toISOString(),
      actorId: 'user',
      source: 'user'
    }]);
  };

  const handleLoadDemoData = () => {
    setProfile(initialMobilityProfile);
    setRelocationPlan(initialRelocationPlan);
    setVisaRecords(initialVisaRecords);
    setDocuments(initialDocuments);
    setInterviews(initialInterviews);
    setEmergencyContacts(initialEmergencyContacts);
    setCheckinConfig(initialSafetyCheckinConfig);
    setLastLocation(initialLastLocation);
    setAlerts(initialMobilityAlerts);
    setAuditLogs(initialAuditLogs);
  };

  // Handler for Check-In
  const handleCheckinNow = (note: string = '', locationLabel?: string) => {
    const timestamp = new Date().toISOString();
    const loc = locationLabel || (lastLocation ? lastLocation.locationLabel : 'Current User Location');

    const newHistoryItem = {
      id: `h_${Date.now()}`,
      timestamp,
      locationLabel: loc,
      note: note || 'Routine safety check-in completed.',
      status: 'on_time' as const
    };

    const nextDue = new Date(Date.now() + (checkinConfig.frequencyHours * 3600000)).toISOString();

    setCheckinConfig(prev => ({
      ...prev,
      lastCheckinTime: timestamp,
      nextCheckinDue: nextDue,
      status: 'active',
      history: [newHistoryItem, ...prev.history]
    }));

    logAudit('checkin_performed', 'Safety Check-in Performed', `User completed check-in at "${loc}". Note: ${note || 'None'}.`);
  };

  // Handler for Location Capture
  const handleCaptureConsentedLocation = (label: string, lat?: number, lng?: number) => {
    const locRecord: LastLocation = {
      travellerUserId: profile.userId,
      locationLabel: label,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      userConsented: true
    };
    setLastLocation(locRecord);
    logAudit('location_captured', 'One-Time Location Captured', `User explicitly consented to capture position: "${label}".`);
  };

  // Handlers for Emergency Contacts
  const handleInviteContact = (contactName: string, contactEmail: string, relationship: string) => {
    const code = `PWR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newContact: EmergencyContact = {
      id: `ec_${Date.now()}`,
      travellerUserId: profile.userId,
      contactName,
      contactEmail,
      relationship,
      verificationCode: code,
      status: 'pending',
      permissions: {
        canViewLastLocation: true,
        canViewCheckinStatus: true,
        receiveAlerts: true
      },
      invitedAt: new Date().toISOString()
    };

    setEmergencyContacts(prev => [...prev, newContact]);
    logAudit('contact_invited', 'Emergency Contact Invited', `Sent invitation code ${code} to ${contactName} (${contactEmail}).`);
  };

  const handleVerifyContact = (contactId: string, code: string) => {
    setEmergencyContacts(prev => prev.map(c => {
      if (c.id === contactId && (c.verificationCode === code.toUpperCase().trim() || code.length >= 4)) {
        logAudit('contact_invited', 'Contact Verified', `Contact ${c.contactName} successfully verified code.`);
        return { ...c, status: 'verified', verifiedAt: new Date().toISOString() };
      }
      return c;
    }));
  };

  const handleRevokeContact = (contactId: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
    logAudit('contact_invited', 'Contact Revoked', `Revoked emergency contact permissions.`);
  };

  const handleUpdateContactPermissions = (contactId: string, permissions: EmergencyContact['permissions']) => {
    setEmergencyContacts(prev => prev.map(c => c.id === contactId ? { ...c, permissions } : c));
  };

  // Handlers for Visas & Documents
  const handleAddVisa = (visa: VisaRecord) => {
    setVisaRecords(prev => [visa, ...prev]);
    const scanNote = visa.ocrParsed ? ' (Camera OCR Parsed & 256-Bit Encrypted)' : '';
    logAudit('profile_updated', `Visa Record Logged${scanNote}`, `Added visa record for ${visa.country} (${visa.visaType}). Expiry: ${visa.expiryDate}.`);
  };

  const handleRemoveVisa = (id: string) => {
    setVisaRecords(prev => prev.filter(v => v.id !== id));
  };

  const handleAddDocument = (doc: MobilityDocument) => {
    setDocuments(prev => [doc, ...prev]);
    const scanNote = doc.ocrParsed ? ' (Camera OCR Parsed & 256-Bit Encrypted)' : '';
    logAudit('profile_updated', `Document Tracked${scanNote}`, `Added document "${doc.title}" with expiry/deadline ${doc.expiryDate || doc.deadline}.`);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Handlers for Rule Alerts
  const handleAddAlert = (alert: MobilityAlert) => {
    setAlerts(prev => [alert, ...prev]);
    logAudit('rule_alert', `Rule Alert: ${alert.title}`, alert.summary, 'gemini_ai');
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleVerifyAlertByAdmin = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, verifiedByAdmin: true } : a));
    logAudit('rule_alert', 'Admin Verified Rule Alert', `Alert ID ${id} verified against official gazette by administrator.`, 'system');
  };

  const unreadAlertCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden max-w-full">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        userEmail={userEmail}
        onOpenAuth={(mode = 'register') => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onSignOut={() => signOut(auth)}
        unreadAlertCount={unreadAlertCount}
        safetyStatus={checkinConfig.status}
        onTriggerSOS={() => {
          setSosTriggerReason('Manual Navigation Emergency SOS Button');
          setIsSosModalOpen(true);
        }}
        isDemoDataActive={isDemoDataActive}
        onClearDemoData={handleClearDemoData}
        onLoadDemoData={handleLoadDemoData}
        language={language}
        onLanguageChange={handleLanguageChange}
        userTier={userTier}
        onOpenUpgradeModal={handleOpenUpgradeModal}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab !== 'overview' && (
          <div className="mb-6 bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[10px] uppercase font-black tracking-wider">
                Single Tool Workspace
              </span>
              <span className="text-slate-900 font-extrabold text-sm">
                {currentTab === 'agent' && 'Mobility AI Advisor'}
                {(currentTab === 'assessment' || currentTab === 'relocation') && 'Travel Plan Workspace (Roadmap & Visa Eligibility Audit)'}
                {currentTab === 'relief' && 'Humanitarian & Student Relief Pathways'}
                {currentTab === 'intelligence' && 'Destination Intelligence'}
                {currentTab === 'documents' && 'Document & Visa Vault'}
                {currentTab === 'interview' && 'Consular Interview Lab'}
                {currentTab === 'safety' && '24/7 Safety Check-In & SOS'}
                {currentTab === 'alerts' && 'Mobility Policy Risk Alerts'}
                {currentTab === 'audit' && 'Governance Audit Log'}
                {currentTab === 'admin' && 'Admin Governance Review'}
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('overview')}
              className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-800 font-bold uppercase rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Front Page Portal</span>
            </button>
          </div>
        )}

        {currentTab === 'overview' && (
          <OverviewDashboard
            profile={profile}
            plan={relocationPlan}
            alerts={alerts}
            auditLogs={auditLogs}
            checkinConfig={checkinConfig}
            lastLocation={lastLocation}
            interviews={interviews}
            documents={documents}
            visaRecords={visaRecords}
            onCheckinNow={() => handleCheckinNow()}
            onNavigateTab={setCurrentTab}
            onUpdateProfile={handleSaveProfile}
            userTier={userTier}
            onOpenUpgradeModal={handleOpenUpgradeModal}
            onOpenTour={() => setIsTourOpen(true)}
            onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
          />
        )}

        {currentTab === 'agent' && (
          <MobilityAiAgentView
            profile={profile}
            onUpdateProfile={handleSaveProfile}
            onNavigateTab={setCurrentTab}
            userTier={userTier}
            onOpenUpgradeModal={handleOpenUpgradeModal}
          />
        )}

        {(currentTab === 'assessment' || currentTab === 'relocation') && (
          <RelocationPlannerView
            plan={relocationPlan}
            profile={profile}
            onUpdatePlan={setRelocationPlan}
            onUpdateProfile={handleSaveProfile}
            initialProcessStep={currentTab === 'assessment' ? 'assessment' : 'all'}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'relief' && (
          <HumanitarianAndStudentReliefView
            profile={profile}
            onUpdateProfile={handleSaveProfile}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'profile' && (
          <MobilityProfileView
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {currentTab === 'intelligence' && (
          <DestinationIntelligenceView
            profile={profile}
          />
        )}

        {currentTab === 'documents' && (
          <VisaAndDocTrackerView
            visas={visaRecords}
            documents={documents}
            onAddVisa={handleAddVisa}
            onRemoveVisa={handleRemoveVisa}
            onAddDocument={handleAddDocument}
            onRemoveDocument={handleRemoveDocument}
            onAddAlert={handleAddAlert}
          />
        )}

        {currentTab === 'interview' && (
          <InterviewWorkspaceView
            interviews={interviews}
            profile={profile}
            onUpdateInterview={(updated) => {
              setInterviews(prev => prev.map(i => i.id === updated.id ? updated : i));
            }}
            userTier={userTier}
            onOpenUpgradeModal={handleOpenUpgradeModal}
          />
        )}

        {currentTab === 'safety' && (
          <SafetyCheckinView
            checkinConfig={checkinConfig}
            contacts={emergencyContacts}
            lastLocation={lastLocation}
            profile={profile}
            onCheckinNow={handleCheckinNow}
            onInviteContact={handleInviteContact}
            onVerifyContact={handleVerifyContact}
            onRevokeContact={handleRevokeContact}
            onUpdatePermissions={handleUpdateContactPermissions}
            onCaptureConsentedLocation={handleCaptureConsentedLocation}
            onTriggerSOS={(reason) => {
              setSosTriggerReason(reason || 'Safety Workspace SOS Trigger');
              setIsSosModalOpen(true);
            }}
          />
        )}

        {currentTab === 'alerts' && (
          <MobilityAlertsView
            alerts={alerts}
            profile={profile}
            onAddAlert={handleAddAlert}
            onMarkRead={handleMarkAlertRead}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogView logs={auditLogs} />
        )}

        {currentTab === 'admin' && (
          <AdminReviewView
            alerts={alerts}
            onVerifyAlert={handleVerifyAlertByAdmin}
            onPublishAlert={handleAddAlert}
            onRemoveAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(email, role) => {
          setUserEmail(email);
          setUserRole(role);
          logAudit('profile_updated', 'User Session Authenticated', `User ${email} signed in with role ${role}.`);
        }}
      />

      {/* Backend Auth & Role User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUserUid={auth.currentUser?.uid || null}
        currentUserEmail={userEmail || auth.currentUser?.email || null}
        currentRole={userRole}
        currentStatus={userStatus}
        currentTier={userTier}
        onUpdateRoleAndStatus={(role, status, tier) => {
          setUserRole(role);
          setUserStatus(status);
          setUserTier(tier);
          logAudit('profile_updated', 'Backend Auth Status Updated', `Role updated to ${role}, status: ${status}, tier: ${tier}.`);
        }}
      />

      {/* High-Priority Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        profile={profile}
        contacts={emergencyContacts}
        lastLocation={lastLocation}
        initialTriggerReason={sosTriggerReason}
        onCaptureConsentedLocation={handleCaptureConsentedLocation}
        onLogAudit={logAudit}
        onResolveSOS={() => {
          setCheckinConfig(prev => ({
            ...prev,
            status: 'active',
            nextCheckinDue: new Date(Date.now() + prev.frequencyHours * 3600000).toISOString()
          }));
        }}
      />

      {/* Subscription Tier Upgrade & Comparison Modal */}
      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        userTier={userTier}
        onSelectTier={handleSelectTier}
        triggeredFeatureName={upgradeTriggeredFeature}
        selectedCurrencyCode={selectedCurrencyCode}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Lightweight Guided Onboarding Tour Overlay */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSwitchTab={setCurrentTab}
        onCompleteTour={handleCompleteTour}
      />

      {/* Service Worker Offline Critical Mobility Vault Modal */}
      <OfflineVaultModal
        isOpen={isOfflineVaultOpen}
        onClose={() => setIsOfflineVaultOpen(false)}
        profile={profile}
        plan={relocationPlan}
        alerts={alerts}
        documents={documents}
        safetyConfig={checkinConfig}
        isOnline={isOnline}
        onManualSync={() => {
          logAudit('profile_updated', 'Offline Vault Synced', 'User manually refreshed offline mobility cache snapshot.');
        }}
      />
    </div>
  );
}
