import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filename = body?.filename as string | undefined;
    const contentType = body?.contentType as string | undefined;

    if (!filename || !contentType) {
      return Response.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    if (contentType !== "application/pdf") {
      return Response.json({ error: "Only PDF is allowed" }, { status: 400 });
    }

    const key = `pdfs/${Date.now()}-${safeName(filename)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: "application/pdf",
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 10,
    });

    return Response.json({
      uploadUrl,
      key,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}