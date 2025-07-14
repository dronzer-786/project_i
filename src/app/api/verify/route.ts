import { statelessTokenManager } from "@/lib/tokenManager";
import { verifyPassword } from "@/lib/verify";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const ipAddress = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    if (!code || typeof code !== "string") {
      return Response.json({ error: "No Input Received" }, { status: 400 });
    }

    const isMatch = await verifyPassword(code);
    if (isMatch.success) {
      const secureToken = statelessTokenManager.generateOneTimeToken(
        ipAddress,
        userAgent
      );

      return Response.json(
        {
          success: true,
          redirectUrl: secureToken,
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
function getClientIP(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-client-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded") ||
    req.headers.get("forwarded-for") ||
    req.headers.get("forwarded") ||
    "unknown"
  );
}
