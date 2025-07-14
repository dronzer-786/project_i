import type { Metadata } from "next";
import {
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Sans as FontSans,
} from "next/font/google";
import "./globals.css";
import SplashScreen from "../components/customComponents/SplashScreen";
import {Toaster} from "sonner"
export const fontSans = FontSans({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  weight: ["400", "500", "600"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Project-i",
  description: "Created by Md Taqui Imam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${fontSans.variable} ${fontMono.variable} `}
        suppressHydrationWarning
      >
        <Toaster position="top-center" richColors />
           <SplashScreen />
           {children}
      </body>
    </html>
  );
}
