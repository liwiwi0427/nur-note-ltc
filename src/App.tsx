/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { HandoverRecord, StickyNote } from './types';
import { INITIAL_PATIENTS } from './data/mockPatients';
import { HeaderBar } from './components/HeaderBar';
import { HandoverSheet } from './components/HandoverSheet';
import { AiAssistantModal } from './components/AiAssistantModal';
import { CheerModal } from './components/CheerModal';
import { ChangelogModal } from './components/ChangelogModal';
import { StickyNotesModal } from './components/StickyNotesModal';
import { FloatingStickyButton } from './components/FloatingStickyButton';
import { TodoPrintModal, gatherAllTodoRows } from './components/TodoPrintModal';
import {
  auth,
  db,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  signInWithGoogle,
  logOutFirebase,
  saveUserSettingToCloud,
  saveResidentToCloud,
  deleteResidentFromCloud,
  saveShiftNoteToCloud,
  sanitizeDocId,
  handleFirestoreError,
  OperationType,
  FIREBASE_SYNC_NUMBER,
} from './firebase';
import {
  HeartHandshake,
  ClipboardList,
  UserCheck,
  CloudCheck,
  Accessibility,
  Eye,
} from 'lucide-react';

const STORAGE_KEY = 'ltc_nursing_home_patients_v4';
const GLOBAL_NOTES_KEY = 'ltc_nursing_home_global_notes_v2';
const USER_NAME_KEY = 'ltc_nursing_home_user_name_v1';
const FACILITY_NAME_KEY = 'ltc_nursing_home_facility_name_v1';
const SHIFT_NAME_KEY = 'ltc_nursing_home_shift_name_v1';

