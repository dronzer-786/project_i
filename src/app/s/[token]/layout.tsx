import React from "react";

export default function SecureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
            <meta name="robots" content="noindex, nofollow" />
            {children}
        </>
  );
}
