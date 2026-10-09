import React from 'react';
import { HandoverRecord } from '../types';
import { AlertTriangle, Trash2, X, UserCheck, Stethoscope, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  patient: HandoverRecord | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<Props> = ({ isOpen, patient, onConfirm, onClose }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border-2 border-red-500/70 text-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-red-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/30 text-red-400 border border-red-500/40 rounded-xl shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                確認刪除床位交班紀錄
              </h3>
              <p className="text-xs text-red-300 font-medium">刪除後資料將無法復原，請再次確認</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 leading-relaxed">
            <p className="font-bold text-red-300 text-sm mb-1 flex items-center gap-1.5">
              <span>🚨 警告提示：</span>
            </p>
            <p className="text-slate-200">
              您即將刪除 <strong className="text-amber-300 font-mono text-sm">[{patient.patientInfo.bedNo || '未指定床號'}]</strong> 的全部交班卡資料，包含生命徵象紀錄、身體評估、管路狀況與 ISBAR 交班單。
            </p>
          </div>

          {/* Patient Card Preview */}
          <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>床號：[{patient.patientInfo.bedNo}] {patient.patientInfo.name || '無姓名'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                病歷號: {patient.patientInfo.chartNo || '未填寫'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">科別：</span>
                <span className="font-bold text-slate-100">{patient.patientInfo.dept || '未指定'}</span>
              </div>
              <div>
                <span className="text-slate-400">主治醫師：</span>
                <span className="font-bold text-slate-100">{patient.patientInfo.attending || '未指定'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">主診斷：</span>
                <span className="font-bold text-amber-200">{patient.patientInfo.diagnosis || '尚無主診斷描述'}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-[11px]">
            您確定要移除該位病患嗎？
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-700 active:scale-95"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center space-x-1.5 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>確定刪除床位</span>
          </button>
        </div>
      </div>
    </div>
  );
};
