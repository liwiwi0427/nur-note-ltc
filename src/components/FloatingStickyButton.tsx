import React from 'react';
import { StickyNote as StickyIcon, Plus } from 'lucide-react';

interface Props {
  onClick: () => void;
  totalNotesCount: number;
  currentBedNotesCount: number;
  bedNo: string;
}

export const FloatingStickyButton: React.FC<Props> = ({
  onClick,
  totalNotesCount,
  currentBedNotesCount,
  bedNo,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end space-y-2 group">
      {/* Tooltip on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/60 shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0">
        <StickyIcon className="w-3.5 h-3.5 text-amber-400" />
        <span>隨手記便條紙 (床位 [{bedNo}]: {currentBedNotesCount} 則)</span>
      </div>

      {/* Main Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold p-3.5 sm:px-4 sm:py-3.5 rounded-2xl shadow-2xl border-2 border-amber-200 flex items-center space-x-2.5 transition-all duration-200 transform hover:scale-105 active:scale-95 ring-4 ring-amber-500/30 hover:ring-amber-500/50 cursor-pointer"
        title="開啟護理隨手記便條紙板 (固定於螢幕右下角)"
      >
        <div className="relative">
          <StickyIcon className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          {totalNotesCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg animate-pulse">
              {totalNotesCount > 99 ? '99+' : totalNotesCount}
            </span>
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
          <span className="text-xs font-black text-slate-950 tracking-wide flex items-center gap-1">
            <span>隨手記便條紙</span>
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </span>
          <span className="text-[10px] text-amber-950 font-bold opacity-90">
            [{bedNo}] 共 {currentBedNotesCount} 則
          </span>
        </div>
      </button>
    </div>
  );
};
