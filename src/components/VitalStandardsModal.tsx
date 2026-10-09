import React from 'react';
import { VITAL_SIGN_STANDARDS } from '../utils/vitalSignRanges';
import { X, Activity, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VitalStandardsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-red-500/60 text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                臨床生命徵象正常值與異常警示標準
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-400/30">
                  護理臨床規範
                </span>
              </h3>
              <p className="text-xs text-slate-400">系統將根據以下標準，自動將超出正常範圍之數據標記為紅色</p>
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
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-white text-sm">🚨 異常自動紅字標記機制</span>
              <p className="text-slate-300">
                只要您在生命徵象表格中填寫的數值落入「<strong>異常警示標準</strong>」區間，系統將會即時將該數值標示為<strong>鮮紅色加粗體</strong>，並於表頭與床位按鈕處提供閃爍提示。
              </p>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 font-bold text-[11px]">
                  <th className="p-2.5 w-36">項目 (Metric)</th>
                  <th className="p-2.5 text-emerald-400 w-36">✅ 臨床正常範圍</th>
                  <th className="p-2.5 text-red-400">🚨 異常警示標準 (標紅)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {Object.values(VITAL_SIGN_STANDARDS).map((item) => (
                  <tr key={item.key} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-bold text-white bg-slate-950/30">
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">單位: {item.unit}</div>
                    </td>
                    <td className="p-2.5 font-semibold text-emerald-300 font-mono bg-emerald-950/20">
                      {item.normalRange}
                    </td>
                    <td className="p-2.5 font-bold text-rose-300 font-mono bg-rose-950/20">
                      {item.abnormalCriteria}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>臨床評估與處置提示說明：</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {Object.values(VITAL_SIGN_STANDARDS).map((item) => (
                <div key={item.key} className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-lg">
                  <div className="font-bold text-amber-300 mb-0.5">{item.label}</div>
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
