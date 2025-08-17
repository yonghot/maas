'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { TestResult } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  result: TestResult;
}

export default function ShareButtons({ result }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 공유할 메시지 생성
  const generateShareMessage = () => {
    const emoji = getGradeEmoji(result.grade);
    return `${emoji} 결혼 매력도 테스트 결과 ${emoji}\n\n` +
           `${result.userInfo.nickname}님의 점수: ${result.score}점 (${result.grade}등급)\n` +
           `등급: ${result.gradeInfo.title}\n` +
           `${result.gradeInfo.description}\n\n` +
           `나도 테스트 해보기 👉 ${window.location.origin}/test`;
  };

  // URL 복사
  const copyToClipboard = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 카카오톡 공유
  const shareToKakao = () => {
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const kakao = (window as any).Kakao;
      
      if (!kakao.isInitialized()) {
        // 실제 앱에서는 환경변수로 관리
        kakao.init('YOUR_KAKAO_APP_KEY');
      }

      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `${result.gradeInfo.title} - ${result.grade}등급`,
          description: `${result.userInfo.nickname}님의 결혼 매력도 점수: ${result.score}점\n${result.gradeInfo.description}`,
          imageUrl: `${window.location.origin}/api/og-image?score=${result.score}&grade=${result.grade}`,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '결과 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          {
            title: '나도 테스트하기',
            link: {
              mobileWebUrl: `${window.location.origin}/test`,
              webUrl: `${window.location.origin}/test`,
            },
          },
        ],
      });
    } else {
      // 카카오톡 미설치 시 대체 공유 방법
      shareToGeneral();
    }
  };

  // 텔레그램 공유
  const shareToTelegram = () => {
    const message = encodeURIComponent(generateShareMessage());
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${message}`;
    window.open(url, '_blank');
  };

  // 일반 공유 (Web Share API)
  const shareToGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `결혼 매력도 테스트 결과 - ${result.grade}등급`,
          text: generateShareMessage(),
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('공유 실패:', err);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // 트위터 공유
  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `${getGradeEmoji(result.grade)} 결혼 매력도 테스트에서 ${result.score}점 (${result.grade}등급)을 받았어요! ${result.gradeInfo.title}`
    );
    const url = encodeURIComponent(window.location.href);
    const hashtags = encodeURIComponent('결혼매력도테스트,MAAS');
    
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
      '_blank'
    );
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        공유하기
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 공유 메뉴 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px]"
            >
              <div className="p-2 space-y-1">
                {/* 카카오톡 공유 */}
                <button
                  onClick={shareToKakao}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-yellow-50 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">카카오톡</span>
                </button>

                {/* 텔레그램 공유 */}
                <button
                  onClick={shareToTelegram}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">텔레그램</span>
                </button>

                {/* 트위터 공유 */}
                <button
                  onClick={shareToTwitter}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-sky-50 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">트위터</span>
                </button>

                {/* 일반 공유 */}
                <button
                  onClick={shareToGeneral}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-green-50 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">기타 공유</span>
                </button>

                {/* 구분선 */}
                <div className="border-t border-gray-100 my-1" />

                {/* URL 복사 */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    {copied ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {copied ? '복사됨!' : '링크 복사'}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 성공 알림 */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 z-50 bg-green-500 text-white px-3 py-2 rounded-md shadow-lg text-sm"
          >
            링크가 복사되었습니다!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 등급별 이모지
function getGradeEmoji(grade: string): string {
  const gradeEmojis = {
    S: '👑',
    A: '🏆', 
    B: '🌟',
    C: '💪',
    D: '📚',
    F: '🎯'
  };
  return gradeEmojis[grade as keyof typeof gradeEmojis] || '⭐';
}

// 카카오톡 SDK 로드 (선택적)
declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오톡 SDK 스크립트 동적 로드
if (typeof window !== 'undefined' && !window.Kakao) {
  const script = document.createElement('script');
  script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
  script.async = true;
  document.head.appendChild(script);
}