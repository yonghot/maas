'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePayment } from '@/lib/hooks/usePayment';
import { LogoWithText } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  X, 
  Crown, 
  Sparkles, 
  Zap,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { subscriptionPlans } from '@/lib/config/subscription-plans';

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const [loading, setLoading] = useState(false);
  const { requestPayment, loading: paymentLoading } = usePayment();

  // 토스페이먼츠 결제 처리
  const handlePayment = async (planId: string) => {
    if (paymentLoading) {
      alert('결제 시스템을 초기화하고 있습니다. 잠시만 기다려주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      const plan = subscriptionPlans[planId];
      
      // 토스페이먼츠 결제창 호출
      await requestPayment(planId, plan.name, plan.price);
    } catch (error) {
      console.error('결제 실패:', error);
      // 에러는 SDK에서 처리됨
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      ...subscriptionPlans.free,
      popular: false,
      color: 'gray',
      badge: null
    },
    {
      ...subscriptionPlans.basic,
      popular: true,
      color: 'purple',
      badge: '50% 할인'
    },
    {
      ...subscriptionPlans.premium,
      popular: false,
      color: 'purple',
      badge: '준비중'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50 to-purple-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <LogoWithText className="scale-75 origin-left" />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 타이틀 */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-purple-500 bg-clip-text text-transparent"
          >
            더 많은 인연을 만나보세요
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            프리미엄 플랜으로 업그레이드하고 제한 없이 이용하세요
          </motion.p>
        </div>

        {/* 플랜 카드들 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    가장 인기
                  </span>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? 'ring-2 ring-purple-500 shadow-xl' : ''}`}>
                <CardHeader className="text-center pb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.id === 'free' ? 'bg-gray-100' :
                    plan.id === 'basic' ? 'bg-gradient-to-br from-purple-100 to-purple-100' :
                    'bg-gradient-to-br from-purple-100 to-purple-100'
                  }`}>
                    {plan.id === 'free' ? (
                      <Zap className="w-8 h-8 text-gray-600" />
                    ) : plan.id === 'basic' ? (
                      <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                    ) : (
                      <Crown className="w-8 h-8 text-purple-500 animate-pulse" />
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  {/* 배지 표시 */}
                  {plan.badge && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="mb-2"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        plan.badge === '준비중' 
                          ? 'bg-gray-200 text-gray-600' 
                          : 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
                      }`}>
                        {plan.badge}
                      </span>
                    </motion.div>
                  )}
                  
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 line-through block"
                      >
                        ₩{plan.originalPrice.toLocaleString()}
                      </motion.span>
                    )}
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl font-bold"
                    >
                      {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                    </motion.span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-2">/월</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.id !== 'free' && (
                    <motion.div
                      whileHover={{ scale: plan.status !== 'coming_soon' ? 1.02 : 1 }}
                      whileTap={{ scale: plan.status !== 'coming_soon' ? 0.98 : 1 }}
                    >
                      <Button
                        className={`w-full transition-all duration-300 ${
                          plan.status === 'coming_soon'
                            ? 'bg-gray-300 cursor-not-allowed'
                            : plan.id === 'premium' 
                            ? 'bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                        } text-white`}
                        onClick={() => plan.status !== 'coming_soon' && handlePayment(plan.id)}
                        disabled={loading || paymentLoading || plan.status === 'coming_soon'}
                      >
                        {plan.status === 'coming_soon' ? (
                          '준비중'
                        ) : loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            처리 중...
                          </motion.div>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            시작하기
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                  
                  {plan.id === 'free' && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors"
                        onClick={() => router.push('/matching')}
                      >
                        무료로 시작
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 비교 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>플랜 비교</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">기능</th>
                      <th className="text-center py-3 px-4">무료</th>
                      <th className="text-center py-3 px-4">베이직</th>
                      <th className="text-center py-3 px-4">프리미엄</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">일일 프로필 조회</td>
                      <td className="text-center py-3 px-4">30개</td>
                      <td className="text-center py-3 px-4">무제한</td>
                      <td className="text-center py-3 px-4">무제한</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">티어 접근</td>
                      <td className="text-center py-3 px-4">같거나 낮은 티어</td>
                      <td className="text-center py-3 px-4">모든 티어</td>
                      <td className="text-center py-3 px-4">모든 티어</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">인스타그램 아이디 공개</td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">프로필 우선 노출</td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">프리미엄 배지</td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">고급 필터링</td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ 섹션 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>언제든지 구독을 취소할 수 있습니다.</p>
          <p>모든 결제는 안전하게 처리됩니다.</p>
        </div>
      </main>
    </div>
  );
}