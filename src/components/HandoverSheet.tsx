import React, { useState } from 'react';
import {
  HandoverRecord,
  DiagnosisItem,
  LabItem,
  OpExamItem,
  VitalSignColumn,
  UdDrugItem,
  WoundRecord,
  LtcCareAssessment,
  TodoItem,
  TodoCategory,
} from '../types';
import { InteractiveBodyDiagram } from './InteractiveBodyDiagram';
import { VitalSignsChart } from './VitalSignsChart';
import { VitalStandardsModal } from './VitalStandardsModal';
import { LabStandardsModal } from './LabStandardsModal';
import { PatientStickyNotesWidget } from './PatientStickyNotesWidget';
import { checkAbnormalAlertStatus } from '../utils/clinicalAlerts';
import {
  isTempAbnormal,
  isPulseAbnormal,
  isRespAbnormal,
  isBpAbnormal,
  isSpo2Abnormal,
  isPainAbnormal,
  isGcsAbnormal,
} from '../utils/vitalSignRanges';
import {
  Plus,
  AlertCircle,
  FileText,
  Activity,
  Clock,
  BookOpen,
  ClipboardList,
  CheckSquare,
  Square,
  Trash2,
  UserCheck,
  HeartHandshake,
  Sparkles,
  CalendarClock,
  Pill,
  Accessibility,
  Stethoscope,
} from 'lucide-react';

interface Props {
  record: HandoverRecord;
  onChange: (updated: HandoverRecord) => void;
  onGenerateAiIsbar?: () => void;
  isAiGenerating?: boolean;
  isEmergencyMode?: boolean;
  onOpenStickyNotesModal?: () => void;
  onOpenTodoModal?: () => void;
  userName: string;
  facilityName: string;
  shiftName: string;
}

const DEFAULT_LTC_CARE: LtcCareAssessment = {
  adlScore: '完全臥床/輪椅 · 移位需雙人協助 · 管灌飲食',
  continence: '全日包尿布 (Q3H 定時更換)',
  lastStoolDate: '今日已解軟便',
  turningSchedule: 'Q2H 翻身拍背 + 減壓氣墊床 (無約束)',
  restraintNote: '',
  rehabActivity: '',
  sleepMood: '',
  weightBmi: '',
};

const CMS_ADL_OPTIONS = [
  'CMS 第8級 · ADL 0-15分 (極重度依賴)',
  'CMS 第7級 · ADL 20-30分 (完全/重度依賴)',
  'CMS 第6級 · ADL 35-50分 (重度依賴)',
  'CMS 第5級 · ADL 55-60分 (中度依賴)',
  'CMS 第4級 · ADL 65-75分 (中輕度依賴)',
  'CMS 第3級 · ADL 80-85分 (輕度依賴)',
  'CMS 第2級 · ADL 90-95分 (輕微依賴)',
  'CMS 第1級 · ADL 100分 (完全獨立)',
];

const DNR_OPTIONS = [
  '已簽署 DNR (不施行心肺復甦術)',
  '已簽署 DNR + AD (預立醫療決定)',
  '全急救 (未簽署 DNR)',
  '家屬討論考慮中',
  '其他 / 待確認',
];

const FALL_RISK_OPTIONS = [
  '跌倒高風險 (≥45分)',
  '跌倒中風險 (25-44分)',
  '跌倒低風險 (<25分)',
];

const BRADEN_RISK_OPTIONS = [
  '壓傷極高風險 (Braden ≤9分)',
  '壓傷高風險 (Braden 10-12分)',
  '壓傷中度風險 (Braden 13-14分)',
  '壓傷輕度風險 (Braden 15-18分)',
  '無壓傷風險 (Braden 19-23分)',
];

const INFECTION_CONTROL_OPTIONS = [
  '無須隔離 (一般照護)',
  '接觸防護 (Contact)',
  '飛沫防護 (Droplet)',
  '接觸與飛沫防護',
  '空氣防護 (Airborne)',
  '呼吸道/發燒症狀監測',
  '疥瘡/皮膚接觸防護觀察',
];

const ADL_MOBILITY_OPTIONS = [
  '完全臥床/輪椅 · 移位需雙人協助 · 管灌飲食',
  '輪椅代步 · 移位需單人協助 · 由口餵食',
  '輪椅/助行器 · 可部分自理 · 自行進食',
  '可持助行器行走 · 日常生活大致自理',
  '完全獨立自理',
];

const CONTINENCE_OPTIONS = [
  '全日包尿布 (Q3H 定時更換)',
  '留置導尿管 (Foley 照護) + 大便用尿布',
  '日間定時引導如廁 + 夜間復健褲',
  '使用尿套/尿壺 + 尿布輔助',
  '大小便完全自理',
];

const STOOL_STATUS_OPTIONS = [
  '今日已解軟便',
  '昨日已解便 (正常)',
  '已2日未解便 (觀察中)',
  '≥3日未解便 (需評估給藥/通便)',
  '軟便劑規律服用中',
  '腹瀉/稀便觀察中',
];

const TURNING_RESTRAINT_OPTIONS = [
  'Q2H 翻身拍背 + 減壓氣墊床 (無約束)',
  'Q2H 翻身拍背 + 氣墊床 + 預防性手套(防拔管)',
  'Q2H 翻身拍背 + 30度側臥枕減壓',
  '可自行翻身 + 離床感應墊防跌 (無約束)',
  '可自行翻身活動 (一般床墊)',
];

