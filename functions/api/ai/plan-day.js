import { GoogleGenAI } from "@google/genai";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { tasks, language } = body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return new Response(JSON.stringify({ error: "Tasks array is required" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare Pages." }), { status: 500 });
    }

  const taskSummary = tasks.map((t) => `- ${t.title} (التصنيف: ${t.category}, الأولوية: ${t.priority})`).join('\n');

  const prompt = language === 'ar'
    ? `بصفتك مستشاراً شخصياً لتنظيم الوقت، ساعدني في ترتيب جدول زمني نموذجي ذكي ليومي بناءً على قائمة المهام المتاحة:
${taskSummary}

اقترح جدول توزيع زمني مقترح (صباحاً، بعد الظهر، مساءً) يراعي مستويات الطاقة والأولويات، مع ترشيح أهم 3 مهام كـ Daily Focus.`
    : `As a personal time management consultant, suggest a smart daily schedule based on this task list:
${taskSummary}

Provide an organized morning, afternoon, and evening plan, highlighting the top 3 items to prioritize as the core Daily Focus.`;


    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a structured planning and time-optimization consultant.",
        temperature: 0.7,
      }
    });

    return new Response(JSON.stringify({ result: response.text || "No response" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
