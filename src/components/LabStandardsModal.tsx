import React, { useState } from 'react';
import { LAB_STANDARDS, LabStandardItem } from '../utils/labStandards';
import { X, TestTube2, ShieldAlert, Info, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LabStandardsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(LAB_STANDARDS.map((item) => item.category)))];

  const filteredItems = LAB_STANDARDS.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clinicalNote.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-red-500/60 text-slate-100 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-red-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl">
              <TestTube2 className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                臨床 Lab 抽血與檢驗正常值與危急值對照表
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-400/30">
                  護理臨床規範
                </span>
              </h3>
              <p className="text-xs text-slate-400">常見臨床抽血、生化、電解質、凝血與動脈血氣分析（ABG）檢驗參考標準</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Banner */}
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-white text-sm">🚨 Lab 異常數值追蹤與報備叮嚀</span>
              <p className="text-slate-300 leading-relaxed">
                若本班抽血結果為<strong>危急值 (Panic Value)</strong> 且未填寫處置，床位清單將自動閃爍紅燈警告。請依各科處置規範執行補抽、投藥或立即通報主治醫師。
              </p>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋檢驗項目 (如: Na, K, Ca, Mg, P, WBC, Cr, PT, ABG)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>

            {/* Category Select Buttons */}
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white border-red-400 shadow'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? '全部項目' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Main Reference Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 font-bold text-[11px]">
                  <th className="p-2.5 w-40">檢驗項目 (Metric)</th>
                  <th className="p-2.5 text-emerald-400 w-40">✅ 臨床正常參考範圍</th>
                  <th className="p-2.5 text-red-400">🚨 異常/危急標準</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-bold text-white bg-slate-950/30">
                      <div className="text-amber-300">{item.item}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        單位: {item.unit} | <span className="text-slate-500">{item.category.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-semibold text-emerald-300 font-mono bg-emerald-950/20 text-[11px]">
                      {item.normalRange}
                    </td>
                    <td className="p-2.5 font-bold text-rose-300 font-mono bg-rose-950/20 text-[11px]">
                      {item.criticalCriteria}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                      未找到符合「{searchTerm}」的檢驗項目。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Clinical Action Guidance Cards */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>臨床評估與護理處置指引 (Clinical Notes)：</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {filteredItems.map((item) => (
                <div key={`note-${item.key}`} className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg">
                  <div className="font-bold text-amber-300 mb-0.5 flex items-center justify-between">
                    <span>{item.item}</span>
                    <span className="text-[10px] text-slate-400 font-normal">單位: {item.unit}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed">{item.clinicalNote}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg"
          >
            我瞭解了
          </button>
        </div>
      </div>
    </div>
  );
};
