export type IsolationType = 'Contact' | 'Droplet' | 'Airborne' | 'Protective' | 'Other';

export interface DiagnosisItem {
  id: string;
  hospital: string; // 醫院
  dept: string; // 科別
  diagnosis: string; // 診斷
  doctor: string; // 醫師
}

export interface PatientBasicInfo {
  bedNo: string;
  name?: string;
  chartNo?: string;
  age?: string;
  admissionDate?: string;
  gender: '男' | '女' | '其他';
  dept: string; // 長照專區/樓層 (如：松柏養護區 2F)
  doctor: string;
  coCare: string;
  diagnosis: string; // 診斷摘要字串 (供搜尋與相容)
  diagnosisList?: DiagnosisItem[]; // 表格式多筆診斷：(醫院)(科別)(診斷)(醫師)
  diet?: string; // 飲食型態與吞嚥照護
  allergy?: string; // 藥物與食物過敏史
  fallRisk?: string; // 跌倒風險評估 (下拉選單)
  bradenRisk?: string; // Braden 壓傷風險評估 (下拉選單)
  cmsLevel?: string; // 長照 CMS 等級 / ADL 巴氏量表 (下拉選單)
  dnrStatus?: string; // 預立醫療決定 / DNR 狀態 (下拉選單)
  hospitalPref?: string;
  isIsolated: boolean;
  isolationType: string; // 感控防護監測 (單一格整合)
  isolationReason: string;
}

export interface InvasiveLines {
  // 長照三管與生活輔具
  ng: string; // 鼻胃管 (材質/管徑/深度/更換到期日)
  foley: string; // 導尿管 (材質/Fr/水球/更換到期日)
  trEndo: string; // 氣切管 (規格/型號/更換到期日)
  peg?: string; // 胃造廔/腸造廔 (PEG/Stoma)
  oxygen?: string; // 氧氣與抽痰需求 (O2 / SpO2 目標)
  mobilityAid?: string; // 行動與減壓輔具 (輪椅/助行器/氣墊床)
  prosthesis?: string; // 生活感官輔具 (假牙/助聽器/眼鏡)
  // 相容舊資料欄位 (選填)
  ic1?: string;
  ic2?: string;
  cvc?: string;
  dl?: string;
  av?: string;
  drain?: string;
  portA?: string;
}

export interface LtcCareAssessment {
  adlScore: string; // 移位與進食自理 (選單)
  continence: string; // 大小便與排尿管理 (選單)
  lastStoolDate: string; // 排便狀態與最後解便日
  turningSchedule: string; // 翻身減壓與約束評估 (選單)
  restraintNote: string; // 復健與情緒睡眠 (選單)
  rehabActivity: string;
  sleepMood: string;
  weightBmi: string; // 體重與BMI
}

export interface LabItem {
  id: string;
  item: string;
  value: string;
  action: string;
}

export interface OpExamItem {
  id: string;
  date: string;
  time: string;
  content: string; // 門診回診 / 巡診 / 復健排程 / 疫苗接種
}

export interface BloodPrepItem {
  id: string;
  type: 'prep' | 'transfuse';
  product: string;
  prepAmount: string;
  transfusedAmount: string;
}

export interface TotalIO {
  intakeDay: string;
  outputDay: string;
  intakeNight?: string;
  outputNight?: string;
  balance: string;
}

export interface VitalSignColumn {
  id: string;
  time: string;
  T: string;
  P: string;
  R: string;
  BP: string;
  SpO2: string;
  GCS: string;
  Pain: string;
  action?: string;
}

export interface ConsultItem {
  id: string;
  dept: string;
  note: string;
}

export interface WoundRecord {
  site: string;
  description: string;
}

export interface BodyMarker {
  id: string;
  x: number;
  y: number;
  view: 'front' | 'back';
  category: 'line' | 'wound' | 'pain' | 'drain' | 'other';
  label: string;
  note: string;
  color?: string;
}

export interface UdDrugItem {
  id: string;
  drugName: string; // 慢性處方藥名 / 特殊給藥
  route: string; // PO / 管灌磨粉 / SC / 外用
  schedule: string; // QD / BID / TID / HS / PRN
  note: string; // 服藥注意事項
}

export type TodoCategory =
  | '管路更換'
  | '門診回診'
  | '特殊給藥'
  | '翻身換藥'
  | '抽血檢驗'
  | '家屬溝通'
  | '日常照護';

export interface TodoItem {
  id: string;
  category: TodoCategory;
  content: string;
  dueTime: string;
  priority: 'urgent' | 'normal' | 'routine';
  completed: boolean;
  assignedRole?: string;
}

export type StickyNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
export type StickyNoteTag = '急件' | '待辦' | '醫師囑咐' | '交班提醒' | '採血用藥' | '衛教備忘' | '一般';

export interface StickyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StickyNote {
  id: string;
  patientId?: string;
  title: string;
  content: string;
  color: StickyNoteColor;
  tag: StickyNoteTag;
  checklist?: StickyChecklistItem[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverRecord {
  id: string;
  patientInfo: PatientBasicInfo;
  lines: InvasiveLines;
  ltcCare?: LtcCareAssessment;
  labs: LabItem[];
  opExams: OpExamItem[];
  bloodPreps?: BloodPrepItem[];
  totalIO?: TotalIO;
  udDrugs: UdDrugItem[];
  vitalSigns: VitalSignColumn[];
  consults: ConsultItem[];
  wounds: WoundRecord[];
  bodyMarkers: BodyMarker[];
  todoItems?: TodoItem[];
  receiveNote: string;
  handoverNoteISBAR: string;
  lastUpdated: string;
  stickyNotes?: StickyNote[];
}
