export interface LabStandardItem {
  key: string;
  category: string;
  item: string;
  unit: string;
  normalRange: string;
  criticalCriteria: string;
  clinicalNote: string;
}

export const LAB_STANDARDS: LabStandardItem[] = [
  // --- 血液學檢查 Hematology ---
  {
    key: 'wbc',
    category: '血液學檢查 (Hematology)',
    item: 'WBC (白血球)',
    unit: '/μL',
    normalRange: '4,000 ～ 10,000 /μL',
    criticalCriteria: '> 10,000 (白血球過高) 或 < 4,000 (白血球過低)',
    clinicalNote: '>10,000 提示急性感染、發炎或白血病；<4,000 提示免疫抑制、嚴重敗血症或骨髓受損。危急值 <2,000 或 >30,000 需急通報。',
  },
  {
    key: 'hb',
    category: '血液學檢查 (Hematology)',
    item: 'Hb / Hgb (血紅素)',
    unit: 'g/dL',
    normalRange: '男: 13.0 ～ 18.0 / 女: 12.0 ～ 16.0 g/dL',
    criticalCriteria: '< 10.0 (貧血警戒) / < 8.0 (高度貧血/需輸血)',
    clinicalNote: 'Hb < 8.0 g/dL 需評估輸血 (PRBC) 需求，注意姿勢性低血壓、頭暈與出血點監測。危急值 <7.0 g/dL。',
  },
  {
    key: 'plt',
    category: '血液學檢查 (Hematology)',
    item: 'Plt (血小板)',
    unit: '/μL',
    normalRange: '150,000 ～ 400,000 /μL (150-400 K)',
    criticalCriteria: '< 100,000 (血小板低下) / < 20,000 (自發性出血危急值)',
    clinicalNote: '<100,000 需防範撞傷與出血；<20,000 易發生自發性顱內或腸胃道出血，應緊急通報與輸血小板。',
  },

  // --- 電解質與生化 Electrolytes & Biochemistry ---
  {
    key: 'na',
    category: '電解質與生化 (Electrolytes)',
    item: 'Na (血鈉離子)',
    unit: 'mEq/L',
    normalRange: '135 ～ 145 mEq/L',
    criticalCriteria: '< 135 (低血鈉) 或 > 145 (高血鈉)',
    clinicalNote: '低血鈉 (<130) 可致嗜睡、噁心、意識不清、抽搐；高血鈉 (>150) 易致脫水、意識障礙。危急值 <120 或 >160 mEq/L。',
  },
  {
    key: 'k',
    category: '電解質與生化 (Electrolytes)',
    item: 'K (血鉀離子)',
    unit: 'mEq/L',
    normalRange: '3.5 ～ 5.0 mEq/L',
    criticalCriteria: '< 3.5 (低血鉀) 或 > 5.0 (高血鉀)',
    clinicalNote: '高血鉀 (>5.5) 具致命心律不整 (Peaked T) 風險，需急給 RI+D50、Kalimate；低血鉀 (<3.0) 易心悸、肌肉無力，應補 KCl。危急值 <2.8 或 >6.0 mEq/L。',
  },
  {
    key: 'ca',
    category: '電解質與生化 (Electrolytes)',
    item: 'Ca (血鈣離子)',
    unit: 'mg/dL',
    normalRange: '8.5 ～ 10.5 mg/dL (iCa: 4.5~5.3 mg/dL)',
    criticalCriteria: '< 8.5 (低血鈣) 或 > 10.5 (高血鈣)',
    clinicalNote: '低血鈣 (<7.0) 易致手足抽搐 (Trousseau/Chvostek sign)、QT延長與心律不整，應補 Calcium Gluconate；高血鈣 (>12.0) 易致便秘、腎結石與意識模糊。危急值 <6.0 或 >13.0 mg/dL。',
  },
  {
    key: 'mg',
    category: '電解質與生化 (Electrolytes)',
    item: 'Mg (血鎂離子)',
    unit: 'mg/dL',
    normalRange: '1.8 ～ 2.4 mg/dL',
    criticalCriteria: '< 1.8 (低血鎂) 或 > 2.4 (高血鎂)',
    clinicalNote: '低血鎂 (<1.2) 常伴隨難治性低血鉀/低血鈣，具致命心律不整 (Torsades de Pointes) 風險，需給予 MgSO4；高血鎂 (>3.0) 會抑制深腱反射 (DTR) 與呼吸。危急值 <1.0 或 >4.0 mg/dL。',
  },
  {
    key: 'p',
    category: '電解質與生化 (Electrolytes)',
    item: 'P / Pi (血磷離子)',
    unit: 'mg/dL',
    normalRange: '2.5 ～ 4.5 mg/dL',
    criticalCriteria: '< 2.5 (低血磷) 或 > 4.5 (高血磷)',
    clinicalNote: '低血磷 (<1.0) 易致肌肉無力、橫紋肌溶解與呼吸衰竭；高血磷 (>5.0) 常見於末期腎病 (ESRD)，易致血管鈣化與搔癢，需依醫囑給予降磷劑 (Caltrate/Renagel)。危急值 <1.0 mg/dL。',
  },

  // --- 腎功能與肝功能 Renal & Liver Function ---
  {
    key: 'bun',
    category: '腎肝功能 (Renal & Liver)',
    item: 'BUN (血尿素氮)',
    unit: 'mg/dL',
    normalRange: '7 ～ 20 mg/dL',
    criticalCriteria: '> 20 mg/dL (腎功能受損/脫水)',
    clinicalNote: '>20 mg/dL 提示腎功能下降、消化道出血、高蛋白飲食或脫水，需搭配 Cr 綜合評估。',
  },
  {
    key: 'cr',
    category: '腎肝功能 (Renal & Liver)',
    item: 'Cr / Creatinine (肌酸酐)',
    unit: 'mg/dL',
    normalRange: '0.5 ～ 1.2 mg/dL',
    criticalCriteria: '> 1.2 mg/dL (急性腎損傷 AKI 警戒)',
    clinicalNote: '>1.2 mg/dL 提示腎功能不全；若指數倍增提示 AKI，應嚴格紀錄 I/O 水份平衡並避免腎毒性藥物。',
  },
  {
    key: 'egfr',
    category: '腎肝功能 (Renal & Liver)',
    item: 'eGFR (腎小球過濾率)',
    unit: 'mL/min/1.73m²',
    normalRange: '≥ 90 mL/min/1.73m²',
    criticalCriteria: '< 60 (慢性腎臟病 CKD) / < 15 (末期腎衰竭)',
    clinicalNote: '<60 mL/min 為腎功能中重度受損；<15 mL/min 需評估洗腎 (Hemodialysis/PD) 需求。',
  },
  {
    key: 'got_gpt',
    category: '腎肝功能 (Renal & Liver)',
    item: 'GOT (AST) / GPT (ALT)',
    unit: 'U/L',
    normalRange: '0 ～ 35 U/L',
    criticalCriteria: '> 40 U/L (肝細胞發炎/受損)',
    clinicalNote: '>40 U/L 提示肝炎、藥物性肝傷害或缺血；>500 U/L 提示急性肝壞死或膽道阻塞。',
  },

  // --- 發炎指標與心肌標記 Inflammatory & Cardiac ---
  {
    key: 'crp',
    category: '發炎與心肌標記 (Markers)',
    item: 'CRP (C-反應蛋白)',
    unit: 'mg/dL',
    normalRange: '< 0.8 mg/dL (或 < 8 mg/L)',
    criticalCriteria: '> 0.8 mg/dL (發炎/感染警戒) / > 10.0 (嚴重急性感染)',
    clinicalNote: '急性感染與全身發炎黃金指標。>10.0 mg/dL 提示嚴重細菌感染、敗血症，需評估抗生素療效。',
  },
  {
    key: 'pct',
    category: '發炎與心肌標記 (Markers)',
    item: 'PCT (降鈣素原)',
    unit: 'ng/mL',
    normalRange: '< 0.05 ng/mL',
    criticalCriteria: '≥ 0.5 (細菌感染) / ≥ 2.0 (敗血症高風險)',
    clinicalNote: '鑑別細菌性與病毒性感染極佳指標。≥2.0 ng/mL 提示全身敗血症 (Sepsis) 高風險。',
  },
  {
    key: 'troponin',
    category: '發炎與心肌標記 (Markers)',
    item: 'Troponin-I / T (心肌肌鈣蛋白)',
    unit: 'ng/mL',
    normalRange: '< 0.04 ng/mL',
    criticalCriteria: '≥ 0.04 ng/mL (心肌受損/梗塞危急值)',
    clinicalNote: '急性心肌梗塞 (AMI) 特異性指標。高於 0.04 需緊急做 12 導程 EKG、給予 MONA 處置並會診心臟科。',
  },

  // --- 凝血功能 Coagulation Panel ---
  {
    key: 'pt_inr',
    category: '凝血功能 (Coagulation)',
    item: 'PT (秒) / INR',
    unit: '秒 / 比值',
    normalRange: 'PT: 10～13秒 / INR: 0.8～1.2',
    criticalCriteria: 'INR > 1.5 (無服藥) / INR > 3.5 (使用 Warfarin)',
    clinicalNote: '延長提示凝血因子缺乏或肝疾病；INR > 3.5 易發生出血，應注意觀察皮下瘀斑、黑便與血尿。危急值 INR > 5.0。',
  },
  {
    key: 'aptt',
    category: '凝血功能 (Coagulation)',
    item: 'APTT (部分凝血活酶時間)',
    unit: '秒',
    normalRange: '25.0 ～ 35.0 秒',
    criticalCriteria: '> 40 秒 (凝血功能延長)',
    clinicalNote: '監測 Heparin 使用效果。>40 秒需評估出血風險；連續治療目標為正常值的 1.5～2.5 倍。危急值 >100 秒。',
  },

  // --- 動脈血氣分析 ABG ---
  {
    key: 'abg_ph',
    category: '動脈血氣分析 (ABG)',
    item: 'ABG - pH (酸鹼度)',
    unit: '-',
    normalRange: '7.35 ～ 7.45',
    criticalCriteria: '< 7.35 (酸血症) 或 > 7.45 (鹼血症)',
    clinicalNote: '<7.35 提示代謝性或呼吸性酸中毒；危急值 <7.20 或 >7.60 易致命，需急報備處理。',
  },
  {
    key: 'abg_paco2',
    category: '動脈血氣分析 (ABG)',
    item: 'ABG - PaCO2 (二氧化碳分壓)',
    unit: 'mmHg',
    normalRange: '35 ～ 45 mmHg',
    criticalCriteria: '> 45 (高碳酸血症) 或 < 35 (低碳酸血症)',
    clinicalNote: '>45 mmHg 提示呼吸抑制、COPD 滯留；>60 mmHg 具 CO2 迷輻/昏迷風險。危急值 >65 或 <20 mmHg。',
  },
  {
    key: 'abg_pao2',
    category: '動脈血氣分析 (ABG)',
    item: 'ABG - PaO2 (氧氣分壓)',
    unit: 'mmHg',
    normalRange: '80 ～ 100 mmHg',
    criticalCriteria: '< 80 mmHg (低血氧症) / < 60 mmHg (呼吸衰竭)',
    clinicalNote: '<60 mmHg 提示 PaO2 嚴重大幅下降，需調整 O2 流量或使用 BiPAP/插管。危急值 <40 mmHg。',
  },
  {
    key: 'abg_hco3',
    category: '動脈血氣分析 (ABG)',
    item: 'ABG - HCO3- (重碳酸根)',
    unit: 'mEq/L',
    normalRange: '22 ～ 26 mEq/L',
    criticalCriteria: '< 22 (代謝性酸中毒) 或 > 26 (代謝性鹼中毒)',
    clinicalNote: '<22 mEq/L 提示代謝性酸中毒 (酮酸中毒、腎衰竭)，可能需補充 Bicarb (NaHCO3)。危急值 <10 或 >40 mEq/L。',
  },
];
