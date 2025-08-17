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
  User, 
  MapPin, 
  Calendar,
  Trophy,
  Crown,
  Instagram,
  Settings,
  LogOut,
  RefreshCw,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { tierSystem, tierEmojis } from '@/lib/scoring/tier-system';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface ProfileData {
  id: string;
  user_id: string;
  gender: 'male' | 'female';
  age: number;
  region: string;
  tier: string;
  grade: string;
  total_score: number;
  category_scores: Record<string, number>;
  evaluation_data: any;
  last_evaluated_at: string;
  instagram_id: string;
  instagram_public: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [instagramPublic, setInstagramPublic] = useState(false);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
        setInstagramPublic(data.profile.instagram_public);
      } else {
        // 프로필이 없으면 테스트 페이지로
        router.push('/test');
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleInstagramVisibility = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ instagram_public: !instagramPublic })
        .eq('id', profile?.user_id);

      if (!error) {
        setInstagramPublic(!instagramPublic);
      }
    } catch (error) {
      console.error('Instagram visibility update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tierInfo = tierSystem[profile.tier as keyof typeof tierSystem];
  const tierEmoji = tierEmojis[profile.tier as keyof typeof tierEmojis];

  // 레이더 차트 데이터 준비
  const chartData = Object.entries(profile.category_scores).map(([key, value]) => ({
    category: key,
    score: value,
    fullMark: 100,
  }));

  // 재평가 가능 여부 확인 (마지막 평가로부터 30일 경과)
  const canReevaluate = () => {
    if (!profile.last_evaluated_at) return true;
    const lastEval = new Date(profile.last_evaluated_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastEval < thirtyDaysAgo;
  };

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
                onClick={() => router.push('/matching')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <LogoWithText className="scale-75 origin-left" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 기본 프로필 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">내 프로필</CardTitle>
                <div 
                  className="px-4 py-2 rounded-full flex items-center gap-2"
                  style={{ backgroundColor: `${tierInfo.color}20` }}
                >
                  <span className="text-2xl">{tierEmoji}</span>
                  <span className="font-bold text-lg" style={{ color: tierInfo.color }}>
                    {profile.tier}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.gender === 'male' ? '남성' : '여성'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.age}세</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.grade}등급</span>
                </div>
              </div>

              {/* 인스타그램 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium">@{profile.instagram_id}</p>
                    <p className="text-sm text-gray-500">
                      {instagramPublic ? '공개 상태' : '비공개 상태'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleInstagramVisibility}
                  disabled={updating}
                  className="border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : instagramPublic ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      비공개로 전환
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      공개로 전환
                    </>
                  )}
                </Button>
              </div>

              {/* 총점 및 백분위 */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">총점</p>
                  <p className="text-3xl font-bold text-teal-600">{profile.total_score}점</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">백분위</p>
                  <p className="text-3xl font-bold" style={{ color: tierInfo.color }}>
                    상위 {tierInfo.percentile}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 상세 점수 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>카테고리별 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar 
                    name="점수" 
                    dataKey="score" 
                    stroke="#14b8a6" 
                    fill="#14b8a6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* 카테고리별 점수 리스트 */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {Object.entries(profile.category_scores).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{score}점</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 재평가 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">마지막 평가일</p>
                  <p className="font-medium">
                    {new Date(profile.last_evaluated_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/test')}
                  disabled={!canReevaluate()}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {canReevaluate() ? '재평가 받기' : '재평가는 30일 후 가능'}
                </Button>
                {!canReevaluate() && (
                  <p className="text-xs text-gray-500">
                    다음 재평가 가능일: {
                      (() => {
                        const nextEval = new Date(profile.last_evaluated_at);
                        nextEval.setDate(nextEval.getDate() + 30);
                        return nextEval.toLocaleDateString('ko-KR');
                      })()
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}