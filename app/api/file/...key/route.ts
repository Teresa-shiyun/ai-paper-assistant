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

export async function GET(req: Request, context: any) {
  try {
    const keyParts = context?.params?.key;

    if (!Array.isArray(keyParts) || keyParts.length === 0) {
      return new Response("File not found", { status: 404 });
    }

    const objectKey = keyParts.join("/");

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

    const arrayBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(arrayBuffer).set(bytes);

    return new Response(arrayBuffer, {
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