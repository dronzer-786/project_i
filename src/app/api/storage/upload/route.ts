import { NextResponse } from "next/server";
import { createSignedObjectUrl, uploadObjectToTi } from "@/lib/r2";

export const runtime = "nodejs";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const safeName = sanitizeFileName(file.name);
    const key = `ti/${Date.now()}_${safeName}`;
    const body = Buffer.from(await file.arrayBuffer());

    await uploadObjectToTi({
      key,
      body,
      contentType: file.type || "application/octet-stream",
    });

    const url = await createSignedObjectUrl(key);

    return NextResponse.json({
      success: true,
      file: {
        url,
        name: file.name,
        fullPath: key,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
