import React, { useState } from 'react';
import { HandoverRecord, StickyNote, TodoCategory, TodoItem } from '../types';
import {
  X,
  Printer,
  FileDown,
  FileText,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  UserCheck,
  Building2,
  Clock,
  Filter,
  ClipboardList,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patients: HandoverRecord[];
  activePatientId: string;
  onUpdatePatient: (updated: HandoverRecord) => void;
  globalNotes: StickyNote[];
  userName: string;
  onChangeUserName: (name: string) => void;
  facilityName: string;
  onChangeFacilityName: (name: string) => void;
  shiftName: string;
  onChangeShiftName: (shift: string) => void;
  onPrintTodoPdf: (scope: 'all' | 'current', onlyPending: boolean) => void;
}

export interface AggregatedTodoRow {
  id: string;
  sourceType: 'resident-todo' | 'resident-sticky' | 'global-sticky';
  residentId?: string;
  bedNo: string;
  residentName: string;
  category: string;
  content: string;
  dueTime: string;
  priority: 'urgent' | 'normal' | 'routine';
  completed: boolean;
  assignedRole: string;
}

export function gatherAllTodoRows(
  patients: HandoverRecord[],
  globalNotes: StickyNote[],
  scope: 'all' | 'current',
  activePatientId: string,
  onlyPending: boolean
): AggregatedTodoRow[] {
  const rows: AggregatedTodoRow[] = [];
  const targetPatients = scope === 'current' ? patients.filter((p) => p.id === activePatientId) : patients;

  for (const p of targetPatients) {
    const bedNo = p.patientInfo.bedNo || '未填床號';
    const rName = p.patientInfo.name || '未填姓名';

    // 1. Structured resident todoItems
    for (const item of p.todoItems || []) {
      if (onlyPending && item.completed) continue;
      rows.push({
        id: item.id,
        sourceType: 'resident-todo',
        residentId: p.id,
        bedNo,
        residentName: rName,
        category: item.category || '日常照護',
        content: item.content,
        dueTime: item.dueTime || '本班',
        priority: item.priority || 'normal',
        completed: item.completed,
        assignedRole: item.assignedRole || '護理師',
      });
    }

    // 2. Resident sticky note checklist items
    for (const note of p.stickyNotes || []) {
      for (const chk of note.checklist || []) {
        if (onlyPending && chk.completed) continue;
        rows.push({
          id: `${note.id}_${chk.id}`,
          sourceType: 'resident-sticky',
          residentId: p.id,
          bedNo,
          residentName: rName,
          category: `便條(${note.tag})`,
          content: `[${note.title}] ${chk.text}`,
          dueTime: note.updatedAt || '本班',
          priority: note.tag === '急件' ? 'urgent' : 'normal',
          completed: chk.completed,
          assignedRole: '護理師/照服員',
        });
      }
    }
  }

  // 3. Global shift sticky notes checklist items (when scope is 'all')
  if (scope === 'all') {
    for (const note of globalNotes || []) {
      for (const chk of note.checklist || []) {
        if (onlyPending && chk.completed) continue;
        rows.push({
          id: `global_${note.id}_${chk.id}`,
          sourceType: 'global-sticky',
          bedNo: '全機構共通',
          residentName: '全體班別',
          category: `機構交接(${note.tag})`,
          content: `[${note.title}] ${chk.text}`,
          dueTime: note.updatedAt || '本班',
          priority: note.tag === '急件' ? 'urgent' : 'normal',
          completed: chk.completed,
          assignedRole: '當班護理師',
        });
      }
    }
  }

  return rows;
}

const TODO_CATEGORIES: TodoCategory[] = [
  '日常照護',
  '管路更換',
  '特殊給藥',
  '翻身換藥',
  '門診回診',
  '抽血檢驗',
  '家屬溝通',
];

