import { statelessTokenManager } from "@/lib/tokenManager";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
interface PageProps {
  params: Promise<{ token: string }>;
}
export default async function SecurePage({ params }:  PageProps) {
  const headersList = headers();
  const userAgent = (await (await headersList).get("user-agent")) || "unknown";
    // For deployment, check multiple possible IP headers
    const ipAddress = 
       await (await headersList).get('x-forwarded-for')?.split(',')[0]?.trim() ||
        await (await headersList).get('x-real-ip') ||
        await (await headersList).get('x-client-ip') ||
        await (await headersList).get('cf-connecting-ip') || // Cloudflare
        await (await headersList).get('x-forwarded') ||
        await (await headersList).get('forwarded-for') ||
        await (await headersList).get('forwarded') ||
        'unknown';

const myToken = (await params).token


  const validation = statelessTokenManager.validateOneTimeToken(
        myToken,
        ipAddress,
        userAgent
    );

  if (!validation.valid) {
    console.log('Token validation failed:', validation.reason);
    redirect("/"); // Redirect to login
  }

  return (
    <div className="">
      <h1 className="">Gallery Page</h1>
     {/* <GalleryPage  /> */}

          {/* Client-side protection against refresh */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    // Mark page as accessed
                    if (typeof window !== 'undefined') {
                        const currentPath = window.location.pathname;
                        const accessedKey = 'accessed_' + currentPath.split('/').pop();
                        
                        // Check if already accessed
                        if (sessionStorage.getItem(accessedKey)) {
                            window.location.href = '/';
                        } else {
                            // Mark as accessed
                            sessionStorage.setItem(accessedKey, 'true');
                            
                            // Auto-redirect after 30 seconds
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 30000);
                        }
                        
                        // Clear on unload
                        window.addEventListener('beforeunload', () => {
                            sessionStorage.removeItem(accessedKey);
                        });
                    }
                `
            }} />
    </div>
  );
}
