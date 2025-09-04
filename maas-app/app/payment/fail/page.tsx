'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, Loader2 } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">결제 실패</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                결제를 완료하지 못했습니다
              </h2>
              <p className="text-gray-600">
                {errorMessage || '결제 중 문제가 발생했습니다.'}
              </p>
              {errorCode && (
                <p className="text-sm text-gray-500">
                  오류 코드: {errorCode}
                </p>
              )}
            </div>

            {/* 일반적인 오류 안내 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">결제가 실패하는 경우:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>카드 잔액이 부족한 경우</li>
                    <li>카드 정보가 올바르지 않은 경우</li>
                    <li>일시적인 네트워크 오류</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white"
              >
                다시 시도하기
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}