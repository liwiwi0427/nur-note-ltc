import React, { useState } from 'react';
import { StickyNote, StickyNoteColor, StickyNoteTag } from '../types';
import {
  StickyNote as StickyIcon,
  Plus,
  Pin,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Check,
  Tag,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';

interface Props {
  bedNo: string;
  notes: StickyNote[];
  onUpdateNotes: (notes: StickyNote[]) => void;
  onOpenFullModal: () => void;
}

const COLOR_MAP: Record<StickyNoteColor, { bg: string; border: string; text: string }> = {
  yellow: {
    bg: 'bg-amber-100 text-amber-950',
    border: 'border-amber-300',
    text: 'text-amber-950',
  },
  blue: {
    bg: 'bg-sky-100 text-sky-950',
    border: 'border-sky-300',
    text: 'text-sky-950',
  },
  green: {
    bg: 'bg-emerald-100 text-emerald-950',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
  },
  pink: {
    bg: 'bg-rose-100 text-rose-950',
    border: 'border-rose-300',
    text: 'text-rose-950',
  },
  purple: {
    bg: 'bg-purple-100 text-purple-950',
    border: 'border-purple-300',
    text: 'text-purple-950',
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

export const PatientStickyNotesWidget: React.FC<Props> = ({
  bedNo,
  notes,
  onUpdateNotes,
  onOpenFullModal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickTag, setQuickTag] = useState<StickyNoteTag>('待辦');
  const [quickColor, setQuickColor] = useState<StickyNoteColor>('yellow');
  const [quickChecklist, setQuickChecklist] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddQuickNote = () => {
    if (!quickTitle.trim() && !quickContent.trim() && !quickChecklist.trim()) return;

    const nowStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    // Parse quick checklist items separated by commas or newlines
    const items = quickChecklist
      .split(/[\n,，]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((text, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        text,
        completed: false,
      }));

    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      patientId: bedNo,
      title: quickTitle || '床位隨手記',
      content: quickContent,
      color: quickColor,
      tag: quickTag,
      checklist: items,
      isPinned: false,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    onUpdateNotes([newNote, ...notes]);
    setQuickTitle('');
    setQuickContent('');
    setQuickChecklist('');
    setIsAdding(false);
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    onUpdateNotes(updated);
  };

  const handleDelete = (id: string) => {
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const handleToggleCheckitem = (noteId: string, itemId: string) => {
    const updated = notes.map((n) => {
      if (n.id === noteId && n.checklist) {
        return {
          ...n,
          checklist: n.checklist.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)),
        };
      }
      return n;
    });
    onUpdateNotes(updated);
  };

  const handleCopyNote = (note: StickyNote) => {
    let text = `📌 [床位 ${bedNo} 便條] ${note.title}\n`;
    if (note.content) text += `${note.content}\n`;
    if (note.checklist) text += note.checklist.map((i) => ` ${i.completed ? '✓' : '☐'} ${i.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Sort pinned first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl p-4 shadow-xs print:hidden space-y-3">
      {/* Widget Title Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg border border-amber-300">
            <StickyIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-teal-950 flex items-center gap-1.5">
              <span>住民隨手記便條貼紙 (Sticky Notes)</span>
              <span className="text-xs text-stone-500 font-mono tabular-nums">({notes.length})</span>
            </h3>
            <p className="text-[11px] text-stone-500">房床 [{bedNo}] 專屬照護備忘、家屬交代與特殊提醒便條</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>貼便條</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullModal}
            className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
            title="開啟全機構隨手記便條紙板"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">全板檢視</span>
          </button>
        </div>
      </div>

      {/* Inline Quick Add Form */}
      {isAdding && (
        <div className="p-3 bg-slate-900 border border-amber-500/60 rounded-xl space-y-2.5 animate-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>快速新增床位便條 [{bedNo}]</span>
            </span>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="便條標題 (如: 10:30 補抽 K / 主治交代)..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={quickTag}
                onChange={(e) => setQuickTag(e.target.value as StickyNoteTag)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-bold text-xs"
              >
                <option value="急件">⚡ 急件</option>
                <option value="待辦">📋 待辦</option>
                <option value="醫師囑咐">👨‍⚕️ 醫師囑咐</option>
                <option value="交班提醒">💬 交班提醒</option>
                <option value="採血用藥">🩸 採血用藥</option>
                <option value="衛教備忘">🩺 衛教備忘</option>
                <option value="一般">📌 一般</option>
              </select>

              <div className="flex items-center space-x-1 shrink-0">
                {(['yellow', 'blue', 'green', 'pink', 'purple'] as StickyNoteColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setQuickColor(c)}
                    className={`w-4 h-4 rounded-full border transition ${
                      c === 'yellow'
                        ? 'bg-amber-300'
                        : c === 'blue'
                        ? 'bg-sky-300'
                        : c === 'green'
                        ? 'bg-emerald-300'
                        : c === 'pink'
                        ? 'bg-rose-300'
                        : 'bg-purple-300'
                    } ${quickColor === c ? 'ring-2 ring-white scale-110' : 'opacity-60'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <textarea
            rows={2}
            placeholder="便條內文或補充說明..."
            value={quickContent}
            onChange={(e) => setQuickContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
          />

          <input
            type="text"
            placeholder="快捷待辦項目（可以逗號分隔，如: 補追 ECG, 連絡家屬, 補打 Note）"
            value={quickChecklist}
            onChange={(e) => setQuickChecklist(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
          />

          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs"
            >
              取消
            </button>
            <button
              onClick={handleAddQuickNote}
              className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition"
            >
              貼上便條
            </button>
          </div>
        </div>
      )}

      {/* Notes Display */}
      {sortedNotes.length === 0 ? (
        <div className="p-4 text-center bg-white rounded-xl text-stone-500 text-xs border border-stone-200">
          此住民目前無隨手記便條，點擊上方「<strong>＋ 貼便條</strong>」即可新增照護備忘！
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {sortedNotes.map((note) => {
            const style = COLOR_MAP[note.color] || COLOR_MAP.yellow;
            const tagStyle = TAG_COLORS[note.tag] || TAG_COLORS.一般;

            return (
              <div
                key={note.id}
                className={`p-2.5 rounded-xl border-2 shadow transition-all ${style.bg} ${style.border} ${
                  note.isPinned ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                {/* Note Header */}
                <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-1.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${tagStyle}`}>{note.tag}</span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`p-0.5 rounded hover:bg-black/10 ${note.isPinned ? 'text-amber-700' : 'text-slate-600'}`}
                      title="釘選"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleCopyNote(note)}
                      className="p-0.5 rounded hover:bg-black/10 text-slate-700"
                      title="複製"
                    >
                      {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-0.5 rounded hover:bg-red-500/20 text-red-700"
                      title="刪除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Note Body */}
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-950 flex items-center gap-1">
                    {note.isPinned && <span>📌</span>}
                    <span>{note.title}</span>
                  </h4>

                  {note.content && (
                    <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-wrap">{note.content}</p>
                  )}

                  {note.checklist && note.checklist.length > 0 && (
                    <div className="space-y-0.5 pt-1">
                      {note.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleCheckitem(note.id, item.id)}
                          className="w-full text-left flex items-start space-x-1 text-[10px] text-slate-950 hover:bg-black/5 p-0.5 rounded"
                        >
                          <span className="mt-0.5 shrink-0">
                            {item.completed ? (
                              <CheckSquare className="w-3 h-3 text-emerald-800" />
                            ) : (
                              <Square className="w-3 h-3 text-slate-600" />
                            )}
                          </span>
                          <span className={item.completed ? 'line-through text-slate-500' : 'font-medium'}>
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[9px] text-slate-600 font-mono text-right border-t border-black/10 pt-1">
                  {note.updatedAt || note.createdAt}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