export const TodoPrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onUpdatePatient,
  globalNotes,
  userName,
  onChangeUserName,
  facilityName,
  onChangeFacilityName,
  shiftName,
  onChangeShiftName,
  onPrintTodoPdf,
}) => {
  const [scope, setScope] = useState<'all' | 'current'>('all');
  const [onlyPending, setOnlyPending] = useState<boolean>(false);

  // Add new To-Do state
  const [selectedResidentId, setSelectedResidentId] = useState<string>(activePatientId || patients[0]?.id || '');
  const [newCategory, setNewCategory] = useState<TodoCategory>('日常照護');
  const [newContent, setNewContent] = useState('');
  const [newDueTime, setNewDueTime] = useState('14:00');
  const [newPriority, setNewPriority] = useState<'urgent' | 'normal' | 'routine'>('normal');
  const [newRole, setNewRole] = useState('護理師');

  if (!isOpen) return null;

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const rows = gatherAllTodoRows(patients, globalNotes, scope, activePatientId, onlyPending);
  const completedCount = rows.filter((r) => r.completed).length;
  const pendingCount = rows.length - completedCount;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const targetId = scope === 'current' ? activePatientId : selectedResidentId || activePatientId;
    const targetPatient = patients.find((p) => p.id === targetId);
    if (!targetPatient) return;

    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      category: newCategory,
      content: newContent.trim(),
      dueTime: newDueTime.trim() || '本班',
      priority: newPriority,
      completed: false,
      assignedRole: newRole.trim() || '護理師',
    };

    onUpdatePatient({
      ...targetPatient,
      todoItems: [...(targetPatient.todoItems || []), newItem],
      lastUpdated:
        new Date().toLocaleDateString('zh-TW') +
        ' ' +
        new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    });
    setNewContent('');
  };

  const handleToggleRow = (row: AggregatedTodoRow) => {
    if (row.sourceType === 'resident-todo' && row.residentId) {
      const target = patients.find((p) => p.id === row.residentId);
      if (!target) return;
      const updatedTodos = (target.todoItems || []).map((t) =>
        t.id === row.id ? { ...t, completed: !t.completed } : t
      );
      onUpdatePatient({ ...target, todoItems: updatedTodos });
    } else if (row.sourceType === 'resident-sticky' && row.residentId) {
      const target = patients.find((p) => p.id === row.residentId);
      if (!target) return;
      const [noteId, chkId] = row.id.split('_');
      const updatedNotes = (target.stickyNotes || []).map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: (n.checklist || []).map((c) => (c.id === chkId ? { ...c, completed: !c.completed } : c)),
        };
      });
      onUpdatePatient({ ...target, stickyNotes: updatedNotes });
    }
  };

  const handleDeleteRow = (row: AggregatedTodoRow) => {
    if (row.sourceType === 'resident-todo' && row.residentId) {
      const target = patients.find((p) => p.id === row.residentId);
      if (!target) return;
      const updatedTodos = (target.todoItems || []).filter((t) => t.id !== row.id);
      onUpdatePatient({ ...target, todoItems: updatedTodos });
    }
  };

  // Export as Word (.doc) with User Name in Header
  const handleDownloadDoc = () => {
    const nowStr = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const displayUser = userName.trim() || '未填寫（請於表頭輸入姓名）';
    const displayFacility = facilityName.trim() || '溫馨長照護理之家 (Nursing Home)';
    const scopeTitle =
      scope === 'current'
        ? `單一住民待辦清單 (${activePatient?.patientInfo.bedNo} ${activePatient?.patientInfo.name || ''})`
        : '全機構住民交班待辦事項總表 (To-Do List)';

    const tableRowsHtml =
      rows.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:16px;color:#666;">目前無符合條件之待辦事項</td></tr>`
        : rows
            .map(
              (r, idx) => `
          <tr style="background-color:${r.completed ? '#f5f5f4' : '#ffffff'};">
            <td style="border:1px solid #444;padding:6px 8px;text-align:center;font-family:monospace;">${idx + 1}</td>
            <td style="border:1px solid #444;padding:6px 8px;text-align:center;font-size:14pt;">${
              r.completed ? '☑' : '☐'
            }</td>
            <td style="border:1px solid #444;padding:6px 8px;font-weight:bold;">${r.bedNo}<br/><span style="font-weight:normal;font-size:9.5pt;color:#444;">${
                r.residentName
              }</span></td>
            <td style="border:1px solid #444;padding:6px 8px;text-align:center;">${r.category}</td>
            <td style="border:1px solid #444;padding:6px 8px;${
              r.completed ? 'text-decoration:line-through;color:#777;' : ''
            }">${r.priority === 'urgent' ? '<strong style="color:#b91c1c;">[急件] </strong>' : ''}${r.content}</td>
            <td style="border:1px solid #444;padding:6px 8px;text-align:center;font-family:monospace;">${r.dueTime}</td>
            <td style="border:1px solid #444;padding:6px 8px;text-align:center;">${r.assignedRole}</td>
          </tr>`
            )
            .join('');

    const docHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${scopeTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 1.5cm; }
          body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; color: #1c1917; line-height: 1.45; font-size: 10.5pt; }
          .header-box { border: 2px solid #0f766e; padding: 12px 16px; margin-bottom: 14px; background-color: #f0fdfa; }
          .title { font-size: 16pt; font-weight: bold; color: #115e59; margin: 0 0 4px 0; }
          .subtitle { font-size: 12pt; font-weight: bold; color: #1c1917; margin: 0 0 10px 0; }
          .meta-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
          .meta-table td { padding: 4px 6px; border-top: 1px dashed #0f766e; }
          .todo-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10pt; }
          .todo-table th { background-color: #115e59; color: #ffffff; border: 1px solid #444; padding: 8px; text-align: center; }
          .sign-box { margin-top: 24px; width: 100%; border-collapse: collapse; }
          .sign-box td { border: 1px solid #78716c; padding: 10px 12px; width: 33.3%; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="title">${displayFacility}</div>
          <div class="subtitle">${scopeTitle}</div>
          <table class="meta-table">
            <tr>
              <td><strong>製表／交班人員（使用者名稱）：</strong><span style="font-size:11.5pt;color:#0f766e;font-weight:bold;">${displayUser}</span></td>
              <td><strong>交班班別：</strong>${shiftName}</td>
              <td><strong>列印日期時間：</strong>${nowStr}</td>
            </tr>
            <tr>
              <td><strong>總待辦筆數：</strong>共 ${rows.length} 項</td>
              <td><strong>待執行項目：</strong>${pendingCount} 項</td>
              <td><strong>已完成項目：</strong>${completedCount} 項</td>
            </tr>
          </table>
        </div>

        <table class="todo-table">
          <thead>
            <tr>
              <th style="width:6%;">#</th>
              <th style="width:8%;">狀態</th>
              <th style="width:16%;">房床號 / 住民</th>
              <th style="width:14%;">照護分類</th>
              <th style="width:36%;">待辦照護事項內容 (To-Do Item)</th>
              <th style="width:10%;">預定時間</th>
              <th style="width:10%;">負責職類</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <table class="sign-box">
          <tr>
            <td><strong>交班／製表人員簽章：</strong><br/><br/>${displayUser}</td>
            <td><strong>接班人員確認簽章：</strong><br/><br/>___________________</td>
            <td><strong>護理長／督導核閱：</strong><br/><br/>___________________</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `長照待辦清單_To-Do_${userName.trim() || '護理師'}_${dateTag}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-sm print:hidden">
      <div className="bg-[#FAF8F5] border border-stone-300 text-stone-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-800 rounded-xl border border-teal-600">
              <ClipboardList className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                長照待辦事項清單 (To-Do List) 管理與列印中心
              </h3>
              <p className="text-xs text-teal-200">
                表頭自動帶入使用者名稱，支援一鍵列印／另存 PDF 格式或下載 Word (.DOC) 檔案
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Name & Header Configuration Bar */}
        <div className="px-6 py-3.5 bg-teal-50/80 border-b border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-teal-950 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>列印表頭顯示：使用者名稱（交班/製表人員）</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => onChangeUserName(e.target.value)}
              placeholder="請輸入您的姓名或職稱 (如：護理師 王小美)"
              className="w-full bg-white border border-teal-300 rounded-lg px-3 py-1.5 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-teal-950 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>長照機構名稱（表頭顯示）</span>
            </label>
            <input
              type="text"
              value={facilityName}
              onChange={(e) => onChangeFacilityName(e.target.value)}
              placeholder="如：松柏長照護理之家"
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-teal-950 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              <span>當班班別</span>
            </label>
            <select
              value={shiftName}
              onChange={(e) => onChangeShiftName(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="白班 (08:00 - 16:00)">白班 (08:00 - 16:00)</option>
              <option value="小夜班 (16:00 - 24:00)">小夜班 (16:00 - 24:00)</option>
              <option value="大夜班 (00:00 - 08:00)">大夜班 (00:00 - 08:00)</option>
              <option value="全日班 / 巡診交接">全日班 / 巡診交接</option>
            </select>
          </div>
        </div>

        {/* Filter & Export Actions Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  scope === 'all' ? 'bg-teal-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                全機構待辦總表 ({gatherAllTodoRows(patients, globalNotes, 'all', activePatientId, false).length})
              </button>
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  scope === 'current' ? 'bg-teal-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                僅目前住民 [{activePatient?.patientInfo.bedNo}] (
                {gatherAllTodoRows(patients, globalNotes, 'current', activePatientId, false).length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOnlyPending(!onlyPending)}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                onlyPending
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{onlyPending ? '目前僅顯示：未完成待辦' : '顯示全部（含已完成）'}</span>
            </button>
          </div>

          {/* Export / Print Buttons (PDF & DOC) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintTodoPdf(scope, onlyPending)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>列印 / 下載 PDF 格式</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDoc}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <FileDown className="w-4 h-4" />
              <span>下載 Word (.DOC) 格式</span>
            </button>
          </div>
        </div>

        {/* Main Content: Add To-Do Form + Live Print Header Preview + Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Add To-Do Form */}
          <form
            onSubmit={handleAddTodo}
            className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3 text-xs"
          >
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-700" />
              <span>新增長照住民待辦事項 (To-Do Item)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {scope === 'all' && (
                <div className="sm:col-span-2">
                  <select
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-900"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.patientInfo.bedNo} {p.patientInfo.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TodoCategory)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-medium text-stone-900"
                >
                  {TODO_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={scope === 'all' ? 'sm:col-span-4' : 'sm:col-span-6'}>
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="輸入待辦照護事項 (如：10/15 更換矽膠鼻胃管、下午沐浴後壓傷換藥...)"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-1">
                <input
                  type="text"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  placeholder="時間/日期"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-center font-mono text-stone-900"
                />
              </div>

              <div className="sm:col-span-1">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'urgent' | 'normal' | 'routine')}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 font-medium text-stone-900"
                >
                  <option value="urgent">急件</option>
                  <option value="normal">一般</option>
                  <option value="routine">例行</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="職類"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-stone-900"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  加入
                </button>
              </div>
            </div>
          </form>

          {/* Document Preview Card (Shows exact Print Header with User Name) */}
          <div className="bg-white border border-stone-300 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b-2 border-teal-800 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-teal-800">{facilityName || '長期照顧機構護理之家'}</div>
                <h4 className="text-lg font-bold text-stone-900">
                  {scope === 'current'
                    ? `住民照護待辦事項清單 — ${activePatient?.patientInfo.bedNo} ${activePatient?.patientInfo.name || ''}`
                    : '全機構交班待辦事項總表 (Nursing Home To-Do List)'}
                </h4>
              </div>
              <div className="text-xs text-stone-700 space-y-0.5 sm:text-right font-mono tabular-nums">
                <div>
                  製表／交班人員（使用者名稱）：
                  <strong className="text-teal-900 font-sans text-sm underline decoration-teal-600 ml-1">
                    {userName.trim() || '未填寫姓名'}
                  </strong>
                </div>
                <div>
                  班別：{shiftName} · 待辦統計：共 {rows.length} 項（待處理 {pendingCount} / 已完成 {completedCount}）
                </div>
              </div>
            </div>

            {/* To-Do Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-stone-300">
                <thead>
                  <tr className="bg-stone-100 text-stone-800 border-b border-stone-300 font-semibold">
                    <th className="p-2 border-r border-stone-300 w-10 text-center">狀態</th>
                    <th className="p-2 border-r border-stone-300 w-28 text-left">房床號 / 住民</th>
                    <th className="p-2 border-r border-stone-300 w-24 text-center">分類</th>
                    <th className="p-2 border-r border-stone-300 text-left">待辦照護事項內容</th>
                    <th className="p-2 border-r border-stone-300 w-20 text-center">預定時間</th>
                    <th className="p-2 border-r border-stone-300 w-24 text-center">負責人員</th>
                    <th className="p-2 w-12 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        目前無待辦事項，可由上方表單新增住民照護待辦項目。
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={`${row.sourceType}_${row.id}`}
                        className={`hover:bg-stone-50 transition-colors ${row.completed ? 'bg-stone-50/70 text-stone-400' : ''}`}
                      >
                        <td className="p-2 border-r border-stone-200 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRow(row)}
                            className="inline-flex items-center justify-center text-teal-700 hover:text-teal-900"
                            title="切換完成狀態"
                          >
                            {row.completed ? (
                              <CheckSquare className="w-4 h-4 text-teal-700" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-500" />
                            )}
                          </button>
                        </td>
                        <td className="p-2 border-r border-stone-200 font-semibold text-stone-900">
                          <div>{row.bedNo}</div>
                          <div className="text-[11px] font-normal text-stone-500">{row.residentName}</div>
                        </td>
                        <td className="p-2 border-r border-stone-200 text-center text-stone-700 font-medium">
                          {row.category}
                        </td>
                        <td className="p-2 border-r border-stone-200">
                          <div className={row.completed ? 'line-through text-stone-400' : 'text-stone-900 font-medium'}>
                            {row.priority === 'urgent' && (
                              <span className="text-red-700 font-bold mr-1.5">[急件]</span>
                            )}
                            {row.content}
                          </div>
                        </td>
                        <td className="p-2 border-r border-stone-200 text-center font-mono tabular-nums text-stone-700">
                          {row.dueTime}
                        </td>
                        <td className="p-2 border-r border-stone-200 text-center text-stone-700">
                          {row.assignedRole}
                        </td>
                        <td className="p-2 text-center">
                          {row.sourceType === 'resident-todo' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded"
                              title="刪除此待辦事項"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400">便條</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <span>提示：點擊「列印 / 下載 PDF 格式」可在瀏覽器列印對話框選擇「另存為 PDF」或直接連接印表機。</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
