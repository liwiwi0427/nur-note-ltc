import React from 'react';
import { History, Sparkles, X, CheckCircle2, ShieldAlert, HeartPulse, Stethoscope, Tag } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VersionLog {
  version: string;
  date: string;
  badge?: string;
  badgeColor?: string;
  highlights: string[];
}

const CHANGELOG_DATA: VersionLog[] = [
  {
    version: 'v2.8.0',
    date: '2026-08-11',
    badge: '最新版本',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    highlights: [
      '新增「緊急交班模式」開關：一鍵切換高對比度紅色警示主題，自動隱藏非必要數據，專注床號、24HR生命徵象與關鍵待辦',
      '床位清單顯示優化：床位按鈕括號內加入科別簡稱（自動萃取空白字元前之核心科別文字，不留贅字）',
      '緊急交班視圖內建生命徵象 24 小時趨勢圖與未處置異常警示，協助護理人員急診/交班秒級抓重點',
    ],
  },
  {
    version: 'v2.7.0',
    date: '2026-08-11',
    highlights: [
      '新增「未輸入處置即時閃爍紅燈」警示功能：當 Lab 異常或 Vital Sign 異常未填寫處置時，床位清單按鈕會即時閃爍紅燈',
      '新增生命徵象「處置/報備」輸入列，方便即時記錄退燒藥、冰枕或醫師報備處置',
      'Kardex 表頭加入臨床處置提示 Banner 與紅色高亮輸入框，協助護理人員快速補齊資料',
      '整合 AI 功能至主選單（選單 > AI 智慧護理助手），並全面優化手機與平板體驗',
    ],
  },
  {
    version: 'v2.6.0',
    date: '2026-08-11',
    highlights: [
      '整合 Recharts 數據圖表，新增「24小時生命徵象趨勢分析圖」',
      '支援「體溫/脈搏雙軸趨勢」、「收縮壓/舒張壓波動」與「血氧 Saturation (SpO2)」動態切換',
      '內建臨床安全警示線（發燒 38°C 門檻、收縮壓 140 高標、血氧 95% 警戒點）',
      '支援全螢幕放大查看圖表，數據與 Kardex 生命徵象欄位實時雙向連動',
    ],
  },
  {
    version: 'v2.5.0',
    date: '2026-08-11',
    highlights: [
      '新增系統「改版日誌」選單彈窗，方便護理人員隨時查閱更新歷程',
      '新增「☕ 護理加油站」專屬彈出視窗 UI，收錄 100+ 篇暖心語錄並支援隨機輪替與一鍵複製',
      'UI/UX 介面視覺全面美化，優化頂部功能導覽選單與流暢下拉選單體驗',
      '強化移動端響應式排版，維持 A4 橫式 Kardex 列印格式',
    ],
  },
  {
    version: 'v2.4.0',
    date: '2026-08-11',
    highlights: [
      '於交班卡頁尾及 AI 視窗加入【臨床免責聲明】，明確標示 AI 分析結果僅供輔助參考',
      '簡化頁尾資訊，右下角專注顯示「系統最後更新時間」',
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-08-11',
    highlights: [
      '大幅擴充病患基本資料欄位：病患姓名、病歷號、年齡、入院日期',
      '新增風險評估與醫療資訊：主要診斷、飲食/NPO 備註、過敏史、跌倒/壓傷風險等級',
      '將擴充之完整病患資料同步餵入 Gemini AI 進行 ISBAR 摘要與危急提醒計算',
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-08-10',
    badge: 'AI 功能重大升級',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    highlights: [
      '伺服器端整合 Gemini API，實現一鍵自動生成繁體中文標準護理 ISBAR 交班 Note',
      '新增「AI 臨床危急提醒與品質稽核」，即時抓取異常 Lab 值與高風險生命徵象',
      '支援 AI 交班結果直接代入至 Kardex 主表單',
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-08-08',
    highlights: [
      '創立互動式人體圖定位系統（前後正面/背面），點擊即可標記管路與傷口位置',
      '精確適應 A4 橫向 (Landscape) 專業護理 Kardex 表單列印排版',
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-08-01',
    badge: '系統初代上線',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    highlights: [
      '多床位分頁切換與搜尋（床號、診斷、科別）',
      '全方位護理表單：侵入性管路、Lab 檢驗、手術檢查、備血、Total I/O 體液平衡、Vitals 紀錄',
      '瀏覽器 LocalStorage 本地資料實時自動備份',
    ],
  },
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                改版日誌 (Changelog)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  v2.5.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">菜鳥交班e點通 功能更新紀錄與修復日誌</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Timeline list */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
          {CHANGELOG_DATA.map((log, idx) => (
            <div key={log.version} className="relative pl-6 border-l-2 border-indigo-200 last:border-l-0">
              {/* Timeline Bullet */}
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                idx === 0 ? 'border-blue-600 bg-blue-600 ring-4 ring-blue-100' : 'border-slate-400'
              }`}>
                {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>

              {/* Version Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base text-slate-800">{log.version}</span>
                  {log.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${log.badgeColor || 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                      {log.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                  {log.date}
                </span>
              </div>

              {/* Highlights */}
              <ul className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2 text-xs text-slate-700">
                {log.highlights.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>菜鳥交班e點通 Clinical Kardex Engine</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
