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
  AuditLog 
} from '../types';

export const DEMO_USER_ID = 'demo_user_julian_rivas';

export const initialMobilityProfile: MobilityProfile = {
  userId: DEMO_USER_ID,
  fullName: '',
  nationality: 'Canada',
  currentCountry: 'Canada',
  destinationCountries: ['Portugal', 'Spain', 'Germany'],
  purposeOfTravel: 'relocation',
  currentImmigrationStatus: 'Citizen (Canada) / D7 Visa Applicant',
  visaStatus: 'application_started',
  visaType: 'D7 Passive Income & Remote Work Visa',
  visaIssueDate: '2026-01-15',
  visaExpirationDate: '2026-10-15',
  passportExpiration: '2029-06-30',
  schoolOrEmployer: 'Apex Systems Inc. (Remote Senior Eng)',
  workAuthorisation: 'Canada (Full) / Portugal Remote Permitted',
  qualifications: ['Software Eng B.Sc.', 'MSc Data Science'],
  budget: 45000,
  dependants: 0,
  longTermGoals: 'Secure EU Permanent Residency via Portugal D7 / Tech Visa pathways within 5 years.',
  sharingSettings: {
    shareLastLocation: true,
    shareCheckinStatus: true,
    shareVisaStatus: false,
  },
  updatedAt: new Date().toISOString(),
};

export const initialRelocationPlan: RelocationPlan = {
  id: 'plan_portugal_d7',
  userId: DEMO_USER_ID,
  title: 'Toronto to Lisbon Mobility Roadmap',
  originCountry: 'Canada',
  destinationCountry: 'Portugal',
  currentPhase: 'Interview',
  targetDate: '2026-11-01',
  milestones: [
    { id: 'm1', title: 'NIF Tax Number & PT Bank Account Setup', dueDate: '2026-03-10', completed: true, stage: 'Eligibility', notes: 'Completed via attorney representation in Lisbon.' },
    { id: 'm2', title: 'Proof of Remote Income & Accommodation Lease', dueDate: '2026-04-20', completed: true, stage: 'Documentation', notes: 'Uploaded 12-month lease agreement in Alameda, Lisbon.' },
    { id: 'm3', title: 'VFS Global Biometrics Appointment', dueDate: '2026-08-15', completed: false, stage: 'Interview', notes: 'Appointment confirmed at VFS Toronto center.' },
    { id: 'm4', title: 'Consular Visa Stamp & Entry Flight', dueDate: '2026-09-30', completed: false, stage: 'Entry', notes: 'Awaiting passport return post-interview.' },
    { id: 'm5', title: 'AIMA Residence Permit Appointment (Lisbon)', dueDate: '2026-11-20', completed: false, stage: 'Settlement', notes: 'To convert D7 entry visa into 2-year residence card.' }
  ],
  budgetAllocation: {
    visaFees: 850,
    housing: 12000,
    flight: 1100,
    emergencyFund: 15000
  },
  notes: 'Strategic relocation to Portugal under the D7 Remote Work / Passive Income framework.',
  createdAt: new Date().toISOString()
};

export const initialVisaRecords: VisaRecord[] = [
  {
    id: 'vr1',
    userId: DEMO_USER_ID,
    country: 'Portugal',
    visaType: 'D7 Remote Income Entry Visa',
    status: 'pending',
    documentNumber: 'PT-D7-2026-98841',
    issueDate: '2026-01-15',
    expiryDate: '2026-10-15',
    workRights: 'Permitted to perform remote work for non-PT entity',
    conditions: ['Planning reference: 4x PT minimum wage (€3,680/mo for continental Portugal in 2026; verify before applying)', 'Health-insurance requirements must be verified'],
    notes: 'VFS Submission in progress.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vr2',
    userId: DEMO_USER_ID,
    country: 'Canada',
    visaType: 'Passport / Citizen',
    status: 'valid',
    documentNumber: 'ZA-9821415',
    issueDate: '2019-07-01',
    expiryDate: '2029-06-30',
    workRights: 'Unrestricted employment and residence',
    conditions: [],
    notes: 'Primary passport valid for 3+ years.',
    createdAt: new Date().toISOString()
  }
];

