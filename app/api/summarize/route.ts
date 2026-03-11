import OpenAI from "openai";
import * as pdf from "pdf-parse";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let text = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body?.text || "";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return Response.json({ error: "PDF file is required" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const parsedPdf = await pdf(buffer);
      text = parsedPdf.text || "";
    }

    if (!text || !text.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const trimmedText = text.slice(0, 12000);

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful bilingual academic assistant for international students. Always return valid JSON only.",
        },
        {
          role: "user",
          content: `Analyze the academic text below and return ONLY valid JSON in this exact format:

{
  "summary": "A short and simple English summary",
  "keyPoints": [
    "Point 1",
    "Point 2",
    "Point 3"
  ],
  "difficultTerms": [
    {
      "term": "term or phrase",
      "explanation_en": "simple English explanation",
      "explanation_zh": "中文解释"
    }
  ],
  "translation_zh": "A natural Chinese explanation of the main meaning",
  "studyNotes": [
    "Revision note 1",
    "Revision note 2",
    "Revision note 3"
  ],
  "essayOutline": [
    "Introduction: ...",
    "Body Paragraph 1: ...",
    "Body Paragraph 2: ...",
    "Conclusion: ..."
  ]
}

Rules:
- summary must be concise and easy to understand.
- keyPoints should be clear and useful for students.
- difficultTerms should focus on important academic or difficult vocabulary.
- explanation_en must be simple.
- explanation_zh must be natural Chinese.
- translation_zh should explain the passage in Chinese naturally.
- studyNotes should be suitable for revision or exam prep.
- essayOutline should be suitable for writing an essay based on this text.
- Return JSON only. No markdown. No extra text.

Text:
${trimmedText}`,
        },
      ],
      temperature: 0.3,
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
        summary: content,
        keyPoints: [],
        difficultTerms: [],
        translation_zh: "",
        studyNotes: [],
        essayOutline: [],
      });
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "AI error occurred" }, { status: 500 });
  }
}