import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    const objectKey = key.join("/");

    const result = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: objectKey,
      })
    );

    const bytes = await result.Body?.transformToByteArray();

    if (!bytes) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": result.ContentType || "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}