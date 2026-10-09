import React, { useState } from 'react';
import { BodyMarker } from '../types';
import { Plus, Trash2, MapPin, Activity, ShieldAlert, Crosshair, Sparkles } from 'lucide-react';

interface Props {
  markers: BodyMarker[];
  onChangeMarkers: (markers: BodyMarker[]) => void;
  readOnly?: boolean;
}

export const InteractiveBodyDiagram: React.FC<Props> = ({
  markers,
  onChangeMarkers,
  readOnly = false,
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [selectedCategory, setSelectedCategory] = useState<BodyMarker['category']>('line');
  const [newLabel, setNewLabel] = useState('');
  const [newNote, setNewNote] = useState('');
  const [addingPoint, setAddingPoint] = useState<{ x: number; y: number } | null>(null);

  const filteredMarkers = markers.filter((m) => m.view === activeView);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setAddingPoint({ x, y });
  };

  const handleConfirmAddMarker = () => {
    if (!addingPoint) return;
    const newMarker: BodyMarker = {
      id: `marker-${Date.now()}`,
      x: addingPoint.x,
      y: addingPoint.y,
      view: activeView,
      category: selectedCategory,
      label: newLabel || (selectedCategory === 'line' ? '管路標記' : selectedCategory === 'wound' ? '傷口' : '處置點'),
      note: newNote,
    };
    onChangeMarkers([...markers, newMarker]);
    setAddingPoint(null);
    setNewLabel('');
    setNewNote('');
  };

  const handleRemoveMarker = (id: string) => {
    if (readOnly) return;
    onChangeMarkers(markers.filter((m) => m.id !== id));
  };

  const getCategoryColor = (cat: BodyMarker['category']) => {
    switch (cat) {
      case 'line':
        return 'bg-blue-600 text-white border-blue-800';
      case 'wound':
        return 'bg-red-600 text-white border-red-800';
      case 'drain':
        return 'bg-amber-500 text-white border-amber-700';
      case 'pain':
        return 'bg-purple-600 text-white border-purple-800';
      default:
        return 'bg-emerald-600 text-white border-emerald-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-black p-2 rounded-none text-xs">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-300 print:hidden">
        <div className="flex items-center space-x-1 font-bold text-gray-800">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>人體圖標記 ({activeView === 'front' ? '正面 Front' : '背面 Back'})</span>
        </div>
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => setActiveView('front')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activeView === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            正面 Front
          </button>
          <button
            type="button"
            onClick={() => setActiveView('back')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              activeView === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            背面 Back
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="relative flex-1 min-h-[220px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded p-1 select-none overflow-hidden">
        {/* Helper message */}
        {!readOnly && (
          <div className="absolute top-1 left-1 text-[10px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200 z-10 print:hidden">
            點擊人體圖任意位置新增管路/傷口標記
          </div>
        )}

        {/* Human Silhouette SVG */}
        <svg
          viewBox="0 0 200 400"
          className="w-full h-full max-h-[260px] cursor-crosshair touch-none"
          onClick={handleSvgClick}
        >
          {/* Subtle Background Grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="400" fill="url(#grid)" />

          {/* Human Body Path Outline */}
          {activeView === 'front' ? (
            /* Front View Silhouette */
            <g stroke="#333333" strokeWidth="1.5" fill="#f8fafc" strokeLinecap="round" strokeLinejoin="round">
              {/* Head */}
              <ellipse cx="100" cy="45" rx="22" ry="26" />
              {/* Neck */}
              <path d="M 88 68 L 88 80 L 112 80 L 112 68 Z" />
              {/* Shoulders & Torso */}
              <path d="M 88 80 C 65 85, 50 95, 42 120 L 32 180 L 26 230 C 24 240, 32 245, 36 235 L 48 185 L 56 185 L 58 260 C 58 280, 80 280, 80 260 L 78 180 L 122 180 L 120 260 C 120 280, 142 280, 142 260 L 144 185 L 152 185 L 164 235 C 168 245, 176 240, 174 230 L 168 180 L 158 120 C 150 95, 135 85, 112 80 Z" />
              {/* Chest line */}
              <path d="M 80 120 Q 100 130 120 120" stroke="#cbd5e1" strokeWidth="1" />
              {/* Abdomen line */}
              <circle cx="100" cy="175" r="2" fill="#94a3b8" stroke="none" />
              {/* Legs */}
              <path d="M 62 260 L 66 330 L 64 380 Q 64 390 74 390 Q 82 390 82 380 L 88 320 L 98 250" />
              <path d="M 138 260 L 134 330 L 136 380 Q 136 390 126 390 Q 118 390 118 380 L 112 320 L 102 250" />
            </g>
          ) : (
            /* Back View Silhouette */
            <g stroke="#333333" strokeWidth="1.5" fill="#f1f5f9" strokeLinecap="round" strokeLinejoin="round">
              {/* Head Back */}
              <ellipse cx="100" cy="45" rx="22" ry="26" fill="#e2e8f0" />
              {/* Neck */}
              <path d="M 88 68 L 88 80 L 112 80 L 112 68 Z" />
              {/* Spine line */}
              <path d="M 100 80 L 100 230" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
              {/* Torso Back */}
              <path d="M 88 80 C 65 85, 50 95, 42 120 L 32 180 L 26 230 C 24 240, 32 245, 36 235 L 48 185 L 56 185 L 58 260 C 58 280, 80 280, 80 260 L 78 180 L 122 180 L 120 260 C 120 280, 142 280, 142 260 L 144 185 L 152 185 L 164 235 C 168 245, 176 240, 174 230 L 168 180 L 158 120 C 150 95, 135 85, 112 80 Z" />
              {/* Sacrum area */}
              <path d="M 85 220 Q 100 235 115 220" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              {/* Legs Back */}
              <path d="M 62 260 L 66 330 L 64 380 Q 64 390 74 390 Q 82 390 82 380 L 88 320 L 98 250" />
              <path d="M 138 260 L 134 330 L 136 380 Q 136 390 126 390 Q 118 390 118 380 L 112 320 L 102 250" />
            </g>
          )}

          {/* Render Markers on Top */}
          {filteredMarkers.map((marker) => {
            const cx = (marker.x / 100) * 200;
            const cy = (marker.y / 100) * 400;
            const isWound = marker.category === 'wound';
            const isDrain = marker.category === 'drain';

            return (
              <g key={marker.id} className="group cursor-pointer">
                {/* Pulse Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="none"
                  stroke={isWound ? '#ef4444' : isDrain ? '#f59e0b' : '#3b82f6'}
                  strokeWidth="1"
                  className="animate-ping opacity-75"
                />
                {/* Solid Marker Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill={isWound ? '#dc2626' : isDrain ? '#d97706' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Marker Text Label beside circle */}
                <text
                  x={cx + 8}
                  y={cy + 3}
                  fontSize="9"
                  fontWeight="bold"
                  fill="#000000"
                  className="font-sans"
                >
                  {marker.label}
                </text>
              </g>
            );
          })}

          {/* Temporary Point when clicked */}
          {addingPoint && (
            <g>
              <circle
                cx={(addingPoint.x / 100) * 200}
                cy={(addingPoint.y / 100) * 400}
                r="7"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* Modal/Popover to configure new marker */}
        {addingPoint && (
          <div className="absolute inset-x-2 bottom-2 bg-white border border-gray-800 p-2 rounded shadow-lg z-20 text-xs">
            <div className="flex items-center justify-between font-bold mb-1 border-b pb-1 text-gray-800">
              <span>新增體表標記點</span>
              <button
                type="button"
                onClick={() => setAddingPoint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex space-x-1">
                {(['line', 'wound', 'drain', 'pain'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-1 py-0.5 text-[10px] rounded border font-medium ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    {cat === 'line' ? '管路' : cat === 'wound' ? '傷口' : cat === 'drain' ? '引流' : '疼痛'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="標記名稱 (如: IC 20G / Foley / 尾骶骨壓傷)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="詳細說明/尺寸/敷料狀況 (可選)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-1 pt-1">
                <button
                  type="button"
                  onClick={() => setAddingPoint(null)}
                  className="px-2 py-0.5 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddMarker}
                  className="px-2 py-0.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  確認儲存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marker Legend & List */}
      <div className="mt-1 pt-1 border-t border-gray-200">
        <div className="text-[10px] font-bold text-gray-700 mb-0.5">標記清單 ({filteredMarkers.length})：</div>
        {filteredMarkers.length === 0 ? (
          <div className="text-[10px] text-gray-400 italic">目前此面無標記項目</div>
        ) : (
          <div className="max-h-[70px] overflow-y-auto space-y-1">
            {filteredMarkers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-[11px] bg-gray-50 px-1.5 py-0.5 border border-gray-200 rounded"
              >
                <div className="flex items-center space-x-1 overflow-hidden">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      m.category === 'wound' ? 'bg-red-600' : m.category === 'drain' ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                  />
                  <span className="font-bold truncate text-gray-800">{m.label}:</span>
                  <span className="text-gray-600 truncate">{m.note || '無備註'}</span>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMarker(m.id)}
                    className="text-red-500 hover:text-red-700 ml-1 p-0.5 print:hidden"
                    title="刪除標記"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