export const HandoverSheet: React.FC<Props> = ({
  record,
  onChange,
  onGenerateAiIsbar,
  isAiGenerating = false,
  isEmergencyMode = false,
  onOpenStickyNotesModal,
  onOpenTodoModal,
  userName,
  facilityName,
  shiftName,
}) => {
  const [isStandardsModalOpen, setIsStandardsModalOpen] = useState(false);
  const [isLabStandardsModalOpen, setIsLabStandardsModalOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState<TodoCategory>('日常照護');
  const [newTodoTime, setNewTodoTime] = useState('14:00');

  const touchLastUpdated = () =>
    new Date().toLocaleDateString('zh-TW') +
    ' ' +
    new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

  const updatePatientInfo = (field: keyof HandoverRecord['patientInfo'], val: any) => {
    onChange({
      ...record,
      patientInfo: {
        ...record.patientInfo,
        [field]: val,
      },
      lastUpdated: touchLastUpdated(),
    });
  };

  // Multi-Diagnosis Table Helpers: (醫院)(科別)(診斷)(醫師)
  const diagnosisRows: DiagnosisItem[] =
    record.patientInfo.diagnosisList && record.patientInfo.diagnosisList.length > 0
      ? record.patientInfo.diagnosisList
      : [
          {
            id: 'diag-default-1',
            hospital: record.patientInfo.hospitalPref || '合約醫院',
            dept: '高齡醫學/內科',
            diagnosis: record.patientInfo.diagnosis || '',
            doctor: record.patientInfo.doctor || '',
          },
        ];

  const syncDiagnosisList = (nextList: DiagnosisItem[]) => {
    const summaryText = nextList
      .map((d) => d.diagnosis.trim())
      .filter(Boolean)
      .join('、');
    onChange({
      ...record,
      patientInfo: {
        ...record.patientInfo,
        diagnosisList: nextList,
        diagnosis: summaryText || record.patientInfo.diagnosis,
      },
      lastUpdated: touchLastUpdated(),
    });
  };

  const handleDiagnosisRowChange = (id: string, field: keyof DiagnosisItem, val: string) => {
    const updated = diagnosisRows.map((row) => (row.id === id ? { ...row, [field]: val } : row));
    syncDiagnosisList(updated);
  };

  const addDiagnosisRow = () => {
    const newRow: DiagnosisItem = {
      id: `diag-${Date.now()}`,
      hospital: '',
      dept: '',
      diagnosis: '',
      doctor: '',
    };
    syncDiagnosisList([...diagnosisRows, newRow]);
  };

  const removeDiagnosisRow = (id: string) => {
    if (diagnosisRows.length <= 1) {
      syncDiagnosisList([{ id: `diag-${Date.now()}`, hospital: '', dept: '', diagnosis: '', doctor: '' }]);
      return;
    }
    syncDiagnosisList(diagnosisRows.filter((r) => r.id !== id));
  };

  // Single-Cell Infection Control Helper
  const handleInfectionSelectChange = (val: string) => {
    const isolated = val !== '無須隔離 (一般照護)' && val !== '';
    onChange({
      ...record,
      patientInfo: {
        ...record.patientInfo,
        isIsolated: isolated,
        isolationType: val,
      },
      lastUpdated: touchLastUpdated(),
    });
  };

  const updateLines = (field: keyof HandoverRecord['lines'], val: string) => {
    onChange({
      ...record,
      lines: {
        ...record.lines,
        [field]: val,
      },
      lastUpdated: touchLastUpdated(),
    });
  };

  const updateLtcCare = (field: keyof LtcCareAssessment, val: string) => {
    const currentLtc = record.ltcCare || DEFAULT_LTC_CARE;
    onChange({
      ...record,
      ltcCare: {
        ...currentLtc,
        [field]: val,
      },
      lastUpdated: touchLastUpdated(),
    });
  };

  // Lab / Blood Sugar helpers
  const handleLabChange = (id: string, field: keyof LabItem, val: string) => {
    const updated = record.labs.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    onChange({ ...record, labs: updated, lastUpdated: touchLastUpdated() });
  };

  const addLabRow = () => {
    const newLab: LabItem = { id: `lab-${Date.now()}`, item: '', value: '', action: '' };
    onChange({ ...record, labs: [...record.labs, newLab], lastUpdated: touchLastUpdated() });
  };

  const removeLabRow = (id: string) => {
    onChange({ ...record, labs: record.labs.filter((l) => l.id !== id), lastUpdated: touchLastUpdated() });
  };

  // Clinic Visit / Tube Change Schedule helpers
  const handleOpExamChange = (id: string, field: keyof OpExamItem, val: string) => {
    const updated = record.opExams.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    onChange({ ...record, opExams: updated, lastUpdated: touchLastUpdated() });
  };

  const addOpExamRow = () => {
    const newOp: OpExamItem = { id: `op-${Date.now()}`, date: '', time: '', content: '' };
    onChange({ ...record, opExams: [...record.opExams, newOp], lastUpdated: touchLastUpdated() });
  };

  const removeOpExamRow = (id: string) => {
    onChange({ ...record, opExams: record.opExams.filter((o) => o.id !== id), lastUpdated: touchLastUpdated() });
  };

  // Vital sign helpers
  const handleVitalChange = (id: string, field: keyof VitalSignColumn, val: string) => {
    const updated = record.vitalSigns.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    onChange({ ...record, vitalSigns: updated, lastUpdated: touchLastUpdated() });
  };

  const addVitalColumn = () => {
    let nextTime = '08:00';
    if (record.vitalSigns.length > 0) {
      const lastTimeStr = record.vitalSigns[record.vitalSigns.length - 1].time;
      if (lastTimeStr && lastTimeStr.includes(':')) {
        const parts = lastTimeStr.split(':');
        const h = parseInt(parts[0], 10);
        if (!isNaN(h)) {
          const nextH = (h + 6) % 24;
          nextTime = `${nextH.toString().padStart(2, '0')}:00`;
        }
      }
    }
    const newVital: VitalSignColumn = {
      id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: nextTime,
      T: '',
      P: '',
      R: '',
      BP: '',
      SpO2: '',
      GCS: '',
      Pain: '',
    };
    onChange({ ...record, vitalSigns: [...record.vitalSigns, newVital], lastUpdated: touchLastUpdated() });
  };

  const loadPresetDaily3 = () => {
    const shiftTimes = ['08:00', '14:00', '20:00'];
    const newVitals: VitalSignColumn[] = shiftTimes.map((time, idx) => {
      const existing = record.vitalSigns[idx];
      return {
        id: existing ? existing.id : `v-shift-${time}-${Date.now()}`,
        time,
        T: existing?.T || '',
        P: existing?.P || '',
        R: existing?.R || '',
        BP: existing?.BP || '',
        SpO2: existing?.SpO2 || '',
        GCS: existing?.GCS || '',
        Pain: existing?.Pain || '',
        action: existing?.action || '',
      };
    });
    onChange({ ...record, vitalSigns: newVitals, lastUpdated: touchLastUpdated() });
  };

  const loadPresetQ4h = () => {
    const q4hTimes = ['01:00', '05:00', '09:00', '13:00', '17:00', '21:00'];
    const newVitals: VitalSignColumn[] = q4hTimes.map((time, idx) => {
      const existing = record.vitalSigns[idx];
      return {
        id: existing ? existing.id : `v-q4h-${time}-${Date.now()}`,
        time,
        T: existing?.T || '',
        P: existing?.P || '',
        R: existing?.R || '',
        BP: existing?.BP || '',
        SpO2: existing?.SpO2 || '',
        GCS: existing?.GCS || '',
        Pain: existing?.Pain || '',
        action: existing?.action || '',
      };
    });
    onChange({ ...record, vitalSigns: newVitals, lastUpdated: touchLastUpdated() });
  };

  const removeVitalColumn = (id: string) => {
    onChange({ ...record, vitalSigns: record.vitalSigns.filter((v) => v.id !== id), lastUpdated: touchLastUpdated() });
  };

  // Chronic Medication helpers
  const handleUdDrugChange = (id: string, field: keyof UdDrugItem, val: string) => {
    const updated = record.udDrugs.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    onChange({ ...record, udDrugs: updated, lastUpdated: touchLastUpdated() });
  };

  const addUdDrugRow = () => {
    const newDrug: UdDrugItem = {
      id: `drug-${Date.now()}`,
      drugName: '',
      route: 'PO 口服',
      schedule: 'QD 09:00',
      note: '',
    };
    onChange({ ...record, udDrugs: [...record.udDrugs, newDrug], lastUpdated: touchLastUpdated() });
  };

  const removeUdDrugRow = (id: string) => {
    onChange({ ...record, udDrugs: record.udDrugs.filter((d) => d.id !== id), lastUpdated: touchLastUpdated() });
  };

  // Wound & Skin Care helpers
  const handleWoundChange = (index: number, field: keyof WoundRecord, val: string) => {
    const updated = [...record.wounds];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...record, wounds: updated, lastUpdated: touchLastUpdated() });
  };

  const addWoundRow = () => {
    onChange({ ...record, wounds: [...record.wounds, { site: '', description: '' }], lastUpdated: touchLastUpdated() });
  };

  const removeWoundRow = (index: number) => {
    onChange({
      ...record,
      wounds: record.wounds.filter((_, i) => i !== index),
      lastUpdated: touchLastUpdated(),
    });
  };

  // Resident To-Do List helpers
  const handleAddInlineTodo = () => {
    if (!newTodoText.trim()) return;
    const item: TodoItem = {
      id: `todo-${Date.now()}`,
      category: newTodoCategory,
      content: newTodoText.trim(),
      dueTime: newTodoTime.trim() || '本班',
      priority: 'normal',
      completed: false,
      assignedRole: '護理師',
    };
    onChange({
      ...record,
      todoItems: [...(record.todoItems || []), item],
      lastUpdated: touchLastUpdated(),
    });
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    const updated = (record.todoItems || []).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onChange({ ...record, todoItems: updated, lastUpdated: touchLastUpdated() });
  };

  const handleDeleteTodo = (id: string) => {
    const updated = (record.todoItems || []).filter((t) => t.id !== id);
    onChange({ ...record, todoItems: updated, lastUpdated: touchLastUpdated() });
  };

  const info = record.patientInfo;
  const ltc = record.ltcCare || DEFAULT_LTC_CARE;
  const todos = record.todoItems || [];
  const alertStatus = checkAbnormalAlertStatus(record);

  // Ensure current dropdown values appear even if legacy custom text exists
  const ensureOption = (options: string[], currentVal?: string) => {
    if (!currentVal || currentVal.trim() === '') return options;
    return options.includes(currentVal) ? options : [currentVal, ...options];
  };

  // ================= FOCUS HANDOVER VIEW (重點交班精簡視圖) =================
  if (isEmergencyMode) {
    return (
      <div className="w-full bg-[#FAF8F5] text-stone-900 p-5 rounded-2xl shadow-lg border-2 border-teal-800 space-y-5">
        <div className="bg-teal-900 text-white rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="px-3.5 py-2 bg-amber-400 text-stone-950 rounded-xl font-mono font-bold text-xl tabular-nums shadow-xs">
              {info.bedNo || '無床號'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <h2 className="text-xl font-bold text-white">{info.name || '未填寫姓名'}</h2>
                <span className="text-teal-200">·</span>
                <span className="text-teal-100">{info.gender} · {info.age}</span>
                {info.cmsLevel && (
                  <>
                    <span className="text-teal-200">·</span>
                    <span className="text-amber-300 font-semibold">{info.cmsLevel}</span>
                  </>
                )}
                {info.dnrStatus && (
                  <>
                    <span className="text-teal-200">·</span>
                    <span className="text-emerald-300 font-semibold">{info.dnrStatus}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-teal-100 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>專區：{info.dept || '未指定'}</span>
                <span>診斷：<strong className="text-white">{info.diagnosis || '無特記'}</strong></span>
                <span>排便紀錄：<strong className="text-amber-300">{ltc.lastStoolDate || '未記錄'}</strong></span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs bg-teal-950/80 px-3.5 py-2 rounded-lg border border-teal-700">
            <div className="text-amber-300 font-bold">長照重點交班視圖</div>
            <div className="text-teal-200 text-[11px]">交班人員：{userName || '未填寫'} · {shiftName}</div>
          </div>
        </div>

        <div className="bg-white border border-stone-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>生命徵象與趨勢監測 (Vital Signs)</span>
            </h3>
            <button
              type="button"
              onClick={addVitalColumn}
              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增時段</span>
            </button>
          </div>

          <VitalSignsChart
            vitalSigns={record.vitalSigns}
            bedNo={record.patientInfo.bedNo}
            patientName={record.patientInfo.name}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-300 rounded-xl p-4 space-y-2">
            <div className="font-bold text-sm text-teal-950 border-b border-stone-200 pb-1.5 flex items-center justify-between">
              <span>本班照護觀察與待辦事項</span>
              {onOpenTodoModal && (
                <button
                  type="button"
                  onClick={onOpenTodoModal}
                  className="text-xs text-teal-700 hover:underline font-semibold"
                >
                  列印待辦清單 (PDF/DOC)
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={record.receiveNote || ''}
              onChange={(e) => onChange({ ...record, receiveNote: e.target.value, lastUpdated: touchLastUpdated() })}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 text-xs focus:outline-none focus:border-teal-700"
              placeholder="請輸入本班進食、排泄、情緒與特殊照護觀察..."
            />
          </div>

          <div className="bg-white border border-stone-300 rounded-xl p-4 space-y-2">
            <div className="font-bold text-sm text-teal-950 border-b border-stone-200 pb-1.5 flex items-center justify-between">
              <span>長照 ISBAR 結構化交班摘要</span>
              {onGenerateAiIsbar && (
                <button
                  type="button"
                  onClick={onGenerateAiIsbar}
                  disabled={isAiGenerating}
                  className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  {isAiGenerating ? 'AI 整理中...' : 'AI 產生摘要'}
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={record.handoverNoteISBAR || ''}
              onChange={(e) =>
                onChange({ ...record, handoverNoteISBAR: e.target.value, lastUpdated: touchLastUpdated() })
              }
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-teal-700"
            />
          </div>
        </div>
      </div>
    );
  }

  // ================= FULL LONG-TERM CARE KARDEX SHEET =================
  return (
    <div className="w-full bg-white text-stone-900 p-4 sm:p-5 rounded-2xl shadow-xs border border-stone-300 print:p-0 print:shadow-none print:border-none">
      {/* PRINT & SCREEN DOCUMENT HEADER WITH USER NAME */}
      <div className="mb-3 pb-2.5 border-b-2 border-teal-900 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-teal-800 tracking-wide">
            {facilityName || '松柏長照社團法人附設護理之家'} · 長期照顧機構照護紀錄
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>住民個人照護與護理交班卡</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-700 font-mono tabular-nums bg-teal-50/70 px-3 py-1.5 rounded-lg border border-teal-200 print:bg-transparent print:border-black">
          <div className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-teal-800 print:hidden" />
            <span className="font-sans font-semibold text-stone-700">交班/列印人員（使用者名稱）：</span>
            <strong className="font-sans text-teal-950 font-bold underline decoration-teal-700">
              {userName.trim() || '未填寫（請於上方輸入）'}
            </strong>
          </div>
          <span>·</span>
          <div>
            <span className="font-sans text-stone-600">班別：</span>
            <strong className="font-sans text-stone-900">{shiftName}</strong>
          </div>
          <span>·</span>
          <div>
            <span className="font-sans text-stone-600">更新：</span>
            <span>{record.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Abnormal Alert Banner */}
      {alertStatus.hasAbnormalUnaddressed && (
        <div className="mb-3 p-3 bg-red-50 border border-red-400 rounded-xl text-red-900 text-xs flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              照護異常提醒：本住民共有 {alertStatus.totalUnaddressedCount} 項異常數據尚未填寫處置紀錄（請於下方紅框欄位補充）
            </span>
          </div>
        </div>
      )}

      {/* MAIN KARDEX STRUCTURED TABLE */}
      <div className="border-2 border-stone-800 divide-y-2 divide-stone-800 text-xs">
        {/* ================= SECTION 1: 住民基本識別 (已移除住民編號、巡診醫師、緊急聯絡人、指定後送醫院) ================= */}
        <div className="grid grid-cols-12 divide-x divide-stone-400 bg-teal-950/5">
          <div className="col-span-2 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-teal-950 whitespace-nowrap">房床號</span>
            <input
              type="text"
              value={info.bedNo}
              onChange={(e) => updatePatientInfo('bedNo', e.target.value)}
              className="w-full font-mono tabular-nums font-bold text-base text-teal-900 px-1 border-b border-dashed border-stone-400 focus:outline-none focus:border-teal-700 bg-transparent"
              placeholder="房床號"
            />
          </div>

          <div className="col-span-2 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-stone-900 whitespace-nowrap">姓名</span>
            <input
              type="text"
              value={info.name || ''}
              onChange={(e) => updatePatientInfo('name', e.target.value)}
              className="w-full font-bold text-sm text-stone-900 px-1 border-b border-dashed border-stone-400 focus:outline-none bg-transparent"
              placeholder="住民姓名"
            />
          </div>

          <div className="col-span-1 p-1.5 flex items-center gap-1">
            <span className="font-bold text-stone-900 whitespace-nowrap">性別</span>
            <select
              value={info.gender}
              onChange={(e) => updatePatientInfo('gender', e.target.value as any)}
              className="w-full bg-transparent font-medium border-b border-dashed border-stone-400 focus:outline-none"
            >
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div className="col-span-2 p-1.5 flex items-center gap-1">
            <span className="font-bold text-stone-900 whitespace-nowrap">年齡</span>
            <input
              type="text"
              value={info.age || ''}
              onChange={(e) => updatePatientInfo('age', e.target.value)}
              className="w-full font-mono tabular-nums font-medium px-1 border-b border-dashed border-stone-400 focus:outline-none bg-transparent text-center"
              placeholder="如: 84歲"
            />
          </div>

          <div className="col-span-2 p-1.5 flex items-center gap-1">
            <span className="font-bold text-stone-800 whitespace-nowrap text-[11px]">入住日期</span>
            <input
              type="text"
              value={info.admissionDate || ''}
              onChange={(e) => updatePatientInfo('admissionDate', e.target.value)}
              className="w-full font-mono tabular-nums font-medium px-1 border-b border-dashed border-stone-400 focus:outline-none bg-transparent"
              placeholder="YYYY/MM/DD"
            />
          </div>

          <div className="col-span-3 p-1.5 flex items-center gap-1">
            <span className="font-bold text-teal-950 whitespace-nowrap text-[11px]">照護專區</span>
            <input
              type="text"
              value={info.dept}
              onChange={(e) => updatePatientInfo('dept', e.target.value)}
              className="w-full font-semibold text-teal-900 px-1 border-b border-dashed border-stone-400 focus:outline-none bg-transparent"
              placeholder="如：松柏養護區 2F"
            />
          </div>
        </div>

        {/* ================= SECTION 2: 下拉式選單列 (長照等級/ADL · DNR/預立醫療 · 跌倒與Braden · 感控防護監測單一格) ================= */}
        <div className="grid grid-cols-12 divide-x divide-stone-400 bg-white">
          {/* 長照等級/ADL 下拉式選單 */}
          <div className="col-span-3 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-teal-900 whitespace-nowrap text-[11px]">長照等級/ADL</span>
            <select
              value={info.cmsLevel || CMS_ADL_OPTIONS[1]}
              onChange={(e) => updatePatientInfo('cmsLevel', e.target.value)}
              className="w-full font-semibold text-teal-950 bg-stone-50 border border-stone-300 rounded px-1.5 py-1 focus:outline-none focus:border-teal-700 text-[11px]"
            >
              {ensureOption(CMS_ADL_OPTIONS, info.cmsLevel).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* DNR/預立醫療 下拉式選單 */}
          <div className="col-span-3 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-amber-900 whitespace-nowrap text-[11px]">DNR/預立醫療</span>
            <select
              value={info.dnrStatus || DNR_OPTIONS[0]}
              onChange={(e) => updatePatientInfo('dnrStatus', e.target.value)}
              className="w-full font-semibold text-amber-950 bg-stone-50 border border-stone-300 rounded px-1.5 py-1 focus:outline-none focus:border-teal-700 text-[11px]"
            >
              {ensureOption(DNR_OPTIONS, info.dnrStatus).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* 跌倒與 Braden 下拉式選單 */}
          <div className="col-span-3 p-1.5 flex items-center gap-1">
            <span className="font-bold text-purple-950 whitespace-nowrap text-[11px]">跌倒/Braden</span>
            <div className="flex items-center gap-1 w-full">
              <select
                value={info.fallRisk || FALL_RISK_OPTIONS[0]}
                onChange={(e) => updatePatientInfo('fallRisk', e.target.value)}
                className="w-1/2 font-semibold text-stone-900 bg-stone-50 border border-stone-300 rounded px-1 py-1 focus:outline-none focus:border-teal-700 text-[10.5px]"
                title="跌倒風險評估"
              >
                {ensureOption(FALL_RISK_OPTIONS, info.fallRisk).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                value={info.bradenRisk || BRADEN_RISK_OPTIONS[1]}
                onChange={(e) => updatePatientInfo('bradenRisk', e.target.value)}
                className="w-1/2 font-semibold text-stone-900 bg-stone-50 border border-stone-300 rounded px-1 py-1 focus:outline-none focus:border-teal-700 text-[10.5px]"
                title="Braden 壓傷風險評估"
              >
                {ensureOption(BRADEN_RISK_OPTIONS, info.bradenRisk).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 感控防護監測 (改為一格) */}
          <div
            className={`col-span-3 p-1.5 flex items-center gap-1.5 ${
              info.isIsolated ? 'bg-amber-100/80' : 'bg-white'
            }`}
          >
            <span className="font-bold text-stone-800 whitespace-nowrap text-[11px]">感控防護監測</span>
            <select
              value={info.isolationType || INFECTION_CONTROL_OPTIONS[0]}
              onChange={(e) => handleInfectionSelectChange(e.target.value)}
              className={`w-full font-semibold rounded px-1.5 py-1 border focus:outline-none text-[11px] ${
                info.isIsolated
                  ? 'bg-amber-200 border-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-50 border-stone-300 text-stone-700'
              }`}
            >
              {ensureOption(INFECTION_CONTROL_OPTIONS, info.isolationType).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= SECTION 3: 飲食型態 & 過敏史 ================= */}
        <div className="grid grid-cols-12 divide-x divide-stone-400 bg-stone-50/60">
          <div className="col-span-7 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-teal-950 whitespace-nowrap text-[11px]">飲食與吞嚥型態</span>
            <input
              type="text"
              value={info.diet || ''}
              onChange={(e) => updatePatientInfo('diet', e.target.value)}
              className="w-full font-medium text-stone-900 px-1.5 border-b border-dashed border-stone-300 focus:outline-none bg-transparent"
              placeholder="如：細碎餐+增稠劑 / 鼻胃管灌食配方 1500kcal/日"
            />
          </div>

          <div className="col-span-5 p-1.5 flex items-center gap-1.5">
            <span className="font-bold text-red-800 whitespace-nowrap text-[11px]">藥物與食物過敏史</span>
            <input
              type="text"
              value={info.allergy || ''}
              onChange={(e) => updatePatientInfo('allergy', e.target.value)}
              className="w-full font-semibold text-red-700 px-1.5 border-b border-dashed border-stone-300 focus:outline-none bg-transparent"
              placeholder="如：NKDA / Penicillin / NSAIDs"
            />
          </div>
        </div>

        {/* ================= SECTION 4: 表格式診斷（醫院）（科別）（診斷）（醫師）可新增多筆 ================= */}
        <div className="p-2 bg-white">
          <div className="flex items-center justify-between border-b border-stone-300 pb-1 mb-1.5">
            <span className="font-bold text-teal-950 flex items-center gap-1.5 text-xs sm:text-sm">
              <Stethoscope className="w-4 h-4 text-teal-800" />
              <span>診斷與就醫紀錄表（可新增多個診斷）</span>
            </span>
            <button
              type="button"
              onClick={addDiagnosisRow}
              className="px-2.5 py-0.5 text-[11px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-md font-semibold flex items-center gap-1 print:hidden transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增診斷</span>
            </button>
          </div>

          <table className="w-full border-collapse border border-stone-400 text-[11px]">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-400 text-center font-bold text-stone-800">
                <th className="border-r border-stone-400 p-1 w-[22%]">（醫院）</th>
                <th className="border-r border-stone-400 p-1 w-[18%]">（科別）</th>
                <th className="border-r border-stone-400 p-1 w-[40%]">（診斷）</th>
                <th className="p-1 w-[16%]">（醫師）</th>
                <th className="w-6 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-300">
              {diagnosisRows.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/80">
                  <td className="border-r border-stone-300 p-1">
                    <input
                      type="text"
                      value={row.hospital}
                      onChange={(e) => handleDiagnosisRowChange(row.id, 'hospital', e.target.value)}
                      placeholder="就診醫院 (如：台大醫院)"
                      className="w-full bg-transparent focus:outline-none font-semibold text-stone-900 text-center"
                    />
                  </td>
                  <td className="border-r border-stone-300 p-1">
                    <input
                      type="text"
                      value={row.dept}
                      onChange={(e) => handleDiagnosisRowChange(row.id, 'dept', e.target.value)}
                      placeholder="科別 (如：神經內科)"
                      className="w-full bg-transparent focus:outline-none text-teal-900 font-semibold text-center"
                    />
                  </td>
                  <td className="border-r border-stone-300 p-1">
                    <input
                      type="text"
                      value={row.diagnosis}
                      onChange={(e) => handleDiagnosisRowChange(row.id, 'diagnosis', e.target.value)}
                      placeholder="請輸入疾病或長照診斷名稱..."
                      className="w-full bg-transparent focus:outline-none font-bold text-stone-900"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={row.doctor}
                      onChange={(e) => handleDiagnosisRowChange(row.id, 'doctor', e.target.value)}
                      placeholder="主治/巡診醫師"
                      className="w-full bg-transparent focus:outline-none text-stone-800 text-center"
                    />
                  </td>
                  <td className="text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => removeDiagnosisRow(row.id)}
                      className="text-stone-400 hover:text-red-600 px-1"
                      title="刪除此筆診斷"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= SECTION 5: 長照三管與生活輔具管理 ================= */}
        <div className="p-2 bg-[#FAF8F5]">
          <div className="font-bold text-teal-950 mb-1.5 border-b border-stone-300 pb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-teal-800" />
              <span>長照留置管路（三管到期追蹤）與生活／行動輔具</span>
            </span>
            <span className="text-[11px] text-stone-500 font-normal">
              註記材質（矽膠/PVC）、規格、深度與下次到期更換日
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-900 whitespace-nowrap">鼻胃管 (NG)</span>
              <input
                type="text"
                value={record.lines.ng || ''}
                onChange={(e) => updateLines('ng', e.target.value)}
                placeholder="如: 16Fr 矽膠 55cm (到期:10/15)"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-900 whitespace-nowrap">導尿管 (Foley)</span>
              <input
                type="text"
                value={record.lines.foley || ''}
                onChange={(e) => updateLines('foley', e.target.value)}
                placeholder="如: 16Fr 矽膠 水球10ml (到期:10/18)"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-900 whitespace-nowrap">氣切管 (Trach)</span>
              <input
                type="text"
                value={record.lines.trEndo || ''}
                onChange={(e) => updateLines('trEndo', e.target.value)}
                placeholder="如: #7.0 矽膠雙管 (到期:10/20)"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-stone-700 whitespace-nowrap">氧氣/呼吸照護</span>
              <input
                type="text"
                value={record.lines.oxygen || ''}
                onChange={(e) => updateLines('oxygen', e.target.value)}
                placeholder="如: O2 2L/min / 氣切霧化抽痰"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-stone-700 whitespace-nowrap">行動與減壓輔具</span>
              <input
                type="text"
                value={record.lines.mobilityAid || ''}
                onChange={(e) => updateLines('mobilityAid', e.target.value)}
                placeholder="如: 高背輪椅 + 氣墊床 + 助行器"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-stone-700 whitespace-nowrap">感官/生活輔具</span>
              <input
                type="text"
                value={record.lines.prosthesis || ''}
                onChange={(e) => updateLines('prosthesis', e.target.value)}
                placeholder="如: 活動假牙 / 右耳助聽器 / 老花眼鏡"
                className="w-full focus:outline-none bg-transparent text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 6: 精簡選單化之日常生活照護評估 (ADL · 大小便 · 翻身減壓) ================= */}
        <div className="p-2 bg-teal-900/5">
          <div className="font-bold text-teal-950 mb-1.5 border-b border-stone-300 pb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-teal-800" />
              <span>日常生活照護評估選單 (ADL 自理 · 大小便管理 · 翻身減壓)</span>
            </span>
            <span className="text-[11px] font-mono tabular-nums text-teal-900 font-semibold">
              體重/BMI：
              <input
                type="text"
                value={ltc.weightBmi}
                onChange={(e) => updateLtcCare('weightBmi', e.target.value)}
                placeholder="如: 56.4 kg · BMI 21.2"
                className="ml-1 w-44 border-b border-dashed border-teal-700 bg-transparent focus:outline-none text-stone-900"
              />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 text-[11px]">
            {/* 1. ADL 移位與進食選單 */}
            <div className="flex flex-col border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-950 text-[10px] mb-0.5">日常移位與進食 (ADL)</span>
              <select
                value={ltc.adlScore || ADL_MOBILITY_OPTIONS[0]}
                onChange={(e) => updateLtcCare('adlScore', e.target.value)}
                className="w-full bg-transparent font-medium text-stone-900 focus:outline-none"
              >
                {ensureOption(ADL_MOBILITY_OPTIONS, ltc.adlScore).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. 排尿與尿布照護選單 */}
            <div className="flex flex-col border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-950 text-[10px] mb-0.5">排尿與尿布照護</span>
              <select
                value={ltc.continence || CONTINENCE_OPTIONS[0]}
                onChange={(e) => updateLtcCare('continence', e.target.value)}
                className="w-full bg-transparent font-medium text-stone-900 focus:outline-none"
              >
                {ensureOption(CONTINENCE_OPTIONS, ltc.continence).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. 排便狀態選單 */}
            <div className="flex flex-col border border-amber-300 px-2 py-1 bg-amber-50/40 rounded-md">
              <span className="font-bold text-amber-950 text-[10px] mb-0.5">排便狀態與最後解便</span>
              <select
                value={ltc.lastStoolDate || STOOL_STATUS_OPTIONS[0]}
                onChange={(e) => updateLtcCare('lastStoolDate', e.target.value)}
                className="w-full bg-transparent font-semibold text-amber-950 focus:outline-none"
              >
                {ensureOption(STOOL_STATUS_OPTIONS, ltc.lastStoolDate).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. 翻身減壓與約束選單 */}
            <div className="flex flex-col border border-stone-300 px-2 py-1 bg-white rounded-md">
              <span className="font-bold text-teal-950 text-[10px] mb-0.5">翻身減壓與防護措施</span>
              <select
                value={ltc.turningSchedule || TURNING_RESTRAINT_OPTIONS[0]}
                onChange={(e) => updateLtcCare('turningSchedule', e.target.value)}
                className="w-full bg-transparent font-medium text-stone-900 focus:outline-none"
              >
                {ensureOption(TURNING_RESTRAINT_OPTIONS, ltc.turningSchedule).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================= SECTION 7: MAIN 3-COLUMN CLINICAL CARE GRID (已移除跨專業團隊照會 & 家屬溝通) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-2 divide-stone-800">
          {/* LEFT COLUMN (col-span-4): 定期檢驗/血糖 + 長期慢箋與特殊給藥 */}
          <div className="lg:col-span-4 divide-y-2 divide-stone-800 flex flex-col justify-between">
            {/* 定期抽血檢驗與血糖監測 */}
            <div className="p-2">
              <div className="flex items-center justify-between font-bold border-b border-stone-400 pb-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-teal-950">血糖與定期檢驗追蹤</span>
                  <button
                    type="button"
                    onClick={() => setIsLabStandardsModalOpen(true)}
                    className="px-1.5 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded flex items-center gap-0.5 print:hidden font-medium"
                  >
                    <BookOpen className="w-3 h-3 text-teal-700" />
                    <span>參考值</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addLabRow}
                  className="px-1.5 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded flex items-center gap-0.5 print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增</span>
                </button>
              </div>
              <table className="w-full border-collapse border border-stone-400 text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-400 text-center font-bold text-stone-800">
                    <th className="border-r border-stone-400 p-1 w-[30%]">項目</th>
                    <th className="border-r border-stone-400 p-1 w-[30%]">數值</th>
                    <th className="p-1">追蹤與處置</th>
                    <th className="w-5 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {record.labs.map((lab) => {
                    const missingAction =
                      (!lab.action || lab.action.trim() === '') &&
                      (lab.item.trim() !== '' || lab.value.trim() !== '');
                    return (
                      <tr key={lab.id} className="hover:bg-stone-50">
                        <td className="border-r border-stone-300 p-1">
                          <input
                            type="text"
                            value={lab.item}
                            onChange={(e) => handleLabChange(lab.id, 'item', e.target.value)}
                            className="w-full bg-transparent focus:outline-none font-bold"
                            placeholder="如: AC血糖"
                          />
                        </td>
                        <td className="border-r border-stone-300 p-1 font-mono tabular-nums">
                          <input
                            type="text"
                            value={lab.value}
                            onChange={(e) => handleLabChange(lab.id, 'value', e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-red-700 font-semibold"
                            placeholder="數值"
                          />
                        </td>
                        <td className={`p-1 ${missingAction ? 'bg-red-50 ring-1 ring-red-400 ring-inset' : ''}`}>
                          <input
                            type="text"
                            value={lab.action}
                            onChange={(e) => handleLabChange(lab.id, 'action', e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-stone-700"
                            placeholder={missingAction ? '請填寫處置' : '處置紀錄'}
                          />
                        </td>
                        <td className="text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => removeLabRow(lab.id)}
                            className="text-stone-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 長期慢箋與特殊給藥 */}
            <div className="p-2 flex-1">
              <div className="flex items-center justify-between font-bold border-b border-stone-400 pb-1 mb-1.5">
                <span className="text-teal-950 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-teal-800" />
                  <span>長期慢箋與特殊給藥提醒</span>
                </span>
                <button
                  type="button"
                  onClick={addUdDrugRow}
                  className="px-1.5 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded flex items-center gap-0.5 print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增藥品</span>
                </button>
              </div>
              <div className="space-y-1">
                {record.udDrugs.map((drug) => (
                  <div
                    key={drug.id}
                    className="border border-stone-300 p-1.5 bg-stone-50/50 rounded text-[11px] flex items-center justify-between"
                  >
                    <div className="flex-1 grid grid-cols-12 gap-1">
                      <input
                        type="text"
                        placeholder="藥名與劑量"
                        value={drug.drugName}
                        onChange={(e) => handleUdDrugChange(drug.id, 'drugName', e.target.value)}
                        className="col-span-5 font-bold text-stone-900 focus:outline-none bg-transparent"
                      />
                      <input
                        type="text"
                        placeholder="途徑(口服/管灌)"
                        value={drug.route}
                        onChange={(e) => handleUdDrugChange(drug.id, 'route', e.target.value)}
                        className="col-span-2 text-center text-teal-800 font-semibold focus:outline-none bg-transparent"
                      />
                      <input
                        type="text"
                        placeholder="頻率時間"
                        value={drug.schedule}
                        onChange={(e) => handleUdDrugChange(drug.id, 'schedule', e.target.value)}
                        className="col-span-2 text-center font-mono tabular-nums focus:outline-none bg-transparent"
                      />
                      <input
                        type="text"
                        placeholder="給藥注意事項"
                        value={drug.note}
                        onChange={(e) => handleUdDrugChange(drug.id, 'note', e.target.value)}
                        className="col-span-3 text-stone-600 focus:outline-none bg-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUdDrugRow(drug.id)}
                      className="text-stone-400 hover:text-red-600 ml-1 print:hidden"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN (col-span-4): 門診回診與管路更換排程 + 生命徵象 */}
          <div className="lg:col-span-4 divide-y-2 divide-stone-800 flex flex-col justify-between">
            {/* 門診回診與三管到期排程 */}
            <div className="p-2">
              <div className="flex items-center justify-between font-bold border-b border-stone-400 pb-1 mb-1.5">
                <span className="text-teal-950 flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5 text-teal-800" />
                  <span>門診回診 · 三管到期更換排程</span>
                </span>
                <button
                  type="button"
                  onClick={addOpExamRow}
                  className="px-1.5 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded flex items-center gap-0.5 print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增排程</span>
                </button>
              </div>
              <table className="w-full border-collapse border border-stone-400 text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-400 text-center font-bold text-stone-800">
                    <th className="border-r border-stone-400 p-1 w-[20%]">日期</th>
                    <th className="border-r border-stone-400 p-1 w-[18%]">時間</th>
                    <th className="p-1">回診 / 管路更換事項</th>
                    <th className="w-5 print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {record.opExams.map((op) => (
                    <tr key={op.id}>
                      <td className="border-r border-stone-300 p-1 font-mono tabular-nums">
                        <input
                          type="text"
                          value={op.date}
                          onChange={(e) => handleOpExamChange(op.id, 'date', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-center font-semibold"
                          placeholder="MM/DD"
                        />
                      </td>
                      <td className="border-r border-stone-300 p-1 font-mono tabular-nums">
                        <input
                          type="text"
                          value={op.time}
                          onChange={(e) => handleOpExamChange(op.id, 'time', e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-center"
                          placeholder="HH:MM"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={op.content}
                          onChange={(e) => handleOpExamChange(op.id, 'content', e.target.value)}
                          className="w-full bg-transparent focus:outline-none"
                          placeholder="門診回診領慢箋或更換鼻胃管/尿管..."
                        />
                      </td>
                      <td className="text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => removeOpExamRow(op.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vital Sign (生命徵象) */}
            <div className="p-2 flex-1 overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between font-bold border-b border-stone-400 pb-1 mb-1.5 gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-teal-950">生命徵象紀錄 (Vital Signs)</span>
                  <button
                    type="button"
                    onClick={() => setIsStandardsModalOpen(true)}
                    className="px-1.5 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded flex items-center gap-0.5 print:hidden font-medium"
                  >
                    <BookOpen className="w-3 h-3 text-teal-700" />
                    <span>標準</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 print:hidden">
                  <button
                    type="button"
                    onClick={loadPresetDaily3}
                    className="px-1.5 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded flex items-center gap-0.5"
                    title="載入長照三班時段 (08:00 / 14:00 / 20:00)"
                  >
                    <Clock className="w-3 h-3 text-teal-700" />
                    <span>三班</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadPresetQ4h}
                    className="px-1.5 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded flex items-center gap-0.5"
                  >
                    <span>Q4H</span>
                  </button>
                  <button
                    type="button"
                    onClick={addVitalColumn}
                    className="px-1.5 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded flex items-center gap-0.5 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>時段</span>
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse border border-stone-400 text-[10px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-400 text-center font-bold">
                    <th className="border-r border-stone-400 p-0.5 w-14 bg-stone-200">項目</th>
                    {record.vitalSigns.map((v) => (
                      <th key={v.id} className="border-r border-stone-400 p-0.5 min-w-[52px] font-mono tabular-nums">
                        <div className="flex items-center justify-center">
                          <input
                            type="text"
                            value={v.time}
                            onChange={(e) => handleVitalChange(v.id, 'time', e.target.value)}
                            className="w-12 text-center bg-transparent font-bold focus:outline-none"
                          />
                          {record.vitalSigns.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVitalColumn(v.id)}
                              className="text-stone-400 hover:text-red-600 ml-0.5 print:hidden"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300 text-center font-mono tabular-nums">
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">T (°C)</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isTempAbnormal(v.T);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.T}
                            onChange={(e) => handleVitalChange(v.id, 'T', e.target.value)}
                            className={`w-full text-center bg-transparent focus:outline-none ${
                              abnormal ? 'text-red-700 font-bold' : 'text-stone-900'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">P (bpm)</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isPulseAbnormal(v.P);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.P}
                            onChange={(e) => handleVitalChange(v.id, 'P', e.target.value)}
                            className={`w-full text-center bg-transparent focus:outline-none ${
                              abnormal ? 'text-red-700 font-bold' : 'text-stone-900'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">R (次/分)</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isRespAbnormal(v.R);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.R}
                            onChange={(e) => handleVitalChange(v.id, 'R', e.target.value)}
                            className={`w-full text-center bg-transparent focus:outline-none ${
                              abnormal ? 'text-red-700 font-bold' : 'text-stone-900'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">BP</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isBpAbnormal(v.BP);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.BP}
                            onChange={(e) => handleVitalChange(v.id, 'BP', e.target.value)}
                            className={`w-full text-center bg-transparent focus:outline-none ${
                              abnormal ? 'text-red-700 font-bold' : 'text-stone-900'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">SpO2 (%)</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isSpo2Abnormal(v.SpO2);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.SpO2}
                            onChange={(e) => handleVitalChange(v.id, 'SpO2', e.target.value)}
                            className={`w-full text-center bg-transparent focus:outline-none ${
                              abnormal ? 'text-red-700 font-bold' : 'text-stone-900'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">GCS/意識</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isGcsAbnormal(v.GCS);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.GCS}
                            onChange={(e) => handleVitalChange(v.id, 'GCS', e.target.value)}
                            className="w-full text-center bg-transparent focus:outline-none text-stone-900"
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-stone-50">疼痛 Pain</td>
                    {record.vitalSigns.map((v) => {
                      const abnormal = isPainAbnormal(v.Pain);
                      return (
                        <td key={v.id} className={`border-r border-stone-300 p-0.5 ${abnormal ? 'bg-red-100' : ''}`}>
                          <input
                            type="text"
                            value={v.Pain}
                            onChange={(e) => handleVitalChange(v.id, 'Pain', e.target.value)}
                            className="w-full text-center bg-transparent focus:outline-none text-stone-900"
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="border-r border-stone-400 font-sans font-bold bg-amber-50 text-amber-950 text-[10px]">
                      處置/活動
                    </td>
                    {record.vitalSigns.map((v) => (
                      <td key={v.id} className="border-r border-stone-300 p-0.5 font-sans">
                        <input
                          type="text"
                          value={v.action || ''}
                          onChange={(e) => handleVitalChange(v.id, 'action', e.target.value)}
                          placeholder="備註..."
                          className="w-full text-center text-[10px] bg-transparent focus:outline-none text-stone-700"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              <div className="mt-2 pt-1 border-t border-stone-200 print:hidden">
                <VitalSignsChart
                  vitalSigns={record.vitalSigns}
                  bedNo={record.patientInfo.bedNo}
                  patientName={record.patientInfo.name}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (col-span-4): 壓傷與皮膚完整性換藥紀錄 + 人體圖標記 */}
          <div className="lg:col-span-4 divide-y-2 divide-stone-800 flex flex-col justify-between">
            {/* 壓傷與皮膚照護紀錄 */}
            <div className="p-2">
              <div className="flex items-center justify-between font-bold border-b border-stone-400 pb-1 mb-1.5">
                <span className="text-teal-950">壓傷與皮膚完整性換藥紀錄</span>
                <button
                  type="button"
                  onClick={addWoundRow}
                  className="px-1.5 py-0.5 text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded flex items-center gap-0.5 print:hidden"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增部位</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {record.wounds.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                    <input
                      type="text"
                      value={w.site}
                      onChange={(e) => handleWoundChange(idx, 'site', e.target.value)}
                      placeholder="部位與壓傷分期"
                      className="w-28 font-bold text-amber-950 border-b border-stone-300 focus:outline-none bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={w.description}
                      onChange={(e) => handleWoundChange(idx, 'description', e.target.value)}
                      placeholder="面積、滲液與敷料換藥方式..."
                      className="w-full border-b border-stone-300 focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeWoundRow(idx)}
                      className="text-stone-400 hover:text-red-600 print:hidden"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {record.wounds.length === 0 && (
                  <div className="text-center text-stone-400 py-2 text-[11px]">皮膚完整無壓傷紀錄</div>
                )}
              </div>
            </div>

            {/* 人體圖標記 */}
            <div className="p-2 flex-1 min-h-[240px]">
              <InteractiveBodyDiagram
                markers={record.bodyMarkers}
                onChangeMarkers={(newMarkers) =>
                  onChange({ ...record, bodyMarkers: newMarkers, lastUpdated: touchLastUpdated() })
                }
              />
            </div>
          </div>
        </div>

        {/* ================= SECTION 8: 住民專屬待辦清單 (TO-DO LIST) ================= */}
        <div className="p-2.5 bg-amber-50/40">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 pb-1.5 mb-2">
            <div className="font-bold text-teal-950 flex items-center gap-1.5 text-xs sm:text-sm">
              <ClipboardList className="w-4 h-4 text-teal-800" />
              <span>住民當班待辦事項清單 (To-Do List)</span>
              <span className="text-[11px] font-normal text-stone-600">
                （共 {todos.length} 項，未完成 {todos.filter((t) => !t.completed).length} 項）
              </span>
            </div>

            {onOpenTodoModal && (
              <button
                type="button"
                onClick={onOpenTodoModal}
                className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors print:hidden"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-300" />
                <span>開啟待辦列印中心 (匯出 PDF / Word DOC)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                  todo.completed
                    ? 'bg-stone-100/80 border-stone-200 text-stone-400'
                    : 'bg-white border-stone-300 text-stone-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleTodo(todo.id)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-4 h-4 text-teal-700 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                  <span className="font-semibold text-teal-900 shrink-0">[{todo.category}]</span>
                  <span className={todo.completed ? 'line-through' : 'font-medium'}>{todo.content}</span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-mono tabular-nums text-[11px] text-stone-500">{todo.dueTime}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-stone-400 hover:text-red-600 print:hidden"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 print:hidden">
            <select
              value={newTodoCategory}
              onChange={(e) => setNewTodoCategory(e.target.value as TodoCategory)}
              className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-medium text-stone-800"
            >
              <option value="日常照護">日常照護</option>
              <option value="管路更換">管路更換</option>
              <option value="特殊給藥">特殊給藥</option>
              <option value="翻身換藥">翻身換藥</option>
              <option value="門診回診">門診回診</option>
              <option value="抽血檢驗">抽血檢驗</option>
              <option value="家屬溝通">家屬溝通</option>
            </select>
            <input
              type="text"
              value={newTodoTime}
              onChange={(e) => setNewTodoTime(e.target.value)}
              placeholder="預定時間"
              className="w-20 bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-center font-mono tabular-nums"
            />
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInlineTodo();
                }
              }}
              placeholder="快速新增此住民待辦事項 (按 Enter 新增)..."
              className="flex-1 min-w-[200px] bg-white border border-stone-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-teal-700"
            />
            <button
              type="button"
              onClick={handleAddInlineTodo}
              className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              + 新增待辦
            </button>
          </div>
        </div>

        {/* ================= SECTION 9: 日常照護觀察筆記 & 長照 ISBAR 結構化交班 ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-stone-800 bg-white">
          <div className="p-2 flex flex-col">
            <div className="font-bold text-teal-950 border-b border-stone-400 pb-1 mb-1.5 flex items-center justify-between">
              <span>本班日常照護觀察筆記 (進食 · 排泄 · 睡眠 · 情緒)</span>
              <span className="text-[10px] text-stone-500 font-normal">照服員與護理師共同交接焦點</span>
            </div>
            <textarea
              rows={5}
              value={record.receiveNote}
              onChange={(e) => onChange({ ...record, receiveNote: e.target.value, lastUpdated: touchLastUpdated() })}
              placeholder="記錄住民本班進食消化狀況、排便解尿、情緒及特殊照護觀察..."
              className="w-full flex-1 p-2 border border-stone-300 rounded-md focus:outline-none focus:border-teal-700 text-xs bg-stone-50/40 leading-relaxed"
            />
          </div>

          <div className="p-2 flex flex-col bg-teal-50/20">
            <div className="font-bold text-teal-950 border-b border-stone-400 pb-1 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-teal-800" />
                <span>長照 ISBAR 結構化護理交班紀錄</span>
              </span>
              {onGenerateAiIsbar && (
                <button
                  type="button"
                  onClick={onGenerateAiIsbar}
                  disabled={isAiGenerating}
                  className="px-2.5 py-0.5 bg-teal-800 hover:bg-teal-700 text-white rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 print:hidden"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isAiGenerating ? 'AI 生成中...' : 'AI 一鍵產生長照 ISBAR'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={record.handoverNoteISBAR}
              onChange={(e) =>
                onChange({ ...record, handoverNoteISBAR: e.target.value, lastUpdated: touchLastUpdated() })
              }
              placeholder="I (住民識別) / S (現況與三管) / B (長照背景與風險) / A (本班評估) / R (下班待辦建議)..."
              className="w-full flex-1 p-2 border border-teal-300 rounded-md focus:outline-none focus:border-teal-700 text-xs bg-white leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>

      {/* PRINT SIGNATURE FOOTER */}
      <div className="hidden print:grid grid-cols-3 gap-4 mt-3 pt-2 border-t border-black text-xs">
        <div>
          <strong>交班／製表人員簽章：</strong> {userName.trim() || '_________________'}
        </div>
        <div>
          <strong>接班人員簽章：</strong> _________________
        </div>
        <div>
          <strong>護理長／督導簽章：</strong> _________________
        </div>
      </div>

      {/* Patient Sticky Notes Widget (Screen only) */}
      <div className="mt-4 print:hidden">
        <PatientStickyNotesWidget
          bedNo={record.patientInfo.bedNo || '未指定'}
          notes={record.stickyNotes || []}
          onUpdateNotes={(newNotes) =>
            onChange({ ...record, stickyNotes: newNotes, lastUpdated: touchLastUpdated() })
          }
          onOpenFullModal={onOpenStickyNotesModal || (() => {})}
        />
      </div>

      {/* Modals */}
      <VitalStandardsModal isOpen={isStandardsModalOpen} onClose={() => setIsStandardsModalOpen(false)} />
      <LabStandardsModal isOpen={isLabStandardsModalOpen} onClose={() => setIsLabStandardsModalOpen(false)} />
    </div>
  );
};
