import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc
} from './firebase';
import {
  UserAccount,
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
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
    },
    operationType,
    path
  };
  console.error('Firestore Database Service Error: ', JSON.stringify(errInfo));
}

export interface ExtendedUserAccount extends UserAccount {
  status?: 'active' | 'pending' | 'suspended';
  lastActive?: string;
}

// 1. User Account & Backend Role/Status Persistence
export async function saveUserAccount(account: ExtendedUserAccount): Promise<void> {
  const path = `users/${account.uid}`;
  try {
    const userRef = doc(db, 'users', account.uid);
    await setDoc(userRef, {
      uid: account.uid,
      email: account.email,
      displayName: account.displayName || account.email.split('@')[0],
      role: account.role || 'traveller',
      status: account.status || 'active',
      subscriptionTier: account.subscriptionTier || 'free',
      createdAt: account.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserAccount(uid: string): Promise<ExtendedUserAccount | null> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as ExtendedUserAccount;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function getAllUserAccounts(): Promise<ExtendedUserAccount[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as ExtendedUserAccount);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function updateUserRoleAndStatus(
  uid: string,
  role: UserRole,
  status: 'active' | 'pending' | 'suspended' = 'active',
  subscriptionTier: UserTier = 'free'
): Promise<boolean> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role,
      status,
      subscriptionTier,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    // If doc doesn't exist, set it
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid,
        role,
        status,
        subscriptionTier,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (innerErr) {
      handleFirestoreError(innerErr, OperationType.WRITE, path);
      return false;
    }
  }
}

// 2. Mobility Profile Persistence
export async function saveMobilityProfile(profile: MobilityProfile): Promise<void> {
  if (!profile.userId) return;
  const path = `mobilityProfiles/${profile.userId}`;
  try {
    const ref = doc(db, 'mobilityProfiles', profile.userId);
    await setDoc(ref, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getMobilityProfile(userId: string): Promise<MobilityProfile | null> {
  const path = `mobilityProfiles/${userId}`;
  try {
    const ref = doc(db, 'mobilityProfiles', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as MobilityProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// 3. Relocation Plan Persistence
export async function saveRelocationPlan(plan: RelocationPlan): Promise<void> {
  if (!plan.userId) return;
  const path = `relocationPlans/${plan.userId}`;
  try {
    const ref = doc(db, 'relocationPlans', plan.userId);
    await setDoc(ref, {
      ...plan,
      createdAt: plan.createdAt || new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getRelocationPlan(userId: string): Promise<RelocationPlan | null> {
  const path = `relocationPlans/${userId}`;
  try {
    const ref = doc(db, 'relocationPlans', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as RelocationPlan;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// 4. Visas, Documents, Interviews, Emergency Contacts
export async function saveUserVisas(userId: string, visas: VisaRecord[]): Promise<void> {
  if (!userId) return;
  const path = `visaRecords/user_${userId}`;
  try {
    const ref = doc(db, 'visaRecords', `user_${userId}`);
    await setDoc(ref, {
      userId,
      records: visas,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserVisas(userId: string): Promise<VisaRecord[] | null> {
  const path = `visaRecords/user_${userId}`;
  try {
    const ref = doc(db, 'visaRecords', `user_${userId}`);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.records) {
      return snap.data().records as VisaRecord[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveUserDocuments(userId: string, docs: MobilityDocument[]): Promise<void> {
  if (!userId) return;
  const path = `documents/user_${userId}`;
  try {
    const ref = doc(db, 'documents', `user_${userId}`);
    await setDoc(ref, {
      userId,
      items: docs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserDocuments(userId: string): Promise<MobilityDocument[] | null> {
  const path = `documents/user_${userId}`;
  try {
    const ref = doc(db, 'documents', `user_${userId}`);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.items) {
      return snap.data().items as MobilityDocument[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveUserInterviews(userId: string, interviews: InterviewAppointment[]): Promise<void> {
  if (!userId) return;
  const path = `interviews/user_${userId}`;
  try {
    const ref = doc(db, 'interviews', `user_${userId}`);
    await setDoc(ref, {
      userId,
      appointments: interviews,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserInterviews(userId: string): Promise<InterviewAppointment[] | null> {
  const path = `interviews/user_${userId}`;
  try {
    const ref = doc(db, 'interviews', `user_${userId}`);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.appointments) {
      return snap.data().appointments as InterviewAppointment[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}
