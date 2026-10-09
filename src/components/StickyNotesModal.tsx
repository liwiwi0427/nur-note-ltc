import React, { useState } from 'react';
import { HandoverRecord, StickyNote, StickyNoteColor, StickyNoteTag, StickyChecklistItem } from '../types';
import {
  X,
  StickyNote as StickyIcon,
  Plus,
  Pin,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Check,
  Search,
  Tag,
  Sparkles,
  ListTodo,
  FileText,
  User,
  Filter,
  Palette,
  AlertCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patients: HandoverRecord[];
  activePatientId: string;
  onUpdatePatientStickyNotes: (patientId: string, notes: StickyNote[]) => void;
  globalNotes: StickyNote[];
  onUpdateGlobalNotes: (notes: StickyNote[]) => void;
}

const COLOR_MAP: Record<StickyNoteColor, { bg: string; border: string; text: string; badge: string; pin: string }> = {
  yellow: {
    bg: 'bg-amber-100 text-amber-950',
    border: 'border-amber-300',
    text: 'text-amber-950',
    badge: 'bg-amber-200/80 text-amber-900 border-amber-400',
    pin: 'text-amber-600',
  },
  blue: {
    bg: 'bg-sky-100 text-sky-950',
    border: 'border-sky-300',
    text: 'text-sky-950',
    badge: 'bg-sky-200/80 text-sky-900 border-sky-400',
    pin: 'text-sky-600',
  },
  green: {
    bg: 'bg-emerald-100 text-emerald-950',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    badge: 'bg-emerald-200/80 text-emerald-900 border-emerald-400',
    pin: 'text-emerald-600',
  },
  pink: {
    bg: 'bg-rose-100 text-rose-950',
    border: 'border-rose-300',
    text: 'text-rose-950',
    badge: 'bg-rose-200/80 text-rose-900 border-rose-400',
    pin: 'text-rose-600',
  },
  purple: {
    bg: 'bg-purple-100 text-purple-950',
    border: 'border-purple-300',
    text: 'text-purple-950',
    badge: 'bg-purple-200/80 text-purple-900 border-purple-400',
    pin: 'text-purple-600',
  },
};

const TAG_COLORS: Record<StickyNoteTag, string> = {
  急件: 'bg-red-500 text-white font-bold',
  待辦: 'bg-amber-600 text-white font-bold',
  醫師囑咐: 'bg-blue-600 text-white font-bold',
  交班提醒: 'bg-purple-600 text-white font-bold',
  採血用藥: 'bg-emerald-600 text-white font-bold',
  衛教備忘: 'bg-teal-600 text-white font-bold',
  一般: 'bg-slate-700 text-white font-bold',
};

const PRESET_TEMPLATES = [
  {
    title: '🔄 長照三管到期更換提醒',
    tag: '待辦' as StickyNoteTag,
    color: 'yellow' as StickyNoteColor,
    content: '住民定期留置管路更換與耗材準備：',
    items: [
      { text: '備齊矽膠鼻胃管 / 矽膠導尿管與無菌敷料包', completed: false },
      { text: '更換後記錄深度刻度並更新下次到期日', completed: false },
    ],
  },
  {
    title: '🚐 醫院門診回診與慢箋領藥',
    tag: '醫師囑咐' as StickyNoteTag,
    color: 'pink' as StickyNoteColor,
    content: '醫院門診回診前置準備事項：',
    items: [
      { text: '確認復康巴士時間與家屬陪同人員', completed: false },
      { text: '備齊健保卡、長照機構轉診交班單與慢箋藥袋', completed: false },
    ],
  },
  {
    title: '💬 家屬探視與生活物資補充',
    tag: '交班提醒' as StickyNoteTag,
    color: 'blue' as StickyNoteColor,
    content: '家屬聯繫與日常照護備忘：',
    items: [
      { text: '通知家屬補充看護墊、紙尿褲與管灌營養品', completed: false },
      { text: '向家屬說明本週體重變化與復健活動參與情形', completed: false },
    ],
  },
  {
    title: '📋 機構班別例行巡檢與點班',
    tag: '待辦' as StickyNoteTag,
    color: 'green' as StickyNoteColor,
    content: '全區共同點班與感控事項：',
    items: [
      { text: '核對全區住民排便紀錄（滿3日未解便評估給藥）', completed: false },
      { text: '睡前清點失智專區助聽器、假牙與防走失手環電量', completed: false },
    ],
  },
];

