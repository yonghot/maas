import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "결혼매력평가 | MAAS",
  description: "AI가 분석하는 객관적인 결혼 매력 지수! 5분만에 당신의 매력을 평가받아보세요",
  keywords: "결혼, 매력도, 테스트, 연애, 결혼준비, 심리테스트",
  openGraph: {
    title: "결혼매력평가 - 나의 결혼 매력도는 몇 점?",
    description: "AI가 분석하는 객관적인 결혼 매력 지수!",
    type: "website",
    locale: "ko_KR",
    siteName: "MAAS",
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
        {children}
      </body>
    </html>
  );
}