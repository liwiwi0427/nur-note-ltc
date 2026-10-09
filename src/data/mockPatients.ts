import { HandoverRecord } from '../types';

export const INITIAL_PATIENTS: HandoverRecord[] = [
  {
    id: 'resident-a201-1',
    patientInfo: {
      bedNo: 'A201-1',
      name: '陳福來',
      chartNo: '',
      age: '84歲',
      admissionDate: '2024/03/15',
      gender: '男',
      dept: '松柏養護區 2F',
      doctor: '',
      coCare: '',
      diagnosis: '左側大腦中風後右側偏癱、血管性失智症、第2型糖尿病、高血壓',
      diagnosisList: [
        {
          id: 'diag-1',
          hospital: '台大醫院',
          dept: '神經內科',
          diagnosis: '左側大腦中風後右側偏癱、血管性失智症',
          doctor: '林志明 醫師',
        },
        {
          id: 'diag-2',
          hospital: '台大醫院',
          dept: '新陳代謝科',
          diagnosis: '第2型糖尿病、原發性高血壓',
          doctor: '周雅雯 醫師',
        },
      ],
      diet: '鼻胃管灌食 (糖尿病低GI配方 1500 kcal/日)',
      allergy: 'NSAIDs 類止痛藥 (眼瞼水腫)',
      fallRisk: '跌倒高風險 (≥45分)',
      bradenRisk: '壓傷高風險 (Braden 10-12分)',
      cmsLevel: 'CMS 第7級 · ADL 20-30分 (完全/重度依賴)',
      dnrStatus: '已簽署 DNR (不施行心肺復甦術)',
      hospitalPref: '',
      isIsolated: false,
      isolationType: '無須隔離 (一般照護)',
      isolationReason: '',
    },
    lines: {
      ng: '16Fr 矽膠管 55cm (置入:09/15 · 到期:10/15)',
      foley: '16Fr 矽膠尿管 水球10ml (置入:09/18 · 到期:10/18)',
      trEndo: '無',
      peg: '無',
      oxygen: 'PRN 氧氣鼻導管 2L/min (目標 SpO2 ≥ 94%)',
      mobilityAid: '高背傾躺輪椅 + 減壓交替式氣墊床 + 移位腰帶',
      prosthesis: '上顎活動假牙 (收存於床頭保管盒)',
    },
    ltcCare: {
      adlScore: '完全臥床/輪椅 · 移位需雙人協助 · 管灌飲食',
      continence: '留置導尿管 (Foley 照護) + 大便用尿布',
      lastStoolDate: '今日已解軟便 (10/06 黃軟便1次)',
      turningSchedule: 'Q2H 翻身拍背 + 氣墊床 + 預防性手套(防拔管)',
      restraintNote: '夜間睡眠平穩 · 每週二四床邊被動關節運動(PROM)',
      rehabActivity: '床邊被動關節運動 (PROM)',
      sleepMood: '夜間睡眠平穩 · 每週二四床邊被動關節運動(PROM)',
      weightBmi: '56.4 kg (+0.2kg) · BMI 21.2',
    },
    labs: [
      { id: 'lab-1', item: 'AC 晨間血糖', value: '142 mg/dL', action: '依醫囑給予 Metformin 管灌' },
      { id: 'lab-2', item: 'HbA1c (季檢)', value: '7.1 % (↑)', action: '調整低GI配方比例' },
      { id: 'lab-3', item: 'Albumin', value: '3.6 g/dL', action: '維持每日管灌蛋白質補充' },
      { id: 'lab-4', item: 'U/A 尿液常規', value: 'WBC 2-5/HPF', action: '鼓勵管灌溫開水每日 600ml 沖洗' },
    ],
    opExams: [
      { id: 'op-1', date: '10/08', time: '09:30', content: '合約家庭醫學科機構定期巡診' },
      { id: 'op-2', date: '10/15', time: '10:00', content: '例行更換矽膠鼻胃管 (NG 16Fr 到期)' },
      { id: 'op-3', date: '10/22', time: '14:00', content: '台大醫院神經內科門診回診領慢箋 (已預約復康巴士)' },
    ],
    udDrugs: [
      { id: 'd-1', drugName: 'Amlodipine (Norvasc) 5mg', route: '管灌磨粉', schedule: 'QD 09:00', note: 'SBP < 100 暫停給藥' },
      { id: 'd-2', drugName: 'Metformin 500mg', route: '管灌磨粉', schedule: 'BID 09/17', note: '隨管灌配方後給' },
      { id: 'd-3', drugName: 'Aspirin (Bokey) 100mg', route: '管灌泡水', schedule: 'QD 13:00', note: '微粒膠囊不可壓碎，溫水泡開灌入' },
      { id: 'd-4', drugName: 'Sennoside (Through) 12mg', route: '管灌磨粉', schedule: 'HS 21:00', note: '今日若已解便 ≥ 3次則暫停' },
    ],
    vitalSigns: [
      { id: 'v1', time: '08:00', T: '36.6', P: '74', R: '16', BP: '132/78', SpO2: '97', GCS: 'E4V4M6', Pain: '0', action: '生命徵象穩定' },
      { id: 'v2', time: '14:00', T: '36.8', P: '78', R: '17', BP: '136/80', SpO2: '96', GCS: 'E4V4M6', Pain: '1', action: '輪椅推至交誼廳活動' },
      { id: 'v3', time: '20:00', T: '36.5', P: '72', R: '16', BP: '128/74', SpO2: '97', GCS: 'E4V4M6', Pain: '0', action: '晚間翻身換藥完成' },
    ],
    consults: [],
    wounds: [
      { site: '尾骶骨處 (Sacrum) Stage II 壓傷', description: '1.5 x 1.2 cm 表淺真皮受損粉紅無腐肉，每班生理食鹽水清潔後貼親水性敷料 (Duoderm)' },
      { site: '雙下肢小腿皮膚', description: '老年乾燥性皮膚炎，沐浴後塗抹保濕乳液保護' },
    ],
    bodyMarkers: [
      { id: 'm1', x: 48, y: 16, view: 'front', category: 'line', label: '矽膠鼻胃管', note: '16Fr 固定於55cm，10/15到期更換' },
      { id: 'm2', x: 48, y: 55, view: 'front', category: 'line', label: '矽膠導尿管', note: '16Fr 固定大腿內側，10/18到期更換' },
      { id: 'm3', x: 35, y: 38, view: 'front', category: 'other', label: '乒乓球護手套', note: '左手穿戴預防拉扯管路，每2小時鬆開檢查循環' },
      { id: 'm4', x: 50, y: 60, view: 'back', category: 'wound', label: '尾骶骨壓傷', note: 'Stage II 1.5x1.2cm Duoderm 敷料保護中' },
    ],
    todoItems: [
      { id: 'todo-1', category: '日常照護', content: '09:00 測量晨間 AC 血糖與血壓並給予慢箋管灌藥物', dueTime: '09:00', priority: 'urgent', completed: true, assignedRole: '護理師' },
      { id: 'todo-2', category: '翻身換藥', content: '尾骶骨 Stage II 壓傷換藥並確認氣墊床壓力設定正常', dueTime: '14:00', priority: 'urgent', completed: false, assignedRole: '護理師' },
      { id: 'todo-3', category: '管路更換', content: '準備 10/15 矽膠鼻胃管 (16Fr) 例行到期更換耗材', dueTime: '10/15', priority: 'normal', completed: false, assignedRole: '護理師' },
    ],
    stickyNotes: [
      {
        id: 'sn-a201-1',
        patientId: 'resident-a201-1',
        title: '管灌消化與防嗆咳提醒',
        content: '灌食前後請維持床頭搖高 45 度至少 1 小時，反抽若 > 100ml 請順延半小時再評估。',
        color: 'yellow',
        tag: '交班提醒',
        checklist: [
          { id: 'chk-1', text: '檢查鼻胃管刻度 55cm 膠帶固定', completed: true },
          { id: 'chk-2', text: '午間檢查左手防護手套末梢血液循環', completed: false },
        ],
        isPinned: true,
        createdAt: '08:30',
        updatedAt: '08:30',
      },
    ],
    receiveNote: '陳爺爺今日精神穩定，早班反抽胃餘量 < 20ml 消化良好。早上已解黃軟便 1 次。尾骶骨壓傷敷料平整無滲液，下午沐浴後請重新換藥並評估周圍皮膚。',
    handoverNoteISBAR: `【長照機構 ISBAR 交班摘要】
I (住民識別): A201-1 床，陳福來爺爺，84歲，CMS 第7級 (ADL 20-30分)，已簽署 DNR。
S (目前照護現況): 中風後半側偏癱與血管性失智，留置 16Fr 矽膠鼻胃管與導尿管，管灌糖尿病配方每日 6 餐。
B (長照背景與風險): 跌倒高風險、壓傷高風險 (Braden 10-12分)，尾骶骨 Stage II 壓傷 1.5x1.2cm 照護中。
A (本班評估): 生命徵象平穩 (BP 132/78, SpO2 97%)，晨間血糖 142 mg/dL，早班解軟便 1 次，尿管引流清澈。
R (下班待辦與交接):
1. 下午沐浴後請更換尾骶骨親水性敷料並記錄面積變化。
2. 維持 Q2H 翻身擺位與管灌後床頭抬高 45 度。`,
    lastUpdated: '2026/10/06 14:20',
  },
  {
    id: 'resident-a202-2',
    patientInfo: {
      bedNo: 'A202-2',
      name: '林淑芬',
      chartNo: '',
      age: '79歲',
      admissionDate: '2025/01/20',
      gender: '女',
      dept: '銀杏失智專區 3F',
      doctor: '',
      coCare: '',
      diagnosis: '阿茲海默氏失智症 (CDR 2.0)、傍晚黃昏症候群、骨質疏鬆症、雙膝退化性關節炎',
      diagnosisList: [
        {
          id: 'diag-201',
          hospital: '亞東紀念醫院',
          dept: '神經內科',
          diagnosis: '阿茲海默氏失智症 (CDR 2.0) 合併黃昏症候群',
          doctor: '陳建國 醫師',
        },
        {
          id: 'diag-202',
          hospital: '亞東紀念醫院',
          dept: '骨科',
          diagnosis: '骨質疏鬆症、雙膝退化性關節炎',
          doctor: '王立文 醫師',
        },
      ],
      diet: '由口進食 (溫和軟質細碎飲食 + 飲水加增稠劑)',
      allergy: 'NKDA (對蝦蟹海鮮過敏)',
      fallRisk: '跌倒高風險 (≥45分)',
      bradenRisk: '無壓傷風險 (Braden 19-23分)',
      cmsLevel: 'CMS 第5級 · ADL 55-60分 (中度依賴)',
      dnrStatus: '已簽署 DNR + AD (預立醫療決定)',
      hospitalPref: '',
      isIsolated: false,
      isolationType: '無須隔離 (一般照護)',
      isolationReason: '',
    },
    lines: {
      ng: '無 (由口進食，需提醒細嚼慢嚥)',
      foley: '無 (日間定時如廁訓練，夜間穿拉拉褲)',
      trEndo: '無',
      peg: '無',
      oxygen: '無 (Room Air SpO2 98%)',
      mobilityAid: '四輪帶煞車助行車 + 離床感應地墊 + 防走失定位手環',
      prosthesis: '老花眼鏡 + 右耳助聽器 (睡前由護理站統一充電保管)',
    },
    ltcCare: {
      adlScore: '輪椅/助行器 · 可部分自理 · 自行進食',
      continence: '日間定時引導如廁 + 夜間復健褲',
      lastStoolDate: '昨日已解便 (10/05 成形軟便1次)',
      turningSchedule: '可自行翻身 + 離床感應墊防跌 (無約束)',
      restraintNote: '傍晚易有黃昏症候群焦慮 · 安排懷舊音樂與摺毛巾活動',
      rehabActivity: '團體健康操與懷舊音樂輔療',
      sleepMood: '傍晚易有黃昏症候群焦慮 · 安排懷舊音樂與摺毛巾活動',
      weightBmi: '48.5 kg (持平) · BMI 20.8',
    },
    labs: [
      { id: 'lab-201', item: 'Ca 血鈣', value: '9.1 mg/dL', action: '持續補充鈣片與每日日照活動' },
      { id: 'lab-202', item: 'Vit D (25-OH)', value: '24 ng/mL (↓)', action: '依醫囑補充 Vitamin D3 800IU QD' },
    ],
    opExams: [
      { id: 'op-201', date: '10/09', time: '14:00', content: '職能治療師失智症認知促進團體評估' },
      { id: 'op-202', date: '10/18', time: '09:00', content: '亞東醫院神經內科失智共照中心門診追蹤' },
    ],
    udDrugs: [
      { id: 'd-201', drugName: 'Donepezil (Aricept) 10mg', route: 'PO 口服', schedule: 'HS 21:00', note: '失智症用藥，注意有無腸胃不適' },
      { id: 'd-202', drugName: 'Quetiapine (Seroquel) 25mg', route: 'PO 口服', schedule: 'HS / PRN', note: '夜間躁動失眠時使用，服藥後防跌倒' },
      { id: 'd-203', drugName: 'Calcium + Vit D3', route: 'PO 口服', schedule: 'QD 09:00', note: '骨質疏鬆保養' },
    ],
    vitalSigns: [
      { id: 'v201', time: '09:00', T: '36.4', P: '68', R: '16', BP: '124/72', SpO2: '98', GCS: 'E4V4M6', Pain: '1', action: '參加早操活動' },
      { id: 'v202', time: '17:00', T: '36.6', P: '76', R: '18', BP: '130/78', SpO2: '98', GCS: 'E4V4M6', Pain: '2', action: '雙膝微痠已予熱敷安撫' },
    ],
    consults: [],
    wounds: [
      { site: '皮膚完整性良好', description: '無壓傷；右小腿有一處陳舊性抓痕已結痂' },
    ],
    bodyMarkers: [
      { id: 'm201', x: 44, y: 74, view: 'front', category: 'pain', label: '雙膝退化關節痛', note: '陰雨天易痠痛，可予溫敷與護膝保暖' },
    ],
    todoItems: [
      { id: 'todo-201', category: '日常照護', content: '16:00 安排懷舊音樂陪伴與毛巾摺疊活動，預防黃昏症候群躁動', dueTime: '16:00', priority: 'urgent', completed: false, assignedRole: '照服員/社工' },
      { id: 'todo-202', category: '特殊給藥', content: '21:00 睡前給予 Aricept 10mg，收回右耳助聽器放入乾燥盒充電', dueTime: '21:00', priority: 'normal', completed: false, assignedRole: '護理師' },
    ],
    stickyNotes: [
      {
        id: 'sn-a202-1',
        patientId: 'resident-a202-2',
        title: '防跌與助聽器保管注意',
        content: '林奶奶起身時常忘記推助行車，請照服員隨時注意離床鈴響；睡前務必取下右耳助聽器避免遺失。',
        color: 'green',
        tag: '衛教備忘',
        checklist: [
          { id: 'chk-201', text: '確認防走失手環電量充足', completed: true },
          { id: 'chk-202', text: '睡前清點右耳助聽器與老花眼鏡', completed: false },
        ],
        isPinned: true,
        createdAt: '09:10',
        updatedAt: '09:10',
      },
    ],
    receiveNote: '林奶奶中午細碎餐全部吃完，飲水加增稠劑無嗆咳。下午參加音樂團體心情愉快。傍晚 16:30 後請多留意其情緒變化，下床如廁請全程攙扶。',
    handoverNoteISBAR: `【長照機構 ISBAR 交班摘要】
I (住民識別): A202-2 床，林淑芬奶奶，79歲，銀杏失智專區，CMS 第5級 (ADL 55-60分)。
S (目前照護現況): 阿茲海默氏失智症合併傍晚黃昏症候群，由口進食軟質細碎餐，使用助行車移位。
B (長照背景與風險): 跌倒高風險，使用床邊離床感應墊與防走失手環；配戴右耳助聽器。
A (本班評估): 生命徵象穩定，午餐進食量 100%，無嗆咳，雙膝溫敷後活動自如。
R (下班待辦與交接):
1. 傍晚請引導參與懷舊摺衣活動安撫情緒。
2. 睡前給藥後請開啟離床感應墊並清點收回右耳助聽器。`,
    lastUpdated: '2026/10/06 15:00',
  },
  {
    id: 'resident-b105-1',
    patientInfo: {
      bedNo: 'B105-1',
      name: '張金龍',
      chartNo: '',
      age: '76歲',
      admissionDate: '2024/11/08',
      gender: '男',
      dept: '翠竹專業護理區 1F',
      doctor: '',
      coCare: '',
      diagnosis: '慢性阻塞性肺病 (COPD)、帕金森氏症、良性攝護腺肥大、長期氣切留置',
      diagnosisList: [
        {
          id: 'diag-301',
          hospital: '台北榮民總醫院',
          dept: '胸腔內科',
          diagnosis: '慢性阻塞性肺病 (COPD) 合併氣切留置',
          doctor: '陳國棟 醫師',
        },
        {
          id: 'diag-302',
          hospital: '台北榮民總醫院',
          dept: '神經內科',
          diagnosis: '帕金森氏症 (Parkinson Disease)',
          doctor: '趙文豪 醫師',
        },
        {
          id: 'diag-303',
          hospital: '台北榮民總醫院',
          dept: '泌尿科',
          diagnosis: '良性攝護腺肥大 (BPH)',
          doctor: '吳敏修 醫師',
        },
      ],
      diet: '鼻胃管灌食 (肺病高熱量低碳水配方 1600 kcal/日)',
      allergy: 'Penicillin (紅疹)',
      fallRisk: '跌倒高風險 (≥45分)',
      bradenRisk: '壓傷中度風險 (Braden 13-14分)',
      cmsLevel: 'CMS 第8級 · ADL 0-15分 (極重度依賴)',
      dnrStatus: '已簽署 DNR (不施行心肺復甦術)',
      hospitalPref: '',
      isIsolated: true,
      isolationType: '接觸與飛沫防護 (痰液綠膿桿菌移生)',
      isolationReason: '痰液綠膿桿菌移生',
    },
    lines: {
      ng: '16Fr 矽膠鼻胃管 58cm (置入:09/25 · 到期:10/25)',
      foley: '無 (使用尿套與尿布，自解尿液順暢)',
      trEndo: '氣切管 #7.0 矽膠雙管 (置入:09/20 · 到期:10/20)',
      peg: '無',
      oxygen: '氣切潮濕瓶氧氣 O2 Collar 28% 3L/min (維持 SpO2 92-96%)',
      mobilityAid: '高背特製輪椅 + 氣墊床 + 床邊抽痰設備與噴霧治療機',
      prosthesis: '無',
    },
    ltcCare: {
      adlScore: '完全臥床/輪椅 · 移位需雙人協助 · 管灌飲食',
      continence: '全日包尿布 (Q3H 定時更換)',
      lastStoolDate: '已2日未解便 (10/04 解硬便，今晚未解評估通便)',
      turningSchedule: 'Q2H 翻身拍背 + 減壓氣墊床 (無約束)',
      restraintNote: '意識清醒以字卡溝通 · 每日呼吸肌與四肢被動運動',
      rehabActivity: '床邊呼吸肌訓練與四肢關節運動',
      sleepMood: '意識清醒以字卡溝通 · 每日呼吸肌與四肢被動運動',
      weightBmi: '52.0 kg · BMI 19.6',
    },
    labs: [
      { id: 'lab-301', item: 'SpO2 血氧監測', value: '91 % (↓)', action: '予抽痰出黃稠痰中量並給予 Combivent 噴霧後回升至 95%' },
      { id: 'lab-302', item: 'Hb 血紅素', value: '12.4 g/dL', action: '正常範圍，定期追蹤' },
    ],
    opExams: [
      { id: 'op-301', date: '10/10', time: '10:30', content: '呼吸治療師機構巡診評估氣切照護' },
      { id: 'op-302', date: '10/20', time: '09:00', content: '例行更換氣切外管 (#7.0 矽膠氣切管)' },
    ],
    udDrugs: [
      { id: 'd-301', drugName: 'Levodopa/Benserazide (Madopar)', route: '管灌泡水', schedule: 'TID 08/13/18', note: '帕金森氏用藥，須與管灌高蛋白配方間隔 30-60 分鐘' },
      { id: 'd-302', drugName: 'Ipratropium/Salbutamol (Combivent)', route: '氣切噴霧', schedule: 'Q6H & PRN', note: '支氣管擴張噴霧，吸藥後拍背抽痰' },
      { id: 'd-303', drugName: 'Tamsulosin (Harnalidge) 0.2mg', route: '管灌泡水', schedule: 'QD 09:00', note: '口溶錠泡水灌入，勿用力研磨' },
    ],
    vitalSigns: [
      { id: 'v301', time: '08:00', T: '36.7', P: '82', R: '20', BP: '138/82', SpO2: '95', GCS: 'E4VTM6', Pain: '0', action: '氣切內管清潔消毒完成' },
      { id: 'v302', time: '12:00', T: '37.1', P: '88', R: '22', BP: '142/84', SpO2: '91', GCS: 'E4VTM6', Pain: '1', action: '痰音重予抽痰及噴霧後 SpO2 95%' },
      { id: 'v303', time: '16:00', T: '36.8', P: '80', R: '19', BP: '134/78', SpO2: '96', GCS: 'E4VTM6', Pain: '0', action: '呼吸平順' },
    ],
    consults: [],
    wounds: [
      { site: '氣切造廔口周圍皮膚', description: '乾燥清潔無紅腫，每班更換 Y 型紗布' },
    ],
    bodyMarkers: [
      { id: 'm301', x: 50, y: 20, view: 'front', category: 'line', label: '氣切管 #7.0', note: '矽膠雙管，每班清潔內管並更換Y紗' },
      { id: 'm302', x: 46, y: 15, view: 'front', category: 'line', label: '鼻胃管 16Fr', note: '深度 58cm，10/25 到期' },
    ],
    todoItems: [
      { id: 'todo-301', category: '日常照護', content: '每班清潔消毒氣切內管、更換氣切 Y 型紗布並檢查固定帶鬆緊（一指寬）', dueTime: '每班例行', priority: 'urgent', completed: true, assignedRole: '護理師' },
      { id: 'todo-302', category: '特殊給藥', content: '18:00 灌食前 45 分鐘先給予 Madopar 帕金森氏藥，避免蛋白質影響藥效', dueTime: '17:15', priority: 'urgent', completed: false, assignedRole: '護理師' },
      { id: 'todo-303', category: '日常照護', content: '已 2 日未解便，晚班若仍未解便請依 PRN 醫囑給予 Glycerin Enema 通便', dueTime: '20:00', priority: 'normal', completed: false, assignedRole: '護理師' },
    ],
    stickyNotes: [],
    receiveNote: '張伯伯中午因痰多 SpO2 降至 91%，經氣切抽痰（黃稠痰中量）及 Combivent 噴霧治療後血氧回升至 95-96%。已滿兩日未解大便，腹部微脹但腸音正常。',
    handoverNoteISBAR: `【長照機構 ISBAR 交班摘要】
I (住民識別): B105-1 床，張金龍伯伯，76歲，翠竹護理區，CMS 第8級 (ADL 0-15分)。
S (目前照護現況): COPD 合併帕金森氏症，留置氣切管 #7.0 與鼻胃管 16Fr，使用氣切潮濕瓶 O2 3L/min。
B (長照背景與風險): 痰液有綠膿桿菌移生史（抽痰採接觸與飛沫防護）；已 2 日未解便。
A (本班評估): 中午痰多血氧一度 91%，抽痰與支氣管擴張噴霧後改善至 96%；氣切造口乾淨。
R (下班待辦與交接):
1. 管灌前請先執行化痰噴霧與抽痰，Madopar 務必與管灌奶間隔 45 分鐘。
2. 晚班若仍未解便，請依 PRN 醫囑執行甘油球通便並記錄排便量。`,
    lastUpdated: '2026/10/06 16:10',
  },
];