export const initialDocuments: MobilityDocument[] = [
  {
    id: 'doc1',
    userId: DEMO_USER_ID,
    title: 'Canadian Passport Original',
    category: 'passport',
    deadline: '2026-08-01',
    expiryDate: '2029-06-30',
    status: 'valid',
    notes: 'Valid for full duration of trip and visa processing.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'doc2',
    userId: DEMO_USER_ID,
    title: 'Proof of Remote Income (Paystubs & Tax Return)',
    category: 'proof_of_funds',
    deadline: '2026-08-10',
    expiryDate: '2026-12-31',
    status: 'valid',
    notes: 'Synthetic demo statements intended to illustrate recurring-income evidence; not authenticated or officially reviewed.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'doc3',
    userId: DEMO_USER_ID,
    title: 'FBI Criminal Record Certificate with Apostille',
    category: 'other',
    deadline: '2026-07-30',
    expiryDate: '2026-07-30',
    status: 'expiring_soon',
    notes: 'Urgent: Expiry deadline is in under 48 hours! Must be submitted to VFS consulate.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'doc4',
    userId: DEMO_USER_ID,
    title: 'International Travel Health Insurance',
    category: 'medical',
    deadline: '2026-08-12',
    expiryDate: '2027-08-12',
    status: 'valid',
    notes: 'Comprehensive repatriation & hospitalisation coverage for EU zone.',
    createdAt: new Date().toISOString()
  }
];

export const initialInterviews: InterviewAppointment[] = [
  {
    id: 'int1',
    userId: DEMO_USER_ID,
    title: 'VFS Global Biometrics & Consular Submission',
    embassyOrLocation: 'VFS Global Center, 480 University Ave, Toronto',
    appointmentDate: '2026-08-24',
    appointmentTime: '10:15 AM',
    stage: 'Consular Visa Interview',
    prepNotes: 'Bring original passport, printed NIF document, bank statements, lease agreement, and criminal background apostille.',
    questions: [
      {
        id: 'q1',
        question: 'What is the exact source and nature of your income while residing in Portugal?',
        suggestedAnswer: 'I am employed as a Senior Software Engineer for Apex Systems Inc. (Canada). I work remotely and my salary exceeds €4,200/mo, deposited directly into my bank account.',
        confidence: 'high'
      },
      {
        id: 'q2',
        question: 'Where will you reside upon entry into Portugal?',
        suggestedAnswer: 'I have signed a 12-month residential lease for an apartment located in Alameda, Lisbon, registered with Financas.',
        confidence: 'high'
      },
      {
        id: 'q3',
        question: 'Do you intend to seek local Portuguese employment?',
        suggestedAnswer: 'No, my financial independence relies entirely on remote work for my foreign employer. I do not intend to compete in the local employment market.',
        confidence: 'medium'
      }
    ],
    status: 'scheduled',
    createdAt: new Date().toISOString()
  }
];

export const initialEmergencyContacts: EmergencyContact[] = [
  {
    id: 'ec1',
    travellerUserId: DEMO_USER_ID,
    contactEmail: 'elena.rivas@example.com',
    contactName: 'Elena Rivas',
    relationship: 'Sister / Emergency Point of Contact',
    verificationCode: 'PWR-9482',
    status: 'verified',
    permissions: {
      canViewLastLocation: true,
      canViewCheckinStatus: true,
      receiveAlerts: true
    },
    invitedAt: '2026-07-01T10:00:00Z',
    verifiedAt: '2026-07-01T10:15:00Z'
  }
];

export const initialSafetyCheckinConfig: SafetyCheckinConfig = {
  id: 'sc1',
  travellerUserId: DEMO_USER_ID,
  frequencyHours: 24,
  nextCheckinDue: new Date(Date.now() + 6120000).toISOString(), // ~1 hr 42 min from now
  lastCheckinTime: new Date(Date.now() - 80280000).toISOString(),
  status: 'active',
  gracePeriodMinutes: 120,
  history: [
    {
      id: 'h1',
      timestamp: new Date(Date.now() - 80280000).toISOString(),
      locationLabel: 'Toronto Pearson International Airport Terminal 1',
      note: 'Preparing for transit check. Everything safe.',
      status: 'on_time'
    },
    {
      id: 'h2',
      timestamp: new Date(Date.now() - 166680000).toISOString(),
      locationLabel: 'Downtown Toronto Core (Financial District)',
      note: 'Scheduled 24h routine safety check-in.',
      status: 'on_time'
    }
  ],
  createdAt: new Date().toISOString()
};

export const initialLastLocation: LastLocation = {
  travellerUserId: DEMO_USER_ID,
  locationLabel: 'Toronto Downtown Core (User Consented)',
  latitude: 43.6532,
  longitude: -79.3832,
  timestamp: new Date(Date.now() - 80280000).toISOString(),
  userConsented: true
};

