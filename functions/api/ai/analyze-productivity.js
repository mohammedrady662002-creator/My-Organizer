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

   const taskSummary = tasks.map((t) => `- ${t.title} (${t.completed ? 'مكتملة' : 'قيد الانتظار'}) [الأولوية: ${t.priority}] [التصنيف: ${t.category}]`).join('\n');

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


    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional life coach and productivity expert.",
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
