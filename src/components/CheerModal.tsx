import React, { useState, useEffect } from 'react';
import { Coffee, Heart, Sparkles, RefreshCw, Copy, Check, X, Smile, Award } from 'lucide-react';
import { NURSING_CHEER_QUOTES } from '../data/cheerQuotes';

interface CheerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheerModal: React.FC<CheerModalProps> = ({ isOpen, onClose }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      drawRandomQuote();
    }
  }, [isOpen]);

  const drawRandomQuote = () => {
    setIsAnimating(true);
    setCopied(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * NURSING_CHEER_QUOTES.length);
      setCurrentQuoteIndex(randomIndex);
      setIsAnimating(false);
    }, 150);
  };

  const handleCopy = () => {
    const text = NURSING_CHEER_QUOTES[currentQuoteIndex];
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const quote = NURSING_CHEER_QUOTES[currentQuoteIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-amber-200/80 overflow-hidden flex flex-col relative transform transition-all scale-100">
        
        {/* Top Decorative Ambient Gradient */}
        <div className="h-3 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500"></div>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-50 to-white flex items-center justify-between border-b border-amber-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 shadow-inner">
              <Coffee className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-lg text-slate-800">來點Bosmin？</h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/50">
                  超超過 100+ 暖心語錄
                </span>
              </div>
              <p className="text-xs text-slate-500">為辛苦護航臨床的你，注入溫暖與滿滿元氣！</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center bg-gradient-to-b from-white via-amber-50/20 to-rose-50/20">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-rose-100 border-2 border-amber-200/60 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart className="w-8 h-8 fill-rose-400/30 text-rose-500" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className={`transition-all duration-200 min-h-[90px] flex items-center justify-center ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed font-sans px-2">
              「 {quote} 」
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-amber-700/80 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200/50">
            <Award className="w-3.5 h-3.5" />
            <span>目前卡片庫：{currentQuoteIndex + 1} / {NURSING_CHEER_QUOTES.length} 篇語錄</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">已複製語錄</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>複製這段話</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={drawRandomQuote}
              disabled={isAnimating}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-1.5 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
              <span>再抽一張 ☕</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition"
            >
              收下祝福
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