export const StickyNotesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onUpdatePatientStickyNotes,
  globalNotes,
  onUpdateGlobalNotes,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'global'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // New Note Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [targetScope, setTargetScope] = useState<'current' | 'global'>('current');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<StickyNoteColor>('yellow');
  const [noteTag, setNoteTag] = useState<StickyNoteTag>('待辦');
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!isOpen) return null;

  const activePatient = patients.find((p) => p.id === activePatientId);
  const activeBedNo = activePatient?.patientInfo.bedNo || '未指定床號';

  // Gather all notes across patients + global
  const currentPatientNotes = activePatient?.stickyNotes || [];

  let displayedNotes: { note: StickyNote; patientBedNo?: string; patientName?: string; patientId?: string }[] = [];

  if (activeTab === 'current') {
    displayedNotes = currentPatientNotes.map((n) => ({
      note: n,
      patientBedNo: activeBedNo,
      patientName: activePatient?.patientInfo.name,
      patientId: activePatientId,
    }));
  } else if (activeTab === 'global') {
    displayedNotes = globalNotes.map((n) => ({
      note: n,
      patientBedNo: '全班別通用',
    }));
  } else {
    // ALL
    const patientNotesList = patients.flatMap((p) =>
      (p.stickyNotes || []).map((n) => ({
        note: n,
        patientBedNo: p.patientInfo.bedNo,
        patientName: p.patientInfo.name,
        patientId: p.id,
      }))
    );
    const globalNotesList = globalNotes.map((n) => ({
      note: n,
      patientBedNo: '全班別通用',
    }));
    displayedNotes = [...patientNotesList, ...globalNotesList];
  }

  // Filter search & tags
  displayedNotes = displayedNotes.filter(({ note, patientBedNo, patientName }) => {
    const matchesTag = selectedTagFilter === 'ALL' || note.tag === selectedTagFilter;
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patientBedNo && patientBedNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patientName && patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.checklist || []).some((item) => item.text.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  // Sort pinned first, then newest first
  displayedNotes.sort((a, b) => {
    if (a.note.isPinned && !b.note.isPinned) return -1;
    if (!a.note.isPinned && b.note.isPinned) return 1;
    return new Date(b.note.updatedAt).getTime() - new Date(a.note.updatedAt).getTime();
  });

  // Actions
  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim() && checklistItems.length === 0) return;

    const nowStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    if (editingNoteId) {
      // Editing existing note
      if (targetScope === 'global') {
        const updated = globalNotes.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                title: noteTitle || '無標題便條',
                content: noteContent,
                color: noteColor,
                tag: noteTag,
                checklist: checklistItems,
                updatedAt: nowStr,
              }
            : n
        );
        onUpdateGlobalNotes(updated);
      } else {
        const currentNotes = activePatient?.stickyNotes || [];
        const updated = currentNotes.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                title: noteTitle || '無標題便條',
                content: noteContent,
                color: noteColor,
                tag: noteTag,
                checklist: checklistItems,
                updatedAt: nowStr,
              }
            : n
        );
        onUpdatePatientStickyNotes(activePatientId, updated);
      }
    } else {
      // Creating new note
      const newNote: StickyNote = {
        id: `note-${Date.now()}`,
        patientId: targetScope === 'current' ? activePatientId : 'global',
        title: noteTitle || '隨手記便條',
        content: noteContent,
        color: noteColor,
        tag: noteTag,
        checklist: checklistItems,
        isPinned: false,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      if (targetScope === 'global') {
        onUpdateGlobalNotes([newNote, ...globalNotes]);
      } else {
        const currentNotes = activePatient?.stickyNotes || [];
        onUpdatePatientStickyNotes(activePatientId, [newNote, ...currentNotes]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('yellow');
    setNoteTag('待辦');
    setChecklistItems([]);
    setNewChecklistText('');
  };

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setNoteTitle(tpl.title);
    setNoteTag(tpl.tag);
    setNoteColor(tpl.color);
    setNoteContent(tpl.content);
    setChecklistItems(
      tpl.items.map((i, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        text: i.text,
        completed: i.completed,
      }))
    );
    setIsCreating(true);
  };

  const handleDeleteNote = (noteId: string, patientId?: string) => {
    if (patientId && patientId !== 'global') {
      const targetP = patients.find((p) => p.id === patientId);
      if (targetP) {
        const updated = (targetP.stickyNotes || []).filter((n) => n.id !== noteId);
        onUpdatePatientStickyNotes(patientId, updated);
      }
    } else {
      const updated = globalNotes.filter((n) => n.id !== noteId);
      onUpdateGlobalNotes(updated);
    }
  };

  const handleTogglePin = (noteId: string, patientId?: string) => {
    if (patientId && patientId !== 'global') {
      const targetP = patients.find((p) => p.id === patientId);
      if (targetP) {
        const updated = (targetP.stickyNotes || []).map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
        onUpdatePatientStickyNotes(patientId, updated);
      }
    } else {
      const updated = globalNotes.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
      onUpdateGlobalNotes(updated);
    }
  };

  const handleToggleCheckitem = (noteId: string, itemId: string, patientId?: string) => {
    if (patientId && patientId !== 'global') {
      const targetP = patients.find((p) => p.id === patientId);
      if (targetP) {
        const updated = (targetP.stickyNotes || []).map((n) => {
          if (n.id === noteId && n.checklist) {
            return {
              ...n,
              checklist: n.checklist.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
            };
          }
          return n;
        });
        onUpdatePatientStickyNotes(patientId, updated);
      }
    } else {
      const updated = globalNotes.map((n) => {
        if (n.id === noteId && n.checklist) {
          return {
            ...n,
            checklist: n.checklist.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
          };
        }
        return n;
      });
      onUpdateGlobalNotes(updated);
    }
  };

  const handleCopyNoteText = (note: StickyNote, bedNo?: string) => {
    let text = `📌 [便條紙 - ${note.tag}] ${note.title}\n`;
    if (bedNo) text += `床號：${bedNo}\n`;
    if (note.content) text += `內容：${note.content}\n`;
    if (note.checklist && note.checklist.length > 0) {
      text += `待辦事項：\n` + note.checklist.map((i) => ` ${i.completed ? '✓' : '☐'} ${i.text}`).join('\n');
    }
    navigator.clipboard.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const addChecklistItemToForm = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-amber-500/60 text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-400/40 rounded-xl shadow-inner">
              <StickyIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                護理隨手記便條紙板 (Shift Memo Board)
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  即時紀錄
                </span>
              </h3>
              <p className="text-xs text-slate-400">跨床位隨手記、醫囑追蹤、待辦檢核與交接備忘貼紙</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center text-xs">
          {/* Scope Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'current'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>目前床位 [{activeBedNo}]</span>
              <span className="text-[10px] bg-slate-900/30 px-1.5 py-0.2 rounded-full font-mono">
                {currentPatientNotes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('global')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'global'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>全班通用備忘</span>
              <span className="text-[10px] bg-slate-900/30 px-1.5 py-0.2 rounded-full font-mono">
                {globalNotes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>全部床位便條</span>
            </button>
          </div>

          {/* New Note Button */}
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>新增隨手貼便條</span>
          </button>
        </div>

        {/* Filter & Presets Sub-bar */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋便條標題、待辦事項、內文或床號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
            <span className="text-[10px] text-slate-400 font-bold shrink-0 flex items-center gap-0.5 mr-1">
              <Filter className="w-3 h-3 text-amber-400" /> 標籤:
            </span>
            {['ALL', '急件', '待辦', '醫師囑咐', '交班提醒', '採血用藥', '衛教備忘', '一般'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition shrink-0 border ${
                  selectedTagFilter === tag
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {tag === 'ALL' ? '全部標籤' : tag}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Create / Edit Note Form Overlay / Box */}
          {isCreating && (
            <div className="p-4 bg-slate-800/90 border-2 border-amber-500/70 rounded-2xl space-y-3 shadow-xl animate-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                  <StickyIcon className="w-4 h-4 text-amber-400" />
                  <span>{editingNoteId ? '編輯便條紙' : '新增隨手記便條紙'}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">歸屬範圍：</span>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value as 'current' | 'global')}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-bold"
                  >
                    <option value="current">床位 [{activeBedNo}] 專屬</option>
                    <option value="global">全班別通用備忘</option>
                  </select>
                  <button
                    onClick={resetForm}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">便條標題：</label>
                  <input
                    type="text"
                    placeholder="如：10:30 補抽血 / 會診追蹤 / 家屬會客..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      <span>分類標籤：</span>
                    </label>
                    <select
                      value={noteTag}
                      onChange={(e) => setNoteTag(e.target.value as StickyNoteTag)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-bold"
                    >
                      <option value="急件">⚡ 急件</option>
                      <option value="待辦">📋 待辦</option>
                      <option value="醫師囑咐">👨‍⚕️ 醫師囑咐</option>
                      <option value="交班提醒">💬 交班提醒</option>
                      <option value="採血用藥">🩸 採血用藥</option>
                      <option value="衛教備忘">🩺 衛教備忘</option>
                      <option value="一般">📌 一般</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-amber-400" />
                      <span>貼紙顏色：</span>
                    </label>
                    <div className="flex items-center space-x-1 pt-0.5">
                      {(['yellow', 'blue', 'green', 'pink', 'purple'] as StickyNoteColor[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNoteColor(c)}
                          className={`w-6 h-6 rounded-full transition transform border-2 ${
                            c === 'yellow'
                              ? 'bg-amber-300 border-amber-500'
                              : c === 'blue'
                              ? 'bg-sky-300 border-sky-500'
                              : c === 'green'
                              ? 'bg-emerald-300 border-emerald-500'
                              : c === 'pink'
                              ? 'bg-rose-300 border-rose-500'
                              : 'bg-purple-300 border-purple-500'
                          } ${noteColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Content Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">詳細說明 / 文字內容：</label>
                <textarea
                  rows={2}
                  placeholder="輸入隨手記錄事項、重點補充或注意事項..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              {/* Checklist Items Creator */}
              <div className="p-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2">
                <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>待辦勾選清單 (Checklist Items)：</span>
                </span>

                {checklistItems.length > 0 && (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {checklistItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-1.5 bg-slate-800 rounded border border-slate-700 text-xs"
                      >
                        <span className="text-slate-200">
                          {idx + 1}. {item.text}
                        </span>
                        <button
                          onClick={() => setChecklistItems((prev) => prev.filter((i) => i.id !== item.id))}
                          className="text-red-400 hover:text-red-300 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="新增勾選子項目 (如: 補發 WBC 報告、通知護理長)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChecklistItemToForm();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItemToForm}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-xs"
                  >
                    + 加入項目
                  </button>
                </div>
              </div>

              {/* Quick Presets row */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> 快速套用護理範本:
                </span>
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-[10px] font-medium transition"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-extrabold text-xs shadow-md transition"
                >
                  儲存便條紙
                </button>
              </div>
            </div>
          )}

          {/* Sticky Notes Grid Display */}
          {displayedNotes.length === 0 ? (
            <div className="p-10 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl text-slate-400 space-y-3">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-500/30">
                <StickyIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">目前尚無便條紙備忘紀錄</h4>
                <p className="text-xs text-slate-400 mt-1">
                  點擊右上角「<strong>+ 新增隨手貼便條</strong>」或套用「護理範本」，快速記下臨時醫囑、採血追蹤或會診事項！
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {displayedNotes.map(({ note, patientBedNo, patientName, patientId }) => {
                const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.yellow;
                const tagStyle = TAG_COLORS[note.tag] || TAG_COLORS.一般;

                return (
                  <div
                    key={note.id}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between ${
                      colorStyle.bg
                    } ${colorStyle.border} ${note.isPinned ? 'ring-2 ring-amber-500 shadow-amber-500/20' : ''}`}
                  >
                    {/* Note Top Ribbon */}
                    <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Scope/Bed Badge */}
                        <span className="text-[10px] bg-black/85 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-black/30 font-mono">
                          [{patientBedNo || '未指定'}] {patientName ? `${patientName}` : ''}
                        </span>

                        {/* Tag Badge */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${tagStyle}`}>
                          {note.tag}
                        </span>
                      </div>

                      {/* Pin & Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleTogglePin(note.id, patientId)}
                          className={`p-1 rounded hover:bg-black/10 transition ${
                            note.isPinned ? 'text-amber-600 font-bold scale-110' : 'text-slate-600 opacity-60'
                          }`}
                          title={note.isPinned ? '取消釘選' : '釘選至最頂部'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-600' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleCopyNoteText(note, patientBedNo)}
                          className="p-1 rounded hover:bg-black/10 transition text-slate-700"
                          title="複製便條紙文字"
                        >
                          {copiedNoteId === note.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteNote(note.id, patientId)}
                          className="p-1 rounded hover:bg-red-500/20 transition text-red-700"
                          title="刪除此便條"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content Body */}
                    <div className="space-y-2 flex-1">
                      <h4 className="font-extrabold text-sm leading-snug flex items-center gap-1 text-slate-900">
                        {note.isPinned && <span className="text-amber-600 font-extrabold">📌</span>}
                        <span>{note.title}</span>
                      </h4>

                      {note.content && (
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {note.content}
                        </p>
                      )}

                      {/* Checklist */}
                      {note.checklist && note.checklist.length > 0 && (
                        <div className="p-2 bg-black/5 rounded-xl space-y-1 mt-1 border border-black/10">
                          {note.checklist.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleToggleCheckitem(note.id, item.id, patientId)}
                              className="w-full text-left flex items-start space-x-1.5 text-[11px] font-medium text-slate-900 hover:bg-black/5 p-1 rounded transition"
                            >
                              <span className="mt-0.5 shrink-0">
                                {item.completed ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </span>
                              <span className={item.completed ? 'line-through text-slate-500 font-normal' : ''}>
                                {item.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Note Footer Timestamp */}
                    <div className="mt-3 pt-1.5 border-t border-black/10 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                      <span>時間: {note.updatedAt || note.createdAt}</span>
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setNoteTitle(note.title);
                          setNoteContent(note.content || '');
                          setNoteColor(note.color);
                          setNoteTag(note.tag);
                          setChecklistItems(note.checklist || []);
                          setTargetScope(patientId === 'global' || !patientId ? 'global' : 'current');
                          setIsCreating(true);
                        }}
                        className="text-slate-800 font-bold hover:underline"
                      >
                        編輯便條
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>便條紙資料自動備份保存於本機 LocalStorage 中</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
