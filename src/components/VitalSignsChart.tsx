import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { VitalSignColumn } from '../types';
import { Activity, Thermometer, HeartPulse, ShieldAlert, LineChart as ChartIcon, Maximize2, X } from 'lucide-react';

interface Props {
  vitalSigns: VitalSignColumn[];
  bedNo?: string;
  patientName?: string;
}

export const VitalSignsChart: React.FC<Props> = ({ vitalSigns, bedNo, patientName }) => {
  const [activeMetric, setActiveMetric] = useState<'tempPulse' | 'bp' | 'spo2'>('tempPulse');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format data for Recharts
  const chartData = vitalSigns.map((v) => {
    const temp = parseFloat(v.T) || null;
    const pulse = parseFloat(v.P) || null;
    const spo2 = parseFloat(v.SpO2) || null;

    // Parse BP e.g., "128/82"
    let sys: number | null = null;
    let dia: number | null = null;
    if (v.BP && v.BP.includes('/')) {
      const parts = v.BP.split('/');
      sys = parseFloat(parts[0]) || null;
      dia = parseFloat(parts[1]) || null;
    }

    return {
      time: v.time || '未指定',
      temperature: temp,
      pulse: pulse,
      systolic: sys,
      diastolic: dia,
      spo2: spo2,
    };
  });

  const renderChartContent = (height: number = 200) => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-xs text-gray-400">
          尚未輸入生命徵象數據
        </div>
      );
    }

    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'tempPulse' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis
                yAxisId="left"
                domain={[35, 41]}
                tick={{ fontSize: 10, fill: '#dc2626' }}
                unit="°C"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[40, 150]}
                tick={{ fontSize: 10, fill: '#2563eb' }}
                unit="bpm"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any, name: string) => {
                  if (name === '體溫 (T)') return [`${value} °C`, '體溫'];
                  if (name === '心跳 (P)') return [`${value} bpm`, '脈搏'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <ReferenceLine yAxisId="left" y={38.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '發燒門檻 38°C', fill: '#dc2626', fontSize: 9, position: 'insideTopLeft' }} />
              <Area yAxisId="left" type="monotone" dataKey="temperature" name="體溫 (T)" fill="#fca5a5" stroke="#dc2626" strokeWidth={2} dot={{ r: 4, fill: '#dc2626' }} />
              <Line yAxisId="right" type="monotone" dataKey="pulse" name="心跳 (P)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} />
            </ComposedChart>
          ) : activeMetric === 'bp' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[40, 200]} tick={{ fontSize: 10, fill: '#475569' }} unit="mmHg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any, name: string) => {
                  if (name === '收縮壓 (SBP)') return [`${value} mmHg`, '收縮壓'];
                  if (name === '舒張壓 (DBP)') return [`${value} mmHg`, '舒張壓'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '收縮壓高標 140', fill: '#d97706', fontSize: 9, position: 'insideTopLeft' }} />
              <ReferenceLine y={90} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="systolic" name="收縮壓 (SBP)" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="diastolic" name="舒張壓 (DBP)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#059669' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(value: any) => [`${value} %`, '血氧濃度 (SpO2)']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <ReferenceLine y={95} stroke="#d97706" strokeDasharray="3 3" label={{ value: '警戒點 95%', fill: '#b45309', fontSize: 9, position: 'insideTopLeft' }} />
              <Area type="monotone" dataKey="spo2" name="血氧 (SpO2)" fill="#a7f3d0" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 border border-gray-300 rounded p-2 text-xs font-sans print:hidden">
      {/* Chart Control Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <ChartIcon className="w-4 h-4 text-blue-600" />
          <span>24小時生命徵象趨勢分析</span>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center space-x-1 bg-gray-200/80 p-0.5 rounded-lg text-[10px]">
          <button
            type="button"
            onClick={() => setActiveMetric('tempPulse')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              activeMetric === 'tempPulse' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            體溫/脈搏
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('bp')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              activeMetric === 'bp' ? 'bg-white text-rose-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            血壓 (BP)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('spo2')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              activeMetric === 'spo2' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            血氧 (SpO2)
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-200 transition"
          title="全螢幕放大圖表"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render Embedded Chart */}
      {renderChartContent(180)}

      {/* Expanded Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    生命徵象波動趨勢圖 - [{bedNo || '病患'}] {patientName}
                  </h3>
                  <p className="text-xs text-slate-500">協助護理師快速辨識發燒、發炎與血壓極值波動</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metric Buttons */}
            <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-1 rounded-xl w-fit text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMetric('tempPulse')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMetric === 'tempPulse' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                }`}
              >
                體溫 (°C) & 脈搏 (bpm)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('bp')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMetric === 'bp' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-600'
                }`}
              >
                收縮壓 / 舒張壓 (mmHg)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('spo2')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeMetric === 'spo2' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'
                }`}
              >
                血氧飽和度 SpO2 (%)
              </button>
            </div>

            {renderChartContent(320)}

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>數據即時連動交班卡紀錄，點擊主表單數字即可編輯。</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
