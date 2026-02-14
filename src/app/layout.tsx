import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ambrosia — See the person, not just the picture",
  description: "Build connection before first impressions. Values-based matching, gradual reveal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-H2H19EKZK3"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H2H19EKZK3');
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[#3F1414] text-[#F5F0E8]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
