export const runtime = "nodejs";

function cleanMarkdownText(markdown: string) {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*`_-]{1,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return Response.json(
        { error: "MISTRAL_API_KEY is missing in environment variables" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "PDF file is required" }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append("purpose", "ocr");
    uploadForm.append("file", file, file.name);

    const uploadRes = await fetch("https://api.mistral.ai/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mistralKey}`,
      },
      body: uploadForm,
    });

    const uploadText = await uploadRes.text();
    const uploadData = JSON.parse(uploadText);

    const ocrRes = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mistralKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: {
          file_id: uploadData.id,
        },
      }),
    });

    const ocrText = await ocrRes.text();
    const ocrData = JSON.parse(ocrText);

    const pages = Array.isArray(ocrData?.pages) ? ocrData.pages : [];
    const combinedMarkdown = pages.map((page: any) => page?.markdown || "").join("\n\n");

    const text = cleanMarkdownText(combinedMarkdown);

    return Response.json({
      text,
      pages: pages.length,
      filename: file.name,
    });

  } catch (error: any) {
    return Response.json(
      { error: error?.message || "OCR failed" },
      { status: 500 }
    );
  }
}