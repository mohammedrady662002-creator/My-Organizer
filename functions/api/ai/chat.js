import { GoogleGenAI } from "@google/genai";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { message, history, language } = body;
    
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare Pages." }), { status: 500 });
    }

    const contextHistory = history && Array.isArray(history)
      ? history.map((chat) => `${chat.role === 'user' ? 'المستخدم' : 'المساعد'}: ${chat.text}`).join('\n')
      : '';

    const prompt = language === 'ar'
    ? `تاريخ المحادثة السابقة:\n${contextHistory}\n\nالمستخدم يقول/يسأل:\n"${message}"\n\nتعليمات الرد ההامة جداً:\n1. أجب بلغة عربية فصحى مبسطة، ودية، ومحترفة.\n2. إذا كان مدخل المستخدم مجرد تحية أو سؤال عن الحال (مثل: "عامل ايه"، "مرحبا"، "شلونك"، "السلام عليكم"، "أهلاً")، فقم بالرد القصير والودود والذكي في سطرين على الأكثر (مثال: "أهلاً بك! بخير والحمد لله، أنا راضي مستشارك لزيادة الإنتاجية وتقليل التوتر. كيف يمكنني مساعدتك اليوم؟")، ولا تضع قوائم عريضة أو نصائح تنظيمية مطولة إطلاقاً إلا إذا طلبها صراحة.\n3. تجنب الردود الطويلة والإنشائية، وركز على إجابة السؤال بدقة ووضوح واختصار.\n4. استخدم تنسيق Markdown بشكل أنيق وبسيط للعين.`
    : `Conversation history:\n${contextHistory}\n\nUser says/asks:\n"${message}"\n\nImportant response guidelines:\n1. Respond professionally, warmly, and concisely.\n2. If the user input is a simple greeting or check-in like "how are you", "hello", "hi", respond with a very brief, friendly sentence (e.g., "Hello! I'm Rady Ai, your productivity and mindset co-pilot. How can I support you today?"), without adding huge lists or unsolicited guidelines.\n3. Keep answers precise, direct, and avoiding unnecessary verbosity or essays. Use simple markdown.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Rady Ai, a friendly, professional, and supportive productivity and SaaS life coach assistant. You keep your responses concise, clear, and focused.",
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
