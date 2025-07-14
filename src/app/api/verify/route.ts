import { tokenManager } from "@/lib/tokenManager";
import { verifyPassword } from "@/lib/verify";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!code || typeof code !== "string") {
      return Response.json({ error: "No Input Received" }, { status: 400 });
    }

    const isMatch = await verifyPassword(code);
    if (isMatch.success) {
      const secureToken = tokenManager.generateSecureToken(ipAddress);

      return Response.json(
        {
          success: true,
          redirectUrl: `${secureToken}`,
        },
        { status: 200 }
      );
    } else {
      return Response.json({ success: false }, { status: 201 });
    }
  } catch (error) {
    console.log(error);

    return new Response("Internal server error", { status: 500 });
  }
}
