import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { HandoverRecord, StickyNote } from './types';

const app = initializeApp(firebaseConfig);
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_SYNC_NUMBER = firebaseConfig.messagingSenderId || '435594027895';

// Mandatory connection validation on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logOutFirebase() {
  return signOut(auth);
}

// Helper to sanitize IDs to match ^[a-zA-Z0-9_\-]+$ and maxLength 128
export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  return cleaned || `doc_${Date.now()}`;
}

function truncateStr(val: string | undefined | null, maxLen: number): string {
  if (!val) return '';
  return String(val).slice(0, maxLen);
}

function sanitizeMapList<T extends object>(arr: T[] | undefined, maxItems: number): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, maxItems).map((item) => {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(item || {})) {
      if (v !== undefined) {
        cleanObj[k] = v;
      }
    }
    return cleanObj as T;
  });
}

function sanitizePlainObject<T extends object>(obj: T | undefined): Record<string, any> {
  const result: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return result;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        result[k] = sanitizeMapList(v, 50);
      } else {
        result[k] = v;
      }
    }
  }
  return result;
}

export async function saveUserSettingToCloud(
  uid: string,
  userName: string,
  facilityName: string,
  shiftName: string,
  existsInCloud: boolean
) {
  const safeUid = sanitizeDocId(uid);
  const path = `userSettings/${safeUid}`;
  const docRef = doc(db, 'userSettings', safeUid);
  try {
    if (existsInCloud) {
      await updateDoc(docRef, {
        userName: truncateStr(userName, 100),
        facilityName: truncateStr(facilityName, 120),
        shiftName: truncateStr(shiftName, 50),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ownerId: uid,
        userName: truncateStr(userName, 100),
        facilityName: truncateStr(facilityName, 120),
        shiftName: truncateStr(shiftName, 50),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsInCloud ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveResidentToCloud(uid: string, record: HandoverRecord, existsInCloud: boolean) {
  const safeResId = sanitizeDocId(record.id);
  const docId = `${sanitizeDocId(uid)}_${safeResId}`.slice(0, 120);
  const path = `residents/${docId}`;
  const docRef = doc(db, 'residents', docId);

  const basePayload = {
    bedNo: truncateStr(record.patientInfo.bedNo, 50),
    name: truncateStr(record.patientInfo.name, 100),
    lastUpdatedText: truncateStr(record.lastUpdated, 60),
    patientInfo: sanitizePlainObject(record.patientInfo),
    lines: sanitizePlainObject(record.lines),
    ltcCare: sanitizePlainObject(record.ltcCare || {}),
    labs: sanitizeMapList(record.labs, 50),
    opExams: sanitizeMapList(record.opExams, 50),
    udDrugs: sanitizeMapList(record.udDrugs, 50),
    vitalSigns: sanitizeMapList(record.vitalSigns, 50),
    consults: sanitizeMapList(record.consults, 50),
    wounds: sanitizeMapList(record.wounds, 50),
    bodyMarkers: sanitizeMapList(record.bodyMarkers, 50),
    stickyNotes: sanitizeMapList(record.stickyNotes || [], 50),
    todoItems: sanitizeMapList(record.todoItems || [], 100),
    receiveNote: truncateStr(record.receiveNote, 5000),
    handoverNoteISBAR: truncateStr(record.handoverNoteISBAR, 5000),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existsInCloud) {
      await updateDoc(docRef, basePayload);
    } else {
      await setDoc(docRef, {
        ...basePayload,
        ownerId: uid,
        residentId: safeResId,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsInCloud ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteResidentFromCloud(uid: string, residentId: string) {
  const safeResId = sanitizeDocId(residentId);
  const docId = `${sanitizeDocId(uid)}_${safeResId}`.slice(0, 120);
  const path = `residents/${docId}`;
  try {
    await deleteDoc(doc(db, 'residents', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveShiftNoteToCloud(uid: string, note: StickyNote, existsInCloud: boolean) {
  const safeNoteId = sanitizeDocId(note.id);
  const docId = `${sanitizeDocId(uid)}_${safeNoteId}`.slice(0, 120);
  const path = `shiftNotes/${docId}`;
  const docRef = doc(db, 'shiftNotes', docId);

  const basePayload = {
    title: truncateStr(note.title, 200),
    content: truncateStr(note.content, 2000),
    color: truncateStr(note.color, 20),
    tag: truncateStr(note.tag, 50),
    checklist: sanitizeMapList(note.checklist || [], 50),
    isPinned: Boolean(note.isPinned),
    timeLabel: truncateStr(note.updatedAt || note.createdAt, 50),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existsInCloud) {
      await updateDoc(docRef, basePayload);
    } else {
      await setDoc(docRef, {
        ...basePayload,
        ownerId: uid,
        noteId: safeNoteId,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existsInCloud ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteShiftNoteFromCloud(uid: string, noteId: string) {
  const safeNoteId = sanitizeDocId(noteId);
  const docId = `${sanitizeDocId(uid)}_${safeNoteId}`.slice(0, 120);
  const path = `shiftNotes/${docId}`;
  try {
    await deleteDoc(doc(db, 'shiftNotes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export { collection, query, where, onSnapshot, doc, getDocs };
