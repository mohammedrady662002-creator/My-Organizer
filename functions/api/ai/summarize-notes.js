import { GoogleGenAI } from "@google/genai";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { noteContent, language } = body;
    
    if (!noteContent) {
      return new Response(JSON.stringify({ error: "Note content is required" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare Pages." }), { status: 500 });
    }


  const prompt = language === 'ar'
    ? `لصق أدناه محتوى مفكرة. أريدك أن تلخص النقاط والأفكار الرئيسية بأسلوب مكثف وواضح جداً (تجنب الإسهاب):
المحتوى:
"${noteContent}"`
    : `Below is a note content. Please summarize the key ideas into a concise, high-density format:
Content:
"${noteContent}"`;


    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert executive business summary planner.",
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
