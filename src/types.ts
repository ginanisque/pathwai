export type UserRole = 'traveller' | 'emergency_contact' | 'admin';
export type UserTier = 'free' | 'pro';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  subscriptionTier?: UserTier;
  createdAt: string;
  updatedAt: string;
}

export interface MobilitySharingSettings {
  shareLastLocation: boolean;
  shareCheckinStatus: boolean;
  shareVisaStatus: boolean;
}

export type VisaStatusOption = 'none' | 'application_started' | 'visa_granted' | 'visa_denied' | 'no_visa_required';

export interface MobilityProfile {
  id?: string;
  userId: string;
  fullName: string;
  nationality: string;
  currentCountry: string;
  destinationCountries: string[];
  purposeOfTravel: 'visit' | 'education' | 'relocation' | 'work' | 'digital_nomad' | 'family' | 'humanitarian' | 'business';
  currentImmigrationStatus: string;
  visaStatus?: VisaStatusOption;
  visaType: string;
  visaIssueDate: string;
  visaExpirationDate: string;
  passportExpiration: string;
  schoolOrEmployer: string;
  workAuthorisation: string;
  qualifications: string[];
  budget: number;
  dependants: number;
  longTermGoals: string;
  sharingSettings: MobilitySharingSettings;
  updatedAt: string;
}

export interface RelocationMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
  stage: 'Eligibility' | 'Documentation' | 'Interview' | 'Entry' | 'Settlement';
}

export interface RelocationPlan {
  id: string;
  userId: string;
  title: string;
  originCountry: string;
  destinationCountry: string;
  currentPhase: 'Eligibility' | 'Documentation' | 'Interview' | 'Entry' | 'Settlement';
  targetDate: string;
  milestones: RelocationMilestone[];
  budgetAllocation: {
    visaFees: number;
    housing: number;
    flight: number;
    emergencyFund: number;
  };
  notes: string;
  createdAt: string;
}

export interface VisaRecord {
  id: string;
  userId: string;
  country: string;
  visaType: string;
  status: 'valid' | 'expiring_soon' | 'pending' | 'expired';
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  workRights: string;
  conditions: string[];
  notes: string;
  encryptedImageData?: string;
  encryptedIv?: string;
  ocrParsed?: boolean;
  createdAt: string;
}

export interface MobilityDocument {
  id: string;
  userId: string;
  title: string;
  category: 'passport' | 'visa' | 'proof_of_funds' | 'diploma' | 'employment' | 'medical' | 'other';
  deadline: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending_submission';
  notes: string;
  fileRef?: string;
  encryptedImageData?: string;
  encryptedIv?: string;
  ocrParsed?: boolean;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  suggestedAnswer: string;
  userNotes?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface InterviewAppointment {
  id: string;
  userId: string;
  title: string;
  embassyOrLocation: string;
  appointmentDate: string;
  appointmentTime: string;
  stage: string;
  prepNotes: string;
  questions: InterviewQuestion[];
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface EmergencyContactPermissions {
  canViewLastLocation: boolean;
  canViewCheckinStatus: boolean;
  receiveAlerts: boolean;
}

export interface EmergencyContact {
  id: string;
  travellerUserId: string;
  contactEmail: string;
  contactName: string;
  relationship: string;
  verificationCode: string;
  status: 'pending' | 'verified' | 'revoked';
  permissions: EmergencyContactPermissions;
  invitedAt: string;
  verifiedAt?: string;
}

export interface SafetyCheckinItem {
  id: string;
  timestamp: string;
  locationLabel: string;
  note: string;
  status: 'on_time' | 'late' | 'manual';
}

export interface SafetyCheckinConfig {
  id: string;
  travellerUserId: string;
  frequencyHours: number;
  nextCheckinDue: string;
  lastCheckinTime: string;
  status: 'active' | 'pending' | 'overdue' | 'escalated';
  gracePeriodMinutes: number;
  history: SafetyCheckinItem[];
  createdAt: string;
}

export interface LastLocation {
  id?: string;
  travellerUserId: string;
  locationLabel: string; // e.g. "Toronto Downtown Core (User Consented)"
  latitude?: number;
  longitude?: number;
  timestamp: string;
  userConsented: true; // Always true, explicit permission
}

export interface MobilityAlert {
  id: string;
  userId: string;
  alertType: 'visa_policy' | 'travel_advisory' | 'work_rights' | 'deadline_warning' | 'security';
  title: string;
  summary: string;
  sourceUrl: string;
  publicationDate: string;
  effectiveDate: string;
  affectedGroups: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendedAction: string;
  requiresLegalAdvice: boolean;
  isRead: boolean;
  verifiedByAdmin?: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  actionType: 'ai_recommendation' | 'rule_alert' | 'location_captured' | 'checkin_performed' | 'contact_invited' | 'profile_updated' | 'escalation_triggered';
  title: string;
  details: string;
  timestamp: string;
  actorId: string;
  source: 'system' | 'gemini_ai' | 'user';
}

export interface OutingSafetyVault {
  id: string;
  title: string;
  outingType: 'date' | 'solo_outing' | 'travel_meetup' | 'job_interview' | 'other';
  venueName: string;
  venueAddress: string;
  companionName: string;
  companionPhone: string;
  companionSocialHandle?: string;
  vehiclePlate: string;
  vehicleModelColor?: string;
  emergencyNotes?: string;
  photoUrl?: string; // base64 or photo URL
  dueAt: string; // ISO string for timer
  status: 'active' | 'completed' | 'escalated' | 'cancelled';
  pinCode?: string; // optional vault lock PIN
  createdAt: string;
}
