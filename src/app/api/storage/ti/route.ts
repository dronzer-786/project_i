import { NextResponse } from "next/server";
import { createSignedObjectUrl, listTiObjects } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await listTiObjects();
    const contents = result.Contents ?? [];

    const files = await Promise.all(
      contents
        .filter((item) => item.Key && item.Key !== "ti/")
        .map(async (item) => {
          const key = item.Key as string;
          const url = await createSignedObjectUrl(key);

          return {
            name: key.split("/").pop() ?? key,
            url,
            fullPath: key,
            timeCreated: item.LastModified?.toISOString() ?? new Date().toISOString(),
            updated: item.LastModified?.toISOString() ?? new Date().toISOString(),
            size: item.Size ?? 0,
            contentType: "application/octet-stream",
          };
        })
    );

    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to list files: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