export default function App() {
  const [patients, setPatients] = useState<HandoverRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved residents:', e);
    }
    return INITIAL_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return patients[0]?.id || INITIAL_PATIENTS[0].id;
  });

  // User Name, Facility Name & Shift Name (Displayed in Print Header for Kardex & To-Do List)
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(USER_NAME_KEY) || '王小美 護理師';
  });
  const [facilityName, setFacilityName] = useState<string>(() => {
    return localStorage.getItem(FACILITY_NAME_KEY) || '松柏長照社團法人附設護理之家';
  });
  const [shiftName, setShiftName] = useState<string>(() => {
    return localStorage.getItem(SHIFT_NAME_KEY) || '白班 (08:00 - 16:00)';
  });

  // Global Shift Sticky Notes (Nursing Home Edition)
  const [globalStickyNotes, setGlobalStickyNotes] = useState<StickyNote[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load global sticky notes:', e);
    }
    return [
      {
        id: 'global-ltc-note-1',
        patientId: 'global',
        title: '機構班別交接與例行巡檢事項',
        content: '今日全機構長照交接重點：\n1. 10/08 家醫科王醫師機構巡診名單確認\n2. 核對本週到期之矽膠鼻胃管與導尿管耗材',
        color: 'yellow',
        tag: '交班提醒',
        checklist: [
          { id: 'item-1', text: '點交急救包、氧氣鋼瓶壓力與抽痰機功能', completed: true },
          { id: 'item-2', text: '確認全區住民今日解便紀錄（滿3日未解者評估給藥）', completed: false },
          { id: 'item-3', text: '睡前清點失智專區助聽器、活動假牙與防走失手環電量', completed: false },
        ],
        isPinned: true,
        createdAt: '08:00',
        updatedAt: '08:00',
      },
    ];
  });

  // Modals & View Modes
  const [stickyNotesModalOpen, setStickyNotesModalOpen] = useState(false);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [cheerModalOpen, setCheerModalOpen] = useState(false);
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);

  // Print Mode ('kardex' vs 'todo')
  const [printMode, setPrintMode] = useState<'kardex' | 'todo'>('kardex');
  const [todoPrintScope, setTodoPrintScope] = useState<'all' | 'current'>('all');
  const [todoPrintOnlyPending, setTodoPrintOnlyPending] = useState<boolean>(false);

  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalType, setAiModalType] = useState<'isbar' | 'audit'>('isbar');
  const [aiContent, setAiContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Firebase Auth & Sync State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Track which doc IDs already exist in Firestore to decide between create (setDoc) and update (updateDoc)
  const cloudResidentIdsRef = useRef<Set<string>>(new Set());
  const cloudShiftNoteIdsRef = useRef<Set<string>>(new Set());
  const cloudUserSettingExistsRef = useRef<boolean>(false);
  const isApplyingRemoteRef = useRef<boolean>(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save residents to localStorage:', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_NOTES_KEY, JSON.stringify(globalStickyNotes));
    } catch (e) {
      console.error('Failed to save global sticky notes:', e);
    }
  }, [globalStickyNotes]);

  useEffect(() => {
    localStorage.setItem(USER_NAME_KEY, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(FACILITY_NAME_KEY, facilityName);
  }, [facilityName]);

  useEffect(() => {
    localStorage.setItem(SHIFT_NAME_KEY, shiftName);
  }, [shiftName]);

  // Listen to Firebase Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (user?.displayName && (!userName || userName === '王小美 護理師')) {
        setUserName(user.displayName);
      }
    });
    return () => unsub();
  }, []);

  // Attach Firestore Real-Time Listeners when authenticated
  useEffect(() => {
    if (!isAuthReady || !firebaseUser) {
      cloudResidentIdsRef.current.clear();
      cloudShiftNoteIdsRef.current.clear();
      cloudUserSettingExistsRef.current = false;
      return;
    }

    const uid = firebaseUser.uid;
    const safeUid = sanitizeDocId(uid);

    // 1. UserSetting listener
    const userSettingRef = doc(db, 'userSettings', safeUid);
    const unsubUserSetting = onSnapshot(
      userSettingRef,
      (snap) => {
        cloudUserSettingExistsRef.current = snap.exists();
        if (snap.exists()) {
          const data = snap.data();
          isApplyingRemoteRef.current = true;
          if (data.userName) setUserName(data.userName);
          if (data.facilityName) setFacilityName(data.facilityName);
          if (data.shiftName) setShiftName(data.shiftName);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 50);
        } else {
          // Initialize user settings in cloud
          saveUserSettingToCloud(uid, userName, facilityName, shiftName, false).catch(console.error);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `userSettings/${safeUid}`)
    );

    // 2. Residents collection listener
    const residentsQuery = query(collection(db, 'residents'), where('ownerId', '==', uid));
    const unsubResidents = onSnapshot(
      residentsQuery,
      (snapshot) => {
        const nextCloudIds = new Set<string>();
        const loadedRecords: HandoverRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          nextCloudIds.add(d.residentId);
          loadedRecords.push({
            id: d.residentId,
            patientInfo: d.patientInfo,
            lines: d.lines,
            ltcCare: d.ltcCare,
            labs: d.labs || [],
            opExams: d.opExams || [],
            udDrugs: d.udDrugs || [],
            vitalSigns: d.vitalSigns || [],
            consults: d.consults || [],
            wounds: d.wounds || [],
            bodyMarkers: d.bodyMarkers || [],
            stickyNotes: d.stickyNotes || [],
            todoItems: d.todoItems || [],
            receiveNote: d.receiveNote || '',
            handoverNoteISBAR: d.handoverNoteISBAR || '',
            lastUpdated: d.lastUpdatedText || '',
          });
        });
        cloudResidentIdsRef.current = nextCloudIds;

        if (loadedRecords.length > 0) {
          isApplyingRemoteRef.current = true;
          loadedRecords.sort((a, b) => a.patientInfo.bedNo.localeCompare(b.patientInfo.bedNo));
          setPatients(loadedRecords);
          setLastCloudSyncTime(
            new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 50);
        } else {
          // Seed initial local residents to Firestore on first sign-in
          patients.forEach((p) => {
            saveResidentToCloud(uid, p, false).catch(console.error);
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'residents')
    );

    // 3. ShiftNotes collection listener
    const shiftNotesQuery = query(collection(db, 'shiftNotes'), where('ownerId', '==', uid));
    const unsubShiftNotes = onSnapshot(
      shiftNotesQuery,
      (snapshot) => {
        const nextNoteIds = new Set<string>();
        const loadedNotes: StickyNote[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          nextNoteIds.add(d.noteId);
          loadedNotes.push({
            id: d.noteId,
            patientId: 'global',
            title: d.title || '',
            content: d.content || '',
            color: (d.color || 'yellow') as any,
            tag: (d.tag || '交班提醒') as any,
            checklist: d.checklist || [],
            isPinned: Boolean(d.isPinned),
            createdAt: d.timeLabel || '08:00',
            updatedAt: d.timeLabel || '08:00',
          });
        });
        cloudShiftNoteIdsRef.current = nextNoteIds;

        if (loadedNotes.length > 0) {
          isApplyingRemoteRef.current = true;
          setGlobalStickyNotes(loadedNotes);
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 50);
        } else {
          globalStickyNotes.forEach((n) => {
            saveShiftNoteToCloud(uid, n, false).catch(console.error);
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'shiftNotes')
    );

    return () => {
      unsubUserSetting();
      unsubResidents();
      unsubShiftNotes();
    };
  }, [isAuthReady, firebaseUser]);

  // Sync User Settings changes to Cloud
  const handleUpdateUserSettings = (nextUser: string, nextFacility: string, nextShift: string) => {
    setUserName(nextUser);
    setFacilityName(nextFacility);
    setShiftName(nextShift);
    if (firebaseUser && !isApplyingRemoteRef.current) {
      saveUserSettingToCloud(
        firebaseUser.uid,
        nextUser,
        nextFacility,
        nextShift,
        cloudUserSettingExistsRef.current
      ).catch(console.error);
    }
  };

  // Manual Force Sync All to Firebase 435594027895
  const handleForceSyncNow = async () => {
    if (!firebaseUser) return;
    setIsCloudSyncing(true);
    try {
      const uid = firebaseUser.uid;
      await saveUserSettingToCloud(uid, userName, facilityName, shiftName, cloudUserSettingExistsRef.current);
      for (const p of patients) {
        const safeId = sanitizeDocId(p.id);
        await saveResidentToCloud(uid, p, cloudResidentIdsRef.current.has(safeId));
      }
      for (const n of globalStickyNotes) {
        const safeNoteId = sanitizeDocId(n.id);
        await saveShiftNoteToCloud(uid, n, cloudShiftNoteIdsRef.current.has(safeNoteId));
      }
      setLastCloudSyncTime(
        new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const handleUpdateActivePatient = (updated: HandoverRecord) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (firebaseUser && !isApplyingRemoteRef.current) {
      const safeId = sanitizeDocId(updated.id);
      saveResidentToCloud(firebaseUser.uid, updated, cloudResidentIdsRef.current.has(safeId)).catch(console.error);
    }
  };

  const handleUpdatePatientStickyNotes = (patientId: string, notes: StickyNote[]) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const updated = { ...p, stickyNotes: notes };
        if (firebaseUser && !isApplyingRemoteRef.current) {
          const safeId = sanitizeDocId(updated.id);
          saveResidentToCloud(firebaseUser.uid, updated, cloudResidentIdsRef.current.has(safeId)).catch(console.error);
        }
        return updated;
      })
    );
  };

  const handleUpdateGlobalNotes = (notes: StickyNote[]) => {
    setGlobalStickyNotes(notes);
    if (firebaseUser && !isApplyingRemoteRef.current) {
      notes.forEach((n) => {
        const safeNoteId = sanitizeDocId(n.id);
        saveShiftNoteToCloud(firebaseUser.uid, n, cloudShiftNoteIdsRef.current.has(safeNoteId)).catch(console.error);
      });
    }
  };

  const handleImportPatients = (imported: HandoverRecord[]) => {
    setPatients(imported);
    if (imported.length > 0) {
      setActivePatientId(imported[0].id);
    }
    if (firebaseUser) {
      imported.forEach((p) => {
        const safeId = sanitizeDocId(p.id);
        saveResidentToCloud(firebaseUser.uid, p, cloudResidentIdsRef.current.has(safeId)).catch(console.error);
      });
    }
  };

  const handleAddPatient = () => {
    const newBedNum = `A20${patients.length + 1}-1`;
    const nowStr =
      new Date().toLocaleDateString('zh-TW') +
      ' ' +
      new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    const newPatient: HandoverRecord = {
      id: `resident_${Date.now()}`,
      patientInfo: {
        bedNo: newBedNum,
        name: '新入住住民',
        chartNo: '',
        age: '80歲',
        admissionDate: new Date().toLocaleDateString('zh-TW'),
        gender: '男',
        dept: '松柏養護區 2F',
        doctor: '',
        coCare: '',
        diagnosis: '高血壓、退化性關節炎',
        diagnosisList: [
          {
            id: `diag-${Date.now()}`,
            hospital: '台大醫院',
            dept: '高齡醫學科',
            diagnosis: '原發性高血壓、雙膝退化性關節炎',
            doctor: '王仁德 醫師',
          },
        ],
        diet: '軟質飲食',
        allergy: 'NKDA (無已知藥物過敏)',
        fallRisk: '跌倒中風險 (25-44分)',
        bradenRisk: '壓傷輕度風險 (Braden 15-18分)',
        cmsLevel: 'CMS 第5級 · ADL 55-60分 (中度依賴)',
        dnrStatus: '家屬討論考慮中',
        hospitalPref: '',
        isIsolated: false,
        isolationType: '無須隔離 (一般照護)',
        isolationReason: '',
      },
      lines: {
        ng: '無',
        foley: '無',
        trEndo: '無',
        peg: '無',
        oxygen: '無',
        mobilityAid: '四腳拐杖 / 輪椅代步',
        prosthesis: '無',
      },
      ltcCare: {
        adlScore: '輪椅/助行器 · 可部分自理 · 自行進食',
        continence: '日間定時引導如廁 + 夜間復健褲',
        lastStoolDate: '今日已解軟便',
        turningSchedule: '可自行翻身 + 離床感應墊防跌 (無約束)',
        restraintNote: '入住適應中，情緒穩定',
        rehabActivity: '每日上午團體健康操',
        sleepMood: '入住適應中，情緒穩定',
        weightBmi: '55.0 kg · BMI 21.0',
      },
      labs: [{ id: `lab-${Date.now()}`, item: 'AC 血糖', value: '110 mg/dL', action: '正常範圍' }],
      opExams: [{ id: `op-${Date.now()}`, date: '本週', time: '09:30', content: '新入住初次綜合照護評估' }],
      udDrugs: [],
      vitalSigns: [
        {
          id: 'v1',
          time: '08:00',
          T: '36.5',
          P: '74',
          R: '16',
          BP: '126/76',
          SpO2: '98',
          GCS: 'E4V5M6',
          Pain: '0',
          action: '入住生命徵象穩定',
        },
      ],
      consults: [],
      wounds: [],
      bodyMarkers: [],
      todoItems: [
        {
          id: `todo-${Date.now()}`,
          category: '日常照護',
          content: '完成新入住 72 小時長照綜合評估、巴氏量表與跌倒壓傷評估',
          dueTime: '今日本班',
          priority: 'urgent',
          completed: false,
          assignedRole: '護理師',
        },
      ],
      receiveNote: '住民今日新入住機構，環境介紹完成，生命徵象平穩，家屬已交付慢箋藥袋。',
      handoverNoteISBAR: `【長照機構 ISBAR 交班摘要】
I (住民識別): ${newBedNum} 床，新入住住民，80歲，松柏養護區。
S (目前照護現況): 今日新入住，由口進食軟質餐，無侵入性三管留置。
B (長照背景與風險): 新入住環境適應期，預防跌倒為首要照護重點。
A (本班評估): 生命徵象正常，意識清醒，情緒穩定。
R (下班待辦與交接): 請持續協助熟悉機構作息並完成 72 小時入住護理評估。`,
      lastUpdated: nowStr,
    };

    setPatients((prev) => [...prev, newPatient]);
    setActivePatientId(newPatient.id);
    if (firebaseUser) {
      saveResidentToCloud(firebaseUser.uid, newPatient, false).catch(console.error);
    }
  };

  const handleDeletePatient = (id: string) => {
    if (patients.length <= 1) return;
    const remaining = patients.filter((p) => p.id !== id);
    setPatients(remaining);
    if (activePatientId === id) {
      setActivePatientId(remaining[0].id);
    }
    if (firebaseUser) {
      deleteResidentFromCloud(firebaseUser.uid, id).catch(console.error);
    }
  };

  const handleConfirmResetDemo = () => {
    setPatients(INITIAL_PATIENTS);
    setActivePatientId(INITIAL_PATIENTS[0].id);
    setResetConfirmOpen(false);
    if (firebaseUser) {
      INITIAL_PATIENTS.forEach((p) => {
        const safeId = sanitizeDocId(p.id);
        saveResidentToCloud(firebaseUser.uid, p, cloudResidentIdsRef.current.has(safeId)).catch(console.error);
      });
    }
  };

  // Print Resident Kardex A4
  const handlePrintKardex = () => {
    setPrintMode('kardex');
    setTimeout(() => {
      window.print();
    }, 80);
  };

  // Print To-Do List as PDF (via A4 Portrait Print Layout)
  const handlePrintTodoPdf = (scope: 'all' | 'current', onlyPending: boolean) => {
    setTodoPrintScope(scope);
    setTodoPrintOnlyPending(onlyPending);
    setPrintMode('todo');
    setTimeout(() => {
      window.print();
      // Restore printMode to kardex after print dialog closes
      setTimeout(() => {
        setPrintMode('kardex');
      }, 500);
    }, 100);
  };

  // AI ISBAR Handover Summary Call
  const handleTriggerAiIsbar = async () => {
    if (!activePatient) return;
    setIsAiLoading(true);
    setAiModalType('isbar');
    setAiModalTitle(`AI 長照 ISBAR 交班摘要 — 房床 [${activePatient.patientInfo.bedNo}]`);
    setAiContent('');
    setAiModalOpen(true);

    try {
      const res = await fetch('/api/ai/isbar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePatient),
      });

      if (!res.ok) {
        throw new Error('伺服器回應錯誤');
      }

      const data = await res.json();
      setAiContent(data.summary || '無法產生摘要');
    } catch (error: any) {
      console.error('AI Summary Error:', error);
      setAiContent(`無法連線至 AI 服務，請確認已設定 GEMINI_API_KEY。\n\n錯誤細節：${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Long-Term Care Clinical Audit Call
  const handleTriggerClinicalAudit = async () => {
    if (!activePatient) return;
    setIsAiLoading(true);
    setAiModalType('audit');
    setAiModalTitle(`AI 長照照護風險與品質稽核 — 房床 [${activePatient.patientInfo.bedNo}]`);
    setAiContent('');
    setAiModalOpen(true);

    try {
      const res = await fetch('/api/ai/clinical-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePatient),
      });

      if (!res.ok) {
        throw new Error('伺服器回應錯誤');
      }

      const data = await res.json();
      setAiContent(data.alerts || '尚無特殊風險提醒');
    } catch (error: any) {
      console.error('Clinical Check Error:', error);
      setAiContent(`無法連線至 AI 稽核服務，請確認環境設定。`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiIsbarToPatient = (newIsbarText: string) => {
    if (!activePatient) return;
    handleUpdateActivePatient({
      ...activePatient,
      handoverNoteISBAR: newIsbarText,
    });
  };

  // Facility Summary Metrics
  const totalResidents = patients.length;
  const tubeResidentsCount = patients.filter(
    (p) =>
      (p.lines.ng && p.lines.ng !== '無' && !p.lines.ng.startsWith('無')) ||
      (p.lines.foley && p.lines.foley !== '無' && !p.lines.foley.startsWith('無')) ||
      (p.lines.trEndo && p.lines.trEndo !== '無' && !p.lines.trEndo.startsWith('無'))
  ).length;
  const allPendingTodos = gatherAllTodoRows(patients, globalStickyNotes, 'all', activePatientId, true);

  // Rows for To-Do Print Sheet
  const printableTodoRows = gatherAllTodoRows(
    patients,
    globalStickyNotes,
    todoPrintScope,
    activePatientId,
    todoPrintOnlyPending
  );

  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);

  const handleSignInFirebase = async () => {
    setFirebaseAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Firebase Sign-In Error:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setFirebaseAuthError(
          `請先至 Firebase Console (kardex-ltc) -> Authentication -> Settings -> Authorized domains 新增目前網域：${window.location.hostname}`
        );
      } else if (code === 'auth/operation-not-allowed') {
        setFirebaseAuthError(
          '請先至 Firebase Console (kardex-ltc) -> Authentication -> Sign-in method 啟用「Google」登入提供者。'
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setFirebaseAuthError(`登入發生錯誤 (${code || err?.message || '未知錯誤'})`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans flex flex-col selection:bg-teal-200">
      {/* Header Navigation */}
      <HeaderBar
        patients={patients}
        activePatientId={activePatientId}
        onSelectPatient={(id) => setActivePatientId(id)}
        onAddPatient={handleAddPatient}
        onDeletePatient={handleDeletePatient}
        onResetDemo={() => setResetConfirmOpen(true)}
        onImportPatients={handleImportPatients}
        onTriggerAiIsbar={handleTriggerAiIsbar}
        onTriggerClinicalAudit={handleTriggerClinicalAudit}
        onOpenCheerModal={() => setCheerModalOpen(true)}
        onOpenChangelogModal={() => setChangelogModalOpen(true)}
        onOpenStickyNotesModal={() => setStickyNotesModalOpen(true)}
        onOpenTodoModal={() => setTodoModalOpen(true)}
        onPrintKardex={handlePrintKardex}
        isAiLoading={isAiLoading}
        isEmergencyMode={isEmergencyMode}
        onToggleEmergencyMode={() => setIsEmergencyMode((prev) => !prev)}
        userName={userName}
        onChangeUserName={(val) => handleUpdateUserSettings(val, facilityName, shiftName)}
        firebaseUserEmail={firebaseUser?.email}
        isCloudSyncing={isCloudSyncing}
        lastCloudSyncTime={lastCloudSyncTime}
        onSignInFirebase={handleSignInFirebase}
        onSignOutFirebase={() => logOutFirebase().catch(console.error)}
        onForceSyncNow={handleForceSyncNow}
      />

      {firebaseAuthError && (
        <div className="bg-amber-950 text-amber-100 border-b border-amber-700 px-4 py-2 text-xs flex items-center justify-between gap-3 print:hidden">
          <div>
            <strong className="text-amber-300 mr-1.5">Firebase (kardex-ltc / 435594027895) 登入提醒：</strong>
            <span>{firebaseAuthError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFirebaseAuthError(null)}
            className="px-2 py-0.5 bg-amber-800 hover:bg-amber-700 text-white rounded text-[11px] shrink-0"
          >
            關閉
          </button>
        </div>
      )}

      {/* Focus Handover Mode Banner */}
      {isEmergencyMode && (
        <div className="bg-teal-900 border-b border-teal-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 text-xs">
            <Eye className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>長照重點交班視圖已啟用：</strong>
              已精簡次要表格，專注呈現【住民識別與DNR】、【生命徵象趨勢圖】與【交班觀察及ISBAR摘要】。
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEmergencyMode(false)}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-lg transition-colors"
          >
            返回完整長照交班卡
          </button>
        </div>
      )}

      {/* Long-Term Care Facility Overview Bar (Screen Only) */}
      {!isEmergencyMode && (
        <div className="bg-stone-100 text-stone-700 text-xs px-4 py-2 border-b border-stone-200 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-semibold text-teal-950 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
                <span>{facilityName}</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="font-mono tabular-nums">
                收住床數：<strong className="text-stone-900">{totalResidents}</strong> 床
              </span>
              <span className="text-stone-300">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Accessibility className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  三管留置：<strong className="text-teal-900">{tubeResidentsCount}</strong> 床
                </span>
              </span>
              <span className="text-stone-300">·</span>
              <button
                type="button"
                onClick={() => setTodoModalOpen(true)}
                className="flex items-center gap-1 text-amber-900 hover:underline font-semibold"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
                <span>待執行 To-Do：{allPendingTodos.length} 項（點擊列印 PDF/DOC）</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  目前列印表頭姓名：<strong className="text-stone-800">{userName || '未設定'}</strong>
                </span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  Firebase {FIREBASE_SYNC_NUMBER}：{firebaseUser ? '雲端即時同步中' : '本機儲存（可點上方連結雲端）'}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Hidden when printing To-Do list */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 ${
          printMode === 'todo' ? 'print:hidden' : ''
        }`}
      >
        {activePatient ? (
          <HandoverSheet
            record={activePatient}
            onChange={handleUpdateActivePatient}
            onGenerateAiIsbar={handleTriggerAiIsbar}
            isAiGenerating={isAiLoading}
            isEmergencyMode={isEmergencyMode}
            onOpenStickyNotesModal={() => setStickyNotesModalOpen(true)}
            onOpenTodoModal={() => setTodoModalOpen(true)}
            userName={userName}
            facilityName={facilityName}
            shiftName={shiftName}
          />
        ) : (
          <div className="bg-white p-12 text-center rounded-xl shadow-xs border border-stone-200 my-8">
            <div className="text-stone-400 mb-3">尚未選擇或無住民床位紀錄</div>
            <button
              type="button"
              onClick={handleAddPatient}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg font-semibold text-sm"
            >
              新增第一位長照住民交班卡
            </button>
          </div>
        )}
      </main>

      {/* DEDICATED PRINT-ONLY TO-DO LIST SHEET (Visible when printMode === 'todo') */}
      {printMode === 'todo' && (
        <div className="hidden print:block w-full bg-white text-black p-4 font-sans">
          <div className="border-2 border-teal-900 p-4 mb-4 bg-stone-50">
            <div className="text-sm font-bold text-teal-900">{facilityName}</div>
            <h1 className="text-xl font-bold text-black mt-0.5">
              {todoPrintScope === 'current'
                ? `長照住民待辦事項清單 (To-Do List) — ${activePatient?.patientInfo.bedNo} ${
                    activePatient?.patientInfo.name || ''
                  }`
                : '全機構長照交班待辦事項總表 (Nursing Home To-Do List)'}
            </h1>
            <div className="mt-2 pt-2 border-t border-stone-400 flex flex-wrap items-center justify-between text-xs font-mono tabular-nums">
              <div>
                <span className="font-sans font-bold">製表／交班人員（使用者名稱）：</span>
                <strong className="font-sans text-sm underline ml-1">
                  {userName.trim() || '未填寫姓名'}
                </strong>
              </div>
              <div>
                <span className="font-sans font-bold">交班班別：</span>
                <span className="font-sans">{shiftName}</span>
              </div>
              <div>
                <span className="font-sans font-bold">列印時間：</span>
                <span>{new Date().toLocaleString('zh-TW')}</span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-stone-200 border-b border-black font-bold text-center">
                <th className="border-r border-black p-1.5 w-8">#</th>
                <th className="border-r border-black p-1.5 w-12">狀態</th>
                <th className="border-r border-black p-1.5 w-28">房床號 / 住民</th>
                <th className="border-r border-black p-1.5 w-24">照護分類</th>
                <th className="border-r border-black p-1.5 text-left">待辦照護事項內容 (To-Do Item)</th>
                <th className="border-r border-black p-1.5 w-20">預定時間</th>
                <th className="p-1.5 w-20">負責人員</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-400">
              {printableTodoRows.map((row, idx) => (
                <tr key={`${row.sourceType}_${row.id}`}>
                  <td className="border-r border-black p-1.5 text-center font-mono tabular-nums">{idx + 1}</td>
                  <td className="border-r border-black p-1.5 text-center text-base">
                    {row.completed ? '☑' : '☐'}
                  </td>
                  <td className="border-r border-black p-1.5 font-bold">
                    <div>{row.bedNo}</div>
                    <div className="font-normal text-[10px]">{row.residentName}</div>
                  </td>
                  <td className="border-r border-black p-1.5 text-center">{row.category}</td>
                  <td className={`border-r border-black p-1.5 ${row.completed ? 'line-through text-stone-500' : ''}`}>
                    {row.priority === 'urgent' && <strong className="text-red-700 mr-1">[急件]</strong>}
                    {row.content}
                  </td>
                  <td className="border-r border-black p-1.5 text-center font-mono tabular-nums">{row.dueTime}</td>
                  <td className="p-1.5 text-center">{row.assignedRole}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-3 border-t border-black text-xs">
            <div>
              <strong>製表／交班人員簽章：</strong> {userName.trim() || '_________________'}
            </div>
            <div>
              <strong>接班人員確認簽章：</strong> _________________
            </div>
            <div>
              <strong>護理長／督導核閱：</strong> _________________
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Demo Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs print:hidden">
          <div className="bg-white border border-stone-300 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">重設為長照機構預設住民資料？</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              這將會載入 3 位長照機構範例住民（含三管到期追蹤、巴氏量表 ADL、慢箋給藥與待辦事項），並覆蓋目前的變更。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDemo}
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
              >
                確定重設
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Notes Button */}
      <FloatingStickyButton
        onClick={() => setStickyNotesModalOpen(true)}
        totalNotesCount={
          patients.reduce((acc, p) => acc + (p.stickyNotes?.length || 0), 0) + globalStickyNotes.length
        }
        currentBedNotesCount={activePatient?.stickyNotes?.length || 0}
        bedNo={activePatient?.patientInfo.bedNo || '未指定'}
      />

      {/* To-Do List Print & Export Modal (PDF / DOC) */}
      <TodoPrintModal
        isOpen={todoModalOpen}
        onClose={() => setTodoModalOpen(false)}
        patients={patients}
        activePatientId={activePatientId}
        onUpdatePatient={handleUpdateActivePatient}
        globalNotes={globalStickyNotes}
        userName={userName}
        onChangeUserName={(val) => handleUpdateUserSettings(val, facilityName, shiftName)}
        facilityName={facilityName}
        onChangeFacilityName={(val) => handleUpdateUserSettings(userName, val, shiftName)}
        shiftName={shiftName}
        onChangeShiftName={(val) => handleUpdateUserSettings(userName, facilityName, val)}
        onPrintTodoPdf={handlePrintTodoPdf}
      />

      {/* Sticky Notes Modal */}
      <StickyNotesModal
        isOpen={stickyNotesModalOpen}
        onClose={() => setStickyNotesModalOpen(false)}
        patients={patients}
        activePatientId={activePatientId}
        onUpdatePatientStickyNotes={handleUpdatePatientStickyNotes}
        globalNotes={globalStickyNotes}
        onUpdateGlobalNotes={handleUpdateGlobalNotes}
      />

      {/* AI Assistant Output Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={aiModalTitle}
        type={aiModalType}
        content={aiContent}
        onApplyToSheet={handleApplyAiIsbarToPatient}
      />

      {/* Cheer Modal */}
      <CheerModal isOpen={cheerModalOpen} onClose={() => setCheerModalOpen(false)} />

      {/* Changelog Modal */}
      <ChangelogModal isOpen={changelogModalOpen} onClose={() => setChangelogModalOpen(false)} />
    </div>
  );
}
