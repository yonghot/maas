'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoWithText } from '@/components/ui/logo';
import { 
  ChevronLeft,
  CreditCard,
  User,
  Shield,
  Bell,
  LogOut,
  Loader2,
  Crown,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Subscription {
  plan_id: 'free' | 'basic' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  expires_at: string | null;
  features: {
    daily_views: number;
    tier_access: string;
    instagram_access: boolean;
    priority_display: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      
      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Subscription load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('정말 구독을 취소하시겠습니까? 만료일까지는 서비스를 이용하실 수 있습니다.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/subscription', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('구독이 취소되었습니다.');
        await loadSubscription();
      } else {
        const error = await response.json();
        alert(error.error || '구독 취소 실패');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('구독 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    // TODO: 계정 삭제 API 구현
    alert('계정 삭제 기능은 준비 중입니다.');
  };

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'premium': return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white';
      case 'basic': return 'bg-gradient-to-r from-teal-500 to-mint-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'premium': return '프리미엄';
      case 'basic': return '베이직';
      default: return '무료';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/profile')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <LogoWithText className="scale-75 origin-left" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">설정</h1>

          {/* 구독 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  구독 정보
                </CardTitle>
                <Badge className={getPlanBadgeColor(subscription?.plan_id || 'free')}>
                  {subscription?.plan_id === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                  {getPlanName(subscription?.plan_id || 'free')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && subscription.plan_id !== 'free' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">상태</p>
                      <p className="font-medium">
                        {subscription.status === 'active' ? '활성' : 
                         subscription.status === 'cancelled' ? '취소됨' : '만료됨'}
                      </p>
                    </div>
                    {subscription.expires_at && (
                      <div>
                        <p className="text-sm text-gray-500">만료일</p>
                        <p className="font-medium">
                          {new Date(subscription.expires_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 구독 기능 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">포함된 기능</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-teal-500">✓</span>
                        하루 {subscription.features.daily_views}명 프로필 조회
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-teal-500">✓</span>
                        {subscription.features.tier_access === 'all' ? '모든 티어' : '같거나 낮은 티어'} 접근
                      </li>
                      {subscription.features.instagram_access && (
                        <li className="flex items-center gap-2">
                          <span className="text-teal-500">✓</span>
                          인스타그램 ID 확인 가능
                        </li>
                      )}
                      {subscription.features.priority_display && (
                        <li className="flex items-center gap-2">
                          <span className="text-teal-500">✓</span>
                          우선 노출
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* 구독 관리 버튼 */}
                  <div className="flex gap-3">
                    {subscription.status === 'active' && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                      >
                        {cancelling ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        구독 취소
                      </Button>
                    )}
                    <Button
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      onClick={() => router.push('/pricing')}
                    >
                      플랜 변경
                    </Button>
                  </div>

                  {subscription.status === 'cancelled' && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">구독이 취소되었습니다</p>
                        <p className="text-yellow-700 mt-1">
                          {subscription.expires_at && 
                            `${new Date(subscription.expires_at).toLocaleDateString('ko-KR')}까지 이용 가능합니다.`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">무료 플랜을 이용 중입니다.</p>
                  <Button
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    onClick={() => router.push('/pricing')}
                  >
                    프리미엄으로 업그레이드
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 계정 설정 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                계정 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/profile')}
              >
                프로필 수정
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => alert('비밀번호 변경 기능은 준비 중입니다.')}
              >
                비밀번호 변경
              </Button>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">알림 설정 기능은 준비 중입니다.</p>
            </CardContent>
          </Card>

          {/* 개인정보 및 보안 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                개인정보 및 보안
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/privacy')}
              >
                개인정보 처리방침
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/terms')}
              >
                이용약관
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={handleDeleteAccount}
              >
                계정 삭제
              </Button>
            </CardContent>
          </Card>

          {/* 로그아웃 버튼 */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </motion.div>
      </main>
    </div>
  );
}