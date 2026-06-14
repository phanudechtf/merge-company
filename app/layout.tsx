import type { Metadata } from "next";
import { Inter, Prompt } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MERGE Workspace",
  description: "ระบบบริหารองค์กรครบวงจร — SENSE ASIA CORPORATION",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`h-full ${inter.variable} ${prompt.variable}`}>
      <body className="h-full bg-ivory text-[#111111]">{children}</body>
    </html>
  );
}
