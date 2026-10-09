export interface VitalSignStandardItem {
  key: string;
  label: string;
  unit: string;
  normalRange: string;
  abnormalCriteria: string;
  clinicalNote: string;
}

export const VITAL_SIGN_STANDARDS: Record<string, VitalSignStandardItem> = {
  temp: {
    key: 'T',
    label: '體溫 Temperature (T)',
    unit: '°C',
    normalRange: '36.0°C ～ 37.5°C',
    abnormalCriteria: '≥ 38.0°C (發燒 / Fever) 或 ≤ 35.0°C (低體溫 / Hypothermia)',
    clinicalNote: '高燒警示：當 T ≥ 38.0°C 時，需給予退燒處置、冰枕、溫水拭浴或報備醫師，並於「處置/報備」欄位記錄。',
  },
  pulse: {
    key: 'P',
    label: '脈搏 Pulse (P)',
    unit: 'bpm',
    normalRange: '60 ～ 100 bpm',
    abnormalCriteria: '> 100 bpm (心跳過快 / Tachycardia) 或 < 60 bpm (心跳過慢 / Bradycardia)',
    clinicalNote: '極端警示：當 P ≥ 120 bpm 或 P ≤ 50 bpm 時，應立即評估心律與血壓，並通報醫師。',
  },
  resp: {
    key: 'R',
    label: '呼吸 Respiration (R)',
    unit: '次/分',
    normalRange: '12 ～ 20 次/分',
    abnormalCriteria: '> 20 次/分 (呼吸急促 / Tachypnea) 或 < 12 次/分 (呼吸過慢 / Bradypnea)',
    clinicalNote: '極端警示：當 R ≥ 24 次/分 或 R ≤ 10 次/分 時，需注意呼吸衰竭風險，配合血氧（SpO2）監測。',
  },
  bp: {
    key: 'BP',
    label: '血壓 Blood Pressure (BP)',
    unit: 'mmHg',
    normalRange: '收縮壓 90～120 mmHg / 舒張壓 60～80 mmHg',
    abnormalCriteria: '收縮壓 ≥ 140 或 ≤ 90 mmHg / 舒張壓 ≥ 90 或 ≤ 60 mmHg',
    clinicalNote: '高血壓/低血壓警示：SBP ≥ 140 mmHg 為高血壓警戒，SBP ≤ 90 mmHg 為休克低血壓警戒，需追蹤平躺與處置。',
  },
  spo2: {
    key: 'SpO2',
    label: '血氧飽和度 SpO2',
    unit: '%',
    normalRange: '95% ～ 100%',
    abnormalCriteria: '< 95% (低血氧 / Hypoxia)',
    clinicalNote: '危急警示：SpO2 < 95% 需給予 O2 鼻導管/面罩，< 90% 需緊急報備醫師與準備抽痰/抽血。',
  },
  pain: {
    key: 'Pain',
    label: '疼痛評分 Pain Score',
    unit: '分 (0~10)',
    normalRange: '0 ～ 3 分 (無痛至輕度疼痛)',
    abnormalCriteria: '≥ 4 分 (中重度疼痛 / Moderate to Severe)',
    clinicalNote: '處置警示：Pain ≥ 4 分需即時評估疼痛位置、性質，並執行給予止痛藥、變換體位等處置。',
  },
  gcs: {
    key: 'GCS',
    label: '意識昏迷指數 GCS',
    unit: '分 (3~15)',
    normalRange: 'E4V5M6 (15分)',
    abnormalCriteria: '< 15 分 或 E/V/M 變化',
    clinicalNote: '意識警示：GCS 較前次下降 2 分以上，需立即神經學評估並緊急通報醫師。',
  },
};

// Functions to check individual values
export function isTempAbnormal(value: string | undefined): boolean {
  if (!value) return false;
  const val = parseFloat(value);
  if (isNaN(val)) return false;
  return val >= 38.0 || val <= 35.0;
}

export function isPulseAbnormal(value: string | undefined): boolean {
  if (!value) return false;
  const val = parseFloat(value);
  if (isNaN(val)) return false;
  return val > 100 || val < 60;
}

export function isRespAbnormal(value: string | undefined): boolean {
  if (!value) return false;
  const val = parseFloat(value);
  if (isNaN(val)) return false;
  return val > 20 || val < 12;
}

export function isBpAbnormal(value: string | undefined): boolean {
  if (!value || !value.includes('/')) return false;
  const parts = value.split('/');
  const sbp = parseFloat(parts[0]);
  const dbp = parseFloat(parts[1]);
  const isSbpAbnormal = !isNaN(sbp) && (sbp >= 140 || sbp <= 90);
  const isDbpAbnormal = !isNaN(dbp) && (dbp >= 90 || dbp <= 60);
  return isSbpAbnormal || isDbpAbnormal;
}

export function isSpo2Abnormal(value: string | undefined): boolean {
  if (!value) return false;
  const val = parseFloat(value);
  if (isNaN(val)) return false;
  return val < 95;
}

export function isPainAbnormal(value: string | undefined): boolean {
  if (!value) return false;
  const val = parseFloat(value);
  if (isNaN(val)) return false;
  return val >= 4;
}

export function isGcsAbnormal(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return false;
  // If explicitly '15' or 'E4V5M6', it's normal
  if (trimmed === '15' || trimmed === 'E4V5M6') return false;
  // Try parsing total score if purely numeric
  const val = parseFloat(trimmed);
  if (!isNaN(val) && val >= 15) return false;
  return true;
}
