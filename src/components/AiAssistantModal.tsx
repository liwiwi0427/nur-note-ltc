import React from 'react';
import { Sparkles, ShieldAlert, Copy, Check, X, Stethoscope, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'isbar' | 'audit';
  content: string;
  onApplyToSheet?: (content: string) => void;
}

export const AiAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  type,
  content,
  onApplyToSheet,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyToSheet) {
      onApplyToSheet(content);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          type === 'isbar' ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-amber-600 to-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {type === 'isbar' ? (
              <Sparkles className="w-5 h-5 text-amber-300" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-yellow-200" />
            )}
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap font-sans bg-gray-50/50">
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span><strong>💡 提示：</strong>AI 產出之分析與 ISBAR 僅供臨床護理人員輔助參考，請核對醫囑與病患實際狀況。</span>
          </div>

          {content ? (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm font-mono text-xs sm:text-sm leading-relaxed">
              {content}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <span>AI 正在分析病患資料，請稍候...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">已複製到剪貼簿</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>複製內文</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-xs font-medium"
            >
              關閉
            </button>
            {type === 'isbar' && onApplyToSheet && content && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1"
              >
                <Stethoscope className="w-4 h-4" />
                <span>代入至 (交班 Note ISBAR)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
