import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import OpenAI from "openai";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

type OcrPage = {
  page: number;
  markdown: string;
};

function cleanText(markdown: string) {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*`_-]{1,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function uploadPdfToMistral(fileBuffer: Buffer, filename: string) {
  const form = new FormData();
  form.append("purpose", "ocr");
  form.append(
    "file",
    new Blob([fileBuffer], { type: "application/pdf" }),
    filename
  );

  const res = await fetch("https://api.mistral.ai/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: form,
  });

  const text = await res.text();
  const data = JSON.parse(text);

  if (!res.ok || !data?.id) {
    throw new Error(data?.message || data?.error || "Mistral file upload failed");
  }

  return data.id as string;
}

async function runMistralOcr(fileId: string): Promise<OcrPage[]> {
  const res = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: {
        file_id: fileId,
      },
    }),
  });

  const text = await res.text();
  const data = JSON.parse(text);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Mistral OCR failed");
  }

  const pages = Array.isArray(data?.pages) ? data.pages : [];

  return pages.map((p: any, index: number) => ({
    page: index + 1,
    markdown: p?.markdown || "",
  }));
}

async function translatePageToChinese(content: string) {
  const trimmed = content.slice(0, 12000);

  const completion = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are an academic translator. Translate English academic text into natural, accurate Chinese. Keep technical meaning precise.",
      },
      {
        role: "user",
        content: `Translate the following academic page into Chinese. Return Chinese only, no markdown fences.

${trimmed}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = body?.key as string | undefined;

    if (!key) {
      return Response.json({ error: "File key is required" }, { status: 400 });
    }

    const fileResult = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      })
    );

    const bytes = await fileResult.Body?.transformToByteArray();

    if (!bytes) {
      return Response.json({ error: "PDF not found in storage" }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(bytes);
    const filename = key.split("/").pop() || "document.pdf";

    const fileId = await uploadPdfToMistral(pdfBuffer, filename);
    const ocrPages = await runMistralOcr(fileId);

    if (!ocrPages.length) {
      return Response.json(
        { error: "No pages were extracted from this PDF" },
        { status: 400 }
      );
    }

    const translatedPages = [];

    for (const page of ocrPages) {
      const original = cleanText(page.markdown);

      if (!original) {
        translatedPages.push({
          page: page.page,
          original: "",
          zh: "这一页没有提取到可读内容。",
        });
        continue;
      }

      const zh = await translatePageToChinese(original);

      translatedPages.push({
        page: page.page,
        original,
        zh,
      });
    }

    return Response.json({
      totalPages: translatedPages.length,
      pages: translatedPages,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "PDF translation failed" },
      { status: 500 }
    );
  }
}