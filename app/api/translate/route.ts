import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text || "";

    if (!text || !text.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const trimmedText = text.slice(0, 16000);

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a bilingual academic translation assistant. Always return valid JSON only.",
        },
        {
          role: "user",
          content: `Split the following academic text into natural paragraphs and return ONLY valid JSON in this exact format:

{
  "parallelTranslation": [
    {
      "en": "original English paragraph",
      "zh": "natural Chinese translation"
    }
  ],
  "summary_zh": "A short Chinese summary",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Rules:
- Preserve paragraph meaning accurately.
- zh must be natural, fluent Chinese suitable for international students.
- summary_zh should be concise.
- Return JSON only. No markdown. No extra text.

Text:
${trimmedText}`,
        },
      ],
      temperature: 0.2,
    });

    let content = completion.choices[0]?.message?.content || "";
    content = content.replace(/```json/g, "");
    content = content.replace(/```/g, "");
    content = content.trim();

    try {
      const parsed = JSON.parse(content);
      return Response.json(parsed);
    } catch {
      return Response.json({
        parallelTranslation: [],
        summary_zh: content,
        keywords: [],
      });
    }
  } catch (error) {
    console.error("Translate API error:", error);
    return Response.json({ error: "AI error occurred" }, { status: 500 });
  }
}