export const initialMobilityAlerts: MobilityAlert[] = [
  {
    id: 'alert1',
    userId: DEMO_USER_ID,
    alertType: 'visa_policy',
    title: 'Portugal Remote Income Requirement Indexation Adjustment',
    summary: 'Diario da Republica published a 4.2% minimum monthly income adjustment for D7 and Digital Nomad visa categories following statutory minimum wage updates.',
    sourceUrl: 'https://dre.pt/dre/detalhe/diario-republica/official-statute-2026-d7-threshold',
    publicationDate: '2026-01-05',
    effectiveDate: '2026-01-01',
    affectedGroups: ['D7 Visa Applicants', 'Digital Nomad Residence Holders', 'Foreign Remote Workers'],
    confidenceLevel: 'high',
    recommendedAction: 'Compare pay slips with the current official income requirement before the consular appointment.',
    requiresLegalAdvice: true,
    isRead: false,
    verifiedByAdmin: true,
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'alert2',
    userId: DEMO_USER_ID,
    alertType: 'work_rights',
    title: 'Educational & Technical Qualification Equivalency Guidance',
    summary: 'Consular processing updates indicate MSc in Data Science and Software Engineering degrees from accredited Canadian universities satisfy Tech Visa highly qualified activity (HQA) thresholds.',
    sourceUrl: 'https://vfs-portugal.ca/official-hqa-equivalency-notice',
    publicationDate: '2026-02-12',
    effectiveDate: '2026-02-15',
    affectedGroups: ['Canadian STEM Degree Holders', 'Tech Visa Applicants'],
    confidenceLevel: 'high',
    recommendedAction: 'Include official university transcript and diploma copy certified by WES or university registrar.',
    requiresLegalAdvice: false,
    isRead: true,
    verifiedByAdmin: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    userId: DEMO_USER_ID,
    actionType: 'rule_alert',
    title: 'Rule Update Parsed: PT D7 Statutory Threshold',
    details: 'System parsed Diario da Republica official update and matched against registered traveller profile (Destination: Portugal, Visa: D7).',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    actorId: 'system_gemini_engine',
    source: 'gemini_ai'
  },
  {
    id: 'log2',
    userId: DEMO_USER_ID,
    actionType: 'checkin_performed',
    title: 'Safety Check-in Recorded',
    details: 'User completed routine 24h safety check-in from "Toronto Pearson International Airport Terminal 1".',
    timestamp: new Date(Date.now() - 80280000).toISOString(),
    actorId: DEMO_USER_ID,
    source: 'user'
  },
  {
    id: 'log3',
    userId: DEMO_USER_ID,
    actionType: 'location_captured',
    title: 'One-Time Location Captured (User Consented)',
    details: 'Recorded consented location "Toronto Downtown Core (User Consented)". Explicit permission granted.',
    timestamp: new Date(Date.now() - 80280000).toISOString(),
    actorId: DEMO_USER_ID,
    source: 'user'
  },
  {
    id: 'log4',
    userId: DEMO_USER_ID,
    actionType: 'contact_invited',
    title: 'Emergency Contact Verification Completed',
    details: 'Contact Elena Rivas (elena.rivas@example.com) verified with code PWR-9482. Permissions granted: Location, Checkin Status.',
    timestamp: new Date(Date.now() - 250000000).toISOString(),
    actorId: DEMO_USER_ID,
    source: 'system'
  }
];

export const emptyMobilityProfile: MobilityProfile = {
  userId: 'custom_user_profile',
  fullName: '',
  nationality: '',
  currentCountry: '',
  destinationCountries: [],
  purposeOfTravel: 'relocation',
  currentImmigrationStatus: 'Exploring Visa Pathways',
  visaStatus: 'none',
  visaType: '',
  visaIssueDate: '',
  visaExpirationDate: '',
  passportExpiration: '',
  schoolOrEmployer: '',
  workAuthorisation: '',
  qualifications: [],
  budget: 0,
  dependants: 0,
  longTermGoals: '',
  sharingSettings: {
    shareLastLocation: false,
    shareCheckinStatus: false,
    shareVisaStatus: false,
  },
  updatedAt: new Date().toISOString(),
};

export const emptyRelocationPlan: RelocationPlan = {
  id: 'plan_custom_user',
  userId: 'custom_user_profile',
  title: 'Personal Mobility Roadmap',
  originCountry: '',
  destinationCountry: '',
  currentPhase: 'Eligibility',
  targetDate: '',
  milestones: [],
  budgetAllocation: {
    visaFees: 0,
    housing: 0,
    flight: 0,
    emergencyFund: 0
  },
  notes: '',
  createdAt: new Date().toISOString()
};
