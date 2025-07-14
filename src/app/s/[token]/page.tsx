import { tokenManager } from "@/lib/tokenManager";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import GalleryPage from "@/components/GalleryPage";
interface PageProps {
  params: Promise<{ token: string }>;
}
export default async function SecurePage({ params }:  PageProps) {
  const headersList = headers();
  const userAgent = (await (await headersList).get("user-agent")) || "unknown";
  const ipAddress =
    (await (await headersList).get("x-forwarded-for")) ||
    (await (await headersList).get("x-real-ip")) ||
    "unknown";
const myToken = (await params).token

  const validation = tokenManager.validateAndUseToken(
    myToken,
    ipAddress,
    userAgent
  );

  if (!validation.valid) {
    redirect("/"); // Redirect to login
  }

  return (
    <div className="">
     <GalleryPage  />
    </div>
  );
}
