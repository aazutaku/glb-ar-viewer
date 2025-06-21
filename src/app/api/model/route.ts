// app/api/model/route.ts

import { NextRequest } from "next/server";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key"); // 例: "models/astronaut.glb"

  if (!key) {
    return new Response("Missing model key", { status: 400 });
  }

  try {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      })
    );

    return new Response(result.Body as ReadableStream, {
      headers: {
        "Content-Type": result.ContentType || "model/gltf-binary",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Model fetch error:", err);
    return new Response("Model not found", { status: 404 });
  }
}
