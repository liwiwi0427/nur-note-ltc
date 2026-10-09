import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini AI (server-side only)
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI ISBAR Handover Note Generation (Nursing Home / Long-Term Care Edition)
  app.post("/api/ai/isbar-summary", async (req, res) => {
    try {
      const patientRecord = req.body;
      const info = patientRecord.patientInfo || patientRecord;
      const ltc = patientRecord.ltcCare || {};
      const ai = getAi();

      const prompt = `你是一位資深的長期照顧機構（護理之家 / Nursing Home）護理長，請根據以下住民資料，生成一份繁體中文標準長照護理 ISBAR 交班摘要與照護重點提示。

住民基本與長照評估資料：
- 房床號：${info.bedNo || "未填"}
- 住民姓名：${info.name || "未填"}
- 住民編號：${info.chartNo || "未填"}
- 性別 / 年齡：${info.gender || "未填"} / ${info.age || "未填"}
- 入住日期：${info.admissionDate || "未填"}
- 照護分區：${info.dept || "未填"}
- 巡診/主責醫師：${info.doctor || "未填"}
- 緊急聯絡人/家屬：${info.coCare || "無"}
- 慢性病與主要診斷：${info.diagnosis || "未填"}
- 長照等級與巴氏量表 (CMS/ADL)：${info.cmsLevel || ltc.adlScore || "未評估"}
- 預立醫療決定 (DNR/AD)：${info.dnrStatus || "未註記"} / 指定後送醫院：${info.hospitalPref || "未指定"}
- 飲食與吞嚥型態：${info.diet || "普通飲食"}
- 過敏史：${info.allergy || "無記錄"}
- 跌倒與壓傷風險：${info.fallRisk || "未評估"}
- 感控防護狀態：${info.isIsolated ? `是 (方式: ${info.isolationType}, 原因: ${info.isolationReason})` : "否"}
- 長照管路與輔具狀態 (三管/氧氣/輔具)：${JSON.stringify(patientRecord.lines || {})}
- 日常生活與排泄/翻身照護評估：${JSON.stringify(ltc)}
- 定期檢驗與血糖監測：${JSON.stringify(patientRecord.labs || [])}
- 巡診、門診回診與管路更換排程：${JSON.stringify(patientRecord.opExams || [])}
- 長期慢箋與特殊給藥：${JSON.stringify(patientRecord.udDrugs || [])}
- 最新生命徵象 (Vitals)：${JSON.stringify(patientRecord.vitalSigns || [])}
- 跨專業團隊照會與家屬溝通：${JSON.stringify(patientRecord.consults || [])}
- 壓傷與皮膚狀況：${JSON.stringify(patientRecord.wounds || [])}
- 住民待辦事項 (To-Do List)：${JSON.stringify(patientRecord.todoItems || [])}
- 本班日常照護觀察筆記：${patientRecord.receiveNote || "無"}

請按照長照護理 ISBAR 格式進行結構化總結：
1. **I (Introduction - 住民識別)**：房床號、姓名、年齡、照護專區、CMS/ADL 等級、DNR 與後送醫院
2. **S (Situation - 現況與照護焦點)**：主要慢性病診斷、飲食/管灌型態、目前三管留置與輔具使用狀況
3. **B (Background - 長照背景與風險)**：跌倒/壓傷風險、感控防護、最後解便日與排泄狀況、近期巡診/回診重點
4. **A (Assessment - 本班評估)**：生命徵象趨勢、血糖/檢驗異常、壓傷皮膚變化、情緒睡眠與進食吸收狀況
5. **R (Recommendation - 下班待辦與交接建議)**：下一班護理師與照服員重點照護事項、管路到期更換提醒、給藥與翻身減壓追蹤

請用溫暖、專業、條理分明的台灣長期照顧機構護理交班術語回答。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ summary: response.text || "無法生成摘要" });
    } catch (error: any) {
      console.error("AI ISBAR Error:", error);
      res.status(500).json({
        error: "生成 ISBAR 摘要時發生錯誤",
        details: error.message || String(error),
      });
    }
  });

  // AI Critical Nursing Home Care Audit / Reminders
  app.post("/api/ai/clinical-check", async (req, res) => {
    try {
      const patientRecord = req.body;
      const info = patientRecord.patientInfo || patientRecord;
      const ltc = patientRecord.ltcCare || {};
      const ai = getAi();

      const prompt = `你是長期照顧機構（護理之家）照護品質與安全稽核 AI 顧問。請迅速分析下列住民資料，指出任何【異常生命徵象或血糖檢驗】、【長照三管到期或防自拔風險】、【跌倒/壓傷/便秘/脫水風險提醒】與【慢箋給藥交互作用或注意事項】：

資料如下：
- 房床號：${info.bedNo} / 姓名：${info.name || "未填"} / 年齡：${info.age || "未填"}
- 慢性病診斷：${info.diagnosis}
- CMS/ADL 等級：${info.cmsLevel || ltc.adlScore || "無"}
- 過敏史：${info.allergy || "無"}
- 跌倒/壓傷風險：${info.fallRisk || "無"}
- 感控隔離：${info.isIsolated ? info.isolationType : "否"}
- 管路與輔具：${JSON.stringify(patientRecord.lines || {})}
- 日常照護評估 (排便/翻身/約束/體重)：${JSON.stringify(ltc)}
- Vitals: ${JSON.stringify(patientRecord.vitalSigns || [])}
- Labs/血糖: ${JSON.stringify(patientRecord.labs || [])}
- 慢箋藥物: ${JSON.stringify(patientRecord.udDrugs || [])}

請輸出 4~5 點精練實用的「長照臨床風險提醒與照護品質建議」（列點式，繁體中文）。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ alerts: response.text || "無特殊危急警訊" });
    } catch (error: any) {
      console.error("Clinical Check Error:", error);
      res.status(500).json({ error: "進行臨床檢查時發生錯誤" });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`長照護理交班系統伺服器已於 http://localhost:${PORT} 啟動`);
  });
}

startServer();
