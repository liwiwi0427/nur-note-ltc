import React, { useState, useEffect } from 'react';
import { HandoverRecord } from '../types';
import { checkAbnormalAlertStatus } from '../utils/clinicalAlerts';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { FIREBASE_SYNC_NUMBER } from '../firebase';
import {
  Printer,
  Plus,
  Trash2,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  Download,
  Upload,
  RefreshCw,
  Search,
  Coffee,
  Menu,
  ChevronDown,
  History,
  StickyNote as StickyIcon,
  ClipboardList,
  UserCheck,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut,
  Eye,
  Settings2,
  BedDouble,
  Accessibility,
  AlertCircle,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

interface Props {
  patients: HandoverRecord[];
  activePatientId: string;
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
  onDeletePatient: (id: string) => void;
  onResetDemo: () => void;
  onImportPatients?: (imported: HandoverRecord[]) => void;
  onTriggerAiIsbar: () => void;
  onTriggerClinicalAudit: () => void;
  onOpenCheerModal: () => void;
  onOpenChangelogModal: () => void;
  onOpenStickyNotesModal: () => void;
  onOpenTodoModal: () => void;
  onPrintKardex: () => void;
  isAiLoading: boolean;
  isEmergencyMode?: boolean;
  onToggleEmergencyMode?: () => void;
  userName: string;
  onChangeUserName: (name: string) => void;
  firebaseUserEmail?: string | null;
  isCloudSyncing?: boolean;
  lastCloudSyncTime?: string | null;
  onSignInFirebase: () => void;
  onSignOutFirebase: () => void;
  onForceSyncNow?: () => void;
}

export type QuickToolId =
  | 'focusView'
  | 'todoPrint'
  | 'stickyNotes'
  | 'printKardex'
  | 'aiIsbar'
  | 'aiAudit'
  | 'cheer'
  | 'exportJson'
  | 'importJson';

const DEFAULT_TOOLBAR_TOOLS: QuickToolId[] = [
  'focusView',
  'todoPrint',
  'stickyNotes',
  'printKardex',
  'aiIsbar',
];

const TOOLBAR_STORAGE_KEY = 'ltc_custom_quick_toolbar_v1';

const ALL_TOOL_METADATA: Record<QuickToolId, { label: string; desc: string }> = {
  focusView: { label: '重點交班視圖', desc: '切換精簡高專注交班畫面' },
  todoPrint: { label: '待辦清單列印 (PDF/DOC)', desc: '開啟待辦中心並匯出 PDF 或 Word' },
  stickyNotes: { label: '隨手記便條', desc: '開啟住民與機構班別便條紙板' },
  printKardex: { label: '列印交班卡', desc: '列印目前住民 A4 長照交班卡' },
  aiIsbar: { label: 'AI 產生 ISBAR', desc: '一鍵歸納住民長照 ISBAR 摘要' },
  aiAudit: { label: 'AI 風險稽核', desc: '智慧檢視跌倒、壓傷與用藥提醒' },
  cheer: { label: '暖心語錄', desc: '開啟長照護理暖心加油站' },
  exportJson: { label: '匯出備份 JSON', desc: '下載全機構交班卡 JSON 備份檔' },
  importJson: { label: '匯入備份 JSON', desc: '從電腦載入 JSON 備份檔案' },
};

export const HeaderBar: React.FC<Props> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onAddPatient,
  onDeletePatient,
  onResetDemo,
  onImportPatients,
  onTriggerAiIsbar,
  onTriggerClinicalAudit,
  onOpenCheerModal,
  onOpenChangelogModal,
  onOpenStickyNotesModal,
  onOpenTodoModal,
  onPrintKardex,
  isAiLoading,
  isEmergencyMode = false,
  onToggleEmergencyMode,
  userName,
  onChangeUserName,
  firebaseUserEmail,
  isCloudSyncing = false,
  lastCloudSyncTime,
  onSignInFirebase,
  onSignOutFirebase,
  onForceSyncNow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<HandoverRecord | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [pinnedTools, setPinnedTools] = useState<QuickToolId[]>(() => {
    try {
      const saved = localStorage.getItem(TOOLBAR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load custom toolbar:', e);
    }
    return DEFAULT_TOOLBAR_TOOLS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TOOLBAR_STORAGE_KEY, JSON.stringify(pinnedTools));
    } catch (e) {
      console.error('Failed to save custom toolbar:', e);
    }
  }, [pinnedTools]);

  const toggleToolPin = (id: QuickToolId) => {
    setPinnedTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const moveToolOrder = (id: QuickToolId, direction: 'up' | 'down') => {
    setPinnedTools((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
  };

  const activePatient = patients.find((p) => p.id === activePatientId);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(patients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `長照住民交班卡_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonText = event.target?.result as string;
        const parsed = JSON.parse(jsonText);

        const records: HandoverRecord[] = Array.isArray(parsed) ? parsed : [parsed];
        if (records.length === 0 || !records[0].patientInfo) {
          setImportMessage('匯入失敗：JSON 格式不符長照交班卡資料結構');
          setTimeout(() => setImportMessage(null), 4000);
          return;
        }

        if (onImportPatients) {
          onImportPatients(records);
          setImportMessage(`已成功匯入 ${records.length} 筆住民資料`);
          setTimeout(() => setImportMessage(null), 4000);
        }
      } catch (err) {
        console.error('Import JSON error:', err);
        setImportMessage('匯入失敗：格式非合法的 JSON 檔案');
        setTimeout(() => setImportMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    const diagMatch =
      p.patientInfo.diagnosis.toLowerCase().includes(q) ||
      (p.patientInfo.diagnosisList || []).some(
        (d) =>
          d.diagnosis.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          d.dept.toLowerCase().includes(q) ||
          d.doctor.toLowerCase().includes(q)
      );
    return (
      p.patientInfo.bedNo.toLowerCase().includes(q) ||
      (p.patientInfo.name && p.patientInfo.name.toLowerCase().includes(q)) ||
      diagMatch ||
      p.patientInfo.dept.toLowerCase().includes(q)
    );
  });

  const renderQuickToolButton = (toolId: QuickToolId) => {
    switch (toolId) {
      case 'focusView':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onToggleEmergencyMode}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap border ${
              isEmergencyMode
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-xs'
                : 'bg-teal-900/80 hover:bg-teal-800 text-stone-200 border-teal-700'
            }`}
            title="切換重點交班視圖"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>{isEmergencyMode ? '重點視圖 ON' : '重點交班視圖'}</span>
          </button>
        );
      case 'todoPrint':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onOpenTodoModal}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs border border-amber-300 whitespace-nowrap"
            title="開啟 To-Do List 待辦清單並匯出 PDF 或 Word (.DOC)"
          >
            <ClipboardList className="w-4 h-4 text-stone-950 shrink-0" />
            <span>待辦清單列印 (PDF/DOC)</span>
          </button>
        );
      case 'stickyNotes':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onOpenStickyNotesModal}
            className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-700 text-amber-200 font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-teal-600 whitespace-nowrap"
            title="開啟隨手記便條紙板"
          >
            <StickyIcon className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>隨手記便條</span>
          </button>
        );
      case 'printKardex':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onPrintKardex}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs border border-emerald-500/40 whitespace-nowrap"
            title="列印目前住民 A4 長照交班卡（表頭含使用者名稱）"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>列印交班卡</span>
          </button>
        );
      case 'aiIsbar':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onTriggerAiIsbar}
            disabled={isAiLoading}
            className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-700 text-white border border-teal-600 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-50"
            title="AI 一鍵產生長照 ISBAR 交班摘要"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{isAiLoading ? 'AI 整理中...' : 'AI 產生 ISBAR'}</span>
          </button>
        );
      case 'aiAudit':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onTriggerClinicalAudit}
            disabled={isAiLoading}
            className="px-2.5 py-1.5 bg-teal-900/90 hover:bg-teal-800 text-amber-200 border border-teal-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap disabled:opacity-50"
            title="AI 長照照護風險稽核"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>AI 風險稽核</span>
          </button>
        );
      case 'cheer':
        return (
          <button
            key={toolId}
            type="button"
            onClick={onOpenCheerModal}
            className="px-2.5 py-1.5 bg-teal-900/90 hover:bg-teal-800 text-amber-200 border border-teal-700 rounded-lg font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
            title="長照暖心加油站"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>暖心語錄</span>
          </button>
        );
      case 'exportJson':
        return (
          <button
            key={toolId}
            type="button"
            onClick={handleExportJson}
            className="px-2.5 py-1.5 bg-teal-900/90 hover:bg-teal-800 text-stone-200 border border-teal-700 rounded-lg font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
            title="匯出備份 JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>匯出 JSON</span>
          </button>
        );
      case 'importJson':
        return (
          <button
            key={toolId}
            type="button"
            onClick={handleTriggerImport}
            className="px-2.5 py-1.5 bg-teal-900/90 hover:bg-teal-800 text-stone-200 border border-teal-700 rounded-lg font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
            title="匯入備份 JSON"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>匯入 JSON</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#113A37] text-stone-100 shadow-md border-b border-teal-900 sticky top-0 z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5">
        {/* Top Row: Clean Brand Title, User Name Input, Cloud Sync & Customizable Quick Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-teal-800/80">
          {/* Left Zone: Brand + User Name + Firebase Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-700 rounded-xl border border-teal-500/40 shadow-xs">
                <HeartHandshake className="w-5 h-5 text-amber-200" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                菜鳥交班e點通・長照機構版
              </h1>
            </div>

            {/* Editable User Name Input (Displayed on all Printouts) */}
            <div className="flex items-center bg-teal-950/90 border border-teal-700/80 rounded-lg px-2.5 py-1 gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] text-teal-200 font-medium whitespace-nowrap">交班/列印人：</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => onChangeUserName(e.target.value)}
                placeholder="輸入使用者名稱..."
                className="w-28 sm:w-36 bg-transparent text-xs font-semibold text-amber-200 placeholder-teal-400/60 focus:outline-none border-b border-dashed border-teal-600 focus:border-amber-300"
                title="輸入使用者名稱，列印交班卡與待辦清單 (PDF/DOC) 時將自動顯示於表頭"
              />
            </div>

            {/* Firebase 435594027895 Sync Control */}
            {firebaseUserEmail ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-600/50 rounded-lg px-2.5 py-1 text-[11px]">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-200 font-medium whitespace-nowrap">
                  Firebase ({FIREBASE_SYNC_NUMBER}) {isCloudSyncing ? '同步中...' : '已連線'}
                </span>
                {onForceSyncNow && (
                  <button
                    type="button"
                    onClick={onForceSyncNow}
                    className="ml-1 px-1.5 py-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors whitespace-nowrap"
                    title={lastCloudSyncTime ? `最後同步：${lastCloudSyncTime}` : '立即同步至雲端'}
                  >
                    同步
                  </button>
                )}
                <button
                  type="button"
                  onClick={onSignOutFirebase}
                  className="text-emerald-300/80 hover:text-white p-0.5"
                  title={`已登入：${firebaseUserEmail}（點擊登出）`}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignInFirebase}
                className="px-2.5 py-1.5 bg-teal-800/90 hover:bg-teal-700 text-amber-200 border border-teal-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="登入 Google 帳號以同步住民交班卡與待辦清單至 Firebase (435594027895)"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>連結 Firebase ({FIREBASE_SYNC_NUMBER})</span>
                <LogIn className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Right Zone: User-Customizable Quick Toolbar + Customize Button + More Menu */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {pinnedTools.map((toolId) => renderQuickToolButton(toolId))}

            {/* Customize Quick Toolbar Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCustomizerOpen(!customizerOpen);
                  setMenuOpen(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors whitespace-nowrap border ${
                  customizerOpen
                    ? 'bg-amber-400 text-stone-950 border-amber-300'
                    : 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border-teal-700'
                }`}
                title="自訂頂端快捷工具列按鈕與順序"
              >
                <Settings2 className="w-3.5 h-3.5 shrink-0" />
                <span>自訂工具列</span>
              </button>

              {customizerOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 p-3 text-stone-200 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>自訂頂端快捷工具列</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">勾選常用功能並調整顯示順序</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPinnedTools(DEFAULT_TOOLBAR_TOOLS)}
                      className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] flex items-center gap-1"
                      title="還原預設工具列"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>預設</span>
                    </button>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                    {(Object.keys(ALL_TOOL_METADATA) as QuickToolId[]).map((id) => {
                      const meta = ALL_TOOL_METADATA[id];
                      const isPinned = pinnedTools.includes(id);
                      const orderIdx = pinnedTools.indexOf(id);

                      return (
                        <div
                          key={id}
                          className={`flex items-center justify-between p-1.5 rounded-lg border ${
                            isPinned ? 'bg-teal-950/60 border-teal-700/80' : 'bg-stone-950/40 border-stone-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleToolPin(id)}
                            className="flex items-start gap-2 text-left flex-1"
                          >
                            {isPinned ? (
                              <CheckSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-semibold text-stone-100">{meta.label}</div>
                              <div className="text-[10px] text-stone-400">{meta.desc}</div>
                            </div>
                          </button>

                          {isPinned && (
                            <div className="flex items-center gap-0.5 ml-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveToolOrder(id, 'up')}
                                disabled={orderIdx === 0}
                                className="p-1 text-stone-400 hover:text-white disabled:opacity-30"
                                title="往前移"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveToolOrder(id, 'down')}
                                disabled={orderIdx === pinnedTools.length - 1}
                                className="p-1 text-stone-400 hover:text-white disabled:opacity-30"
                                title="往後移"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-stone-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCustomizerOpen(false)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs"
                    >
                      完成設定
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* System & AI Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setCustomizerOpen(false);
                }}
                className="px-3 py-1.5 bg-teal-950 hover:bg-teal-900 text-stone-100 border border-teal-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Menu className="w-4 h-4 text-amber-300" />
                <span>選單</span>
                <ChevronDown className="w-3.5 h-3.5 text-teal-300" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 py-2 text-stone-200 text-xs max-h-[85vh] overflow-y-auto"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-amber-300 border-b border-stone-800 flex items-center gap-1.5 bg-stone-950/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI 智慧長照交班助手</span>
                  </div>

                  <button
                    type="button"
                    onClick={onTriggerAiIsbar}
                    disabled={isAiLoading}
                    className="w-full text-left px-3 py-2.5 hover:bg-stone-800 flex items-center gap-2.5 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <div className="flex-1">
                      <div>AI 產生長照 ISBAR 交班</div>
                      <p className="text-[10px] font-normal text-stone-400">整合三管、ADL 與排泄狀況生成交班摘要</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={onTriggerClinicalAudit}
                    disabled={isAiLoading}
                    className="w-full text-left px-3 py-2.5 hover:bg-stone-800 flex items-center gap-2.5 text-amber-200 font-semibold transition-colors border-b border-stone-800 disabled:opacity-50"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <div>AI 長照照護風險稽核</div>
                      <p className="text-[10px] font-normal text-stone-400">檢視跌倒、壓傷、便秘與慢箋用藥提醒</p>
                    </div>
                  </button>

                  <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 border-b border-stone-800 pt-2">
                    資料與住民管理
                  </div>

                  <button
                    type="button"
                    onClick={onAddPatient}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-100 font-medium"
                  >
                    <Plus className="w-4 h-4 text-teal-400" />
                    <span>新增入住住民床位</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenTodoModal}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-amber-200 font-medium"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-400" />
                    <span>To-Do 待辦清單列印 (PDF / DOC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenCheerModal}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-100 font-medium"
                  >
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>長照暖心語錄加油站</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-100 font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>匯出備份 JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerImport}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-100 font-medium"
                  >
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>匯入備份 JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetDemo}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-100 font-medium"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>重設為長照機構範例住民</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenChangelogModal}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center gap-2 text-stone-300 font-medium border-t border-stone-800"
                  >
                    <History className="w-4 h-4 text-teal-400" />
                    <span className="flex-1">系統改版日誌</span>
                  </button>

                  {patients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activePatient) {
                          setPatientToDelete(activePatient);
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-950/60 text-red-300 flex items-center gap-2 font-medium border-t border-stone-800"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>刪除目前床位 [{activePatient?.patientInfo.bedNo}]</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          className="hidden"
        />

        {importMessage && (
          <div className="mt-2 px-3 py-1.5 bg-teal-900 border border-teal-500 rounded-lg text-xs text-amber-200 font-medium">
            {importMessage}
          </div>
        )}

        {/* Bottom Row: Resident Bed Tabs with Tab Icons + Search */}
        <div className="flex items-center justify-between pt-2.5 gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-teal-200/90 whitespace-nowrap mr-1 flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-amber-300" />
              <span>住民分頁：</span>
            </span>

            {filteredPatients.map((p) => {
              const isActive = p.id === activePatientId;
              const alertStatus = checkAbnormalAlertStatus(p);
              const rawZone = p.patientInfo.dept ? p.patientInfo.dept.trim().split(/\s+/)[0] : '';
              const labelMeta = [p.patientInfo.name, rawZone].filter(Boolean).join(' · ');
              const hasTubes =
                (p.lines.ng && p.lines.ng !== '無' && !p.lines.ng.startsWith('無')) ||
                (p.lines.foley && p.lines.foley !== '無' && !p.lines.foley.startsWith('無')) ||
                (p.lines.trEndo && p.lines.trEndo !== '無' && !p.lines.trEndo.startsWith('無'));
              const hasInfectionControl =
                p.patientInfo.isIsolated ||
                (p.patientInfo.isolationType &&
                  p.patientInfo.isolationType !== '' &&
                  !p.patientInfo.isolationType.startsWith('無'));

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-xs'
                      : 'bg-teal-900/70 text-stone-200 border-teal-800 hover:bg-teal-800 hover:text-white'
                  } ${
                    alertStatus.hasAbnormalUnaddressed ? 'border-red-400 ring-1 ring-red-400/60' : ''
                  }`}
                  title={
                    alertStatus.hasAbnormalUnaddressed
                      ? `房床 [${p.patientInfo.bedNo}] 有 ${alertStatus.totalUnaddressedCount} 項異常未填寫處置`
                      : `房床 [${p.patientInfo.bedNo}] ${p.patientInfo.name || ''}`
                  }
                >
                  {/* Tab Icon: Bed / Alert / Tube / Infection */}
                  {alertStatus.hasAbnormalUnaddressed ? (
                    <AlertCircle
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-red-700' : 'text-red-400'}`}
                      title="有異常待處置"
                    />
                  ) : (
                    <BedDouble
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-amber-300/90'}`}
                    />
                  )}

                  <span className="font-mono tabular-nums font-bold">{p.patientInfo.bedNo || '新床號'}</span>
                  {labelMeta && (
                    <span className={`text-[11px] ${isActive ? 'text-stone-800 font-semibold' : 'text-teal-200/90'}`}>
                      ({labelMeta})
                    </span>
                  )}

                  {hasTubes && (
                    <Accessibility
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-900' : 'text-teal-300'}`}
                      title="留置三管照護"
                    />
                  )}

                  {hasInfectionControl && (
                    <ShieldAlert
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-900' : 'text-amber-300'}`}
                      title={`感控監測：${p.patientInfo.isolationType || '防護中'}`}
                    />
                  )}

                  {patients.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPatientToDelete(p);
                      }}
                      className={`ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity px-1 rounded ${
                        isActive ? 'text-stone-700 hover:text-red-700' : 'text-teal-300 hover:text-red-300'
                      }`}
                      title="刪除此住民床位"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={onAddPatient}
              className="px-3 py-1.5 bg-teal-900/50 hover:bg-teal-800 text-teal-200 hover:text-white rounded-lg text-xs font-semibold border border-dashed border-teal-600 flex items-center gap-1 whitespace-nowrap transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>新增住民</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-40 sm:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-teal-300/70 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="搜尋房床號 / 姓名 / 診斷..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-teal-950/90 text-stone-100 text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-teal-700 focus:outline-none focus:border-amber-400 placeholder-teal-400/60 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!patientToDelete}
        patient={patientToDelete}
        onConfirm={() => {
          if (patientToDelete) {
            onDeletePatient(patientToDelete.id);
            setPatientToDelete(null);
          }
        }}
        onClose={() => setPatientToDelete(null)}
      />
    </header>
  );
};
