import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily on the server
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please add it in the Settings panel.");
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------
// AI API Endpoints
// -------------------------------------------------------------

// General helper to call Gemini
async function askGemini(prompt: string, sInstruction: string = "You are a professional productivity and life coach assistant."): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "No response received from AI.";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to communicate with Gemini API");
  }
}

// 1. Division of a Task into Sub-Tasks
app.post("/api/ai/split-task", async (req, res) => {
  const { title, description, language } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const prompt = language === 'ar'
    ? `أريد تقسيم هذه المهمة الموصوفة أدناه إلى 3-5 خطوات فرعية صغيرة وقابلة للتنفيذ مباشرة.
المهمة: "${title}"
الوصف: "${description || ''}"

الرجاء الإجابة بلغة عربية فصحى ومصاغة كنقاط فروع (bullet points) أنيقة وواضحة جداً.`
    : `Please break down this task into 3-5 small, actionable, and clear sub-steps/checkbox list.
Task: "${title}"
Description: "${description || ''}"

Format the response in neat, professional bullet points.`;

  try {
    const r = await askGemini(prompt, "You are a world-class SaaS productivity planner assistant.");
    res.json({ result: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Productivity and Task List Analysis
app.post("/api/ai/analyze-productivity", async (req, res) => {
  const { tasks, language } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Tasks array is required" });
  }

  const taskSummary = tasks.map((t: any) => `- ${t.title} (${t.completed ? 'مكتملة' : 'قيد الانتظار'}) [الأولوية: ${t.priority}] [التصنيف: ${t.category}]`).join('\n');

  const prompt = language === 'ar'
    ? `قم بتحليل قائمة المهام التالية، وقدم نصيحة ذكية لتحسين الإنتاجية وتجنب المماطلة.
المهام الحالية:
${taskSummary}

يرجى إعطائي:
1. تقييم سريع ومحفز للإنتاجية الحالية.
2. نصيحة عملية مخصصة بناءً على الأولويات والمهام غير المكتملة.
3. تفكيك لأي عقبات متوقعة.
اجعل الأسلوب تحفيزي جداً، مريحاً للعين، وبصيغة نقاط مقروءة ومرتبة.`
    : `Analyze the following task list and provide smart guidance to boost productivity.
Current Tasks:
${taskSummary}

Provide:
1. A motivational assessment of current task layout.
2. 2-3 personalized suggestions to optimize flow based on priorities.
3. A short encouragement.`;

  try {
    const r = await askGemini(prompt, "You are a professional life coach and productivity expert.");
    res.json({ result: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Organize Today's Schedule & Suggest Priorities
app.post("/api/ai/plan-day", async (req, res) => {
  const { tasks, language } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Tasks array is required" });
  }

  const taskSummary = tasks.map((t: any) => `- ${t.title} (التصنيف: ${t.category}, الأولوية: ${t.priority})`).join('\n');

  const prompt = language === 'ar'
    ? `بصفتك مستشاراً شخصياً لتنظيم الوقت، ساعدني في ترتيب جدول زمني نموذجي ذكي ليومي بناءً على قائمة المهام المتاحة:
${taskSummary}

اقترح جدول توزيع زمني مقترح (صباحاً، بعد الظهر، مساءً) يراعي مستويات الطاقة والأولويات، مع ترشيح أهم 3 مهام كـ Daily Focus.`
    : `As a personal time management consultant, suggest a smart daily schedule based on this task list:
${taskSummary}

Provide an organized morning, afternoon, and evening plan, highlighting the top 3 items to prioritize as the core Daily Focus.`;

  try {
    const r = await askGemini(prompt, "You are a structured planning and time-optimization consultant.");
    res.json({ result: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Summarize Notes
app.post("/api/ai/summarize-notes", async (req, res) => {
  const { noteContent, language } = req.body;
  if (!noteContent) {
    return res.status(400).json({ error: "Note content is required" });
  }

  const prompt = language === 'ar'
    ? `لصق أدناه محتوى مفكرة. أريدك أن تلخص النقاط والأفكار الرئيسية بأسلوب مكثف وواضح جداً (تجنب الإسهاب):
المحتوى:
"${noteContent}"`
    : `Below is a note content. Please summarize the key ideas into a concise, high-density format:
Content:
"${noteContent}"`;

  try {
    const r = await askGemini(prompt, "You are an expert executive business summary planner.");
    res.json({ result: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Intelligent Assistant Chat Support
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const contextHistory = history && Array.isArray(history)
    ? history.map((chat: any) => `${chat.role === 'user' ? 'المستخدم' : 'المساعد'}: ${chat.text}`).join('\n')
    : '';

  const prompt = language === 'ar'
    ? `تاريخ المحادثة السابقة:
${contextHistory}

المستخدم يسأل:
"${message}"

يرجى الإجابة بلغة عربية فصحى وراقية وبتنسيق Markdown أنيق وواضح مع تقديم نصائح تنظيمية عملية ملهمة.`
    : `Conversation history:
${contextHistory}

User: "${message}"

Respond professionally as of a high-end personal life-hack and SaaS planner workspace assistant. Use friendly markdown.`;

  try {
    const r = await askGemini(prompt, "You are Serene AI, an elite SaaS ambient planner sidekick helping with stress-free life styling.");
    res.json({ result: r });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware setup for full-stack build
// -------------------------------------------------------------

async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
}

initializeServer();
