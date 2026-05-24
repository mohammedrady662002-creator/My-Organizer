import { GoogleGenAI } from "@google/genai";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { title, description, language } = body;
    
    if (!title) {
      return new Response(JSON.stringify({ error: "Task title is required" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare Pages." }), { status: 500 });
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


    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class SaaS productivity planner assistant.",
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
