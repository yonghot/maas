import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9333ea',
};

export const metadata: Metadata = {
  title: "공학적배우자탐색기 | MAAS",
  description: "AI 기반 과학적 매력도 평가와 티어 매칭 시스템! 당신의 이상형을 만나보세요",
  keywords: "결혼, 매력도, 테스트, 연애, 결혼준비, 심리테스트, 매칭, 소개팅",
  openGraph: {
    title: "공학적배우자탐색기 - 과학적 매력 평가 & 매칭",
    description: "AI 기반 매력도 평가와 티어 매칭으로 이상형 찾기!",
    type: "website",
    locale: "ko_KR",
    siteName: "공학적배우자탐색기",
  },
  twitter: {
    card: "summary_large_image",
    title: "공학적배우자탐색기",
    description: "AI 기반 매력도 평가와 티어 매칭 시스템",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "공학적배우자탐색기",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}