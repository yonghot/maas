'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Users, TrendingUp, Award, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface TestResult {
  id: string;
  user_type: 'registered' | 'anonymous';
  user_identifier: string;
  gender: 'male' | 'female';
  age: number;
  region: string;
  nickname?: string;
  total_score: number;
  tier: string;
  grade: string;
  appearance_score?: number;
  economic_score?: number;
  personality_score?: number;
  lifestyle_score?: number;
  relationship_score?: number;
  instagram_public?: boolean;
  category_scores?: any;
  created_at: string;
}

interface Statistics {
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  averageScore: number;
  tierDistribution: Record<string, number>;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      // 관리자 세션 확인 (localStorage 우선, sessionStorage 백업)
      if (typeof window !== 'undefined') {
        const localAuth = localStorage.getItem('adminAuth');
        const sessionAuth = sessionStorage.getItem('adminAuth');
        const isAdminAuth = localAuth || sessionAuth;
        
        console.log('Admin Auth Check - Local:', localAuth, 'Session:', sessionAuth);
        
        if (!isAdminAuth || isAdminAuth !== 'true') {
          // 로그인 페이지로 리다이렉트
          console.log('인증 실패, 로그인 페이지로 이동');
          router.push('/login?redirect=/admin');
          return;
        }
        
        console.log('인증 성공, 데이터 로딩 시작');
        setIsAuthorized(true);
        await fetchTestResults();
      }
    } catch (err) {
      console.error('Authorization error:', err);
      setError('인증 확인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const fetchTestResults = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/test-results', {
        headers: {
          'Authorization': 'Bearer admin-maas-2025'
        }
      });
      if (!response.ok) {
        throw new Error('데이터 조회 실패');
      }
      
      const { data } = await response.json();
      setTestResults(data || []);
      
      // 통계 계산
      if (data && data.length > 0) {
        const stats = calculateStatistics(data);
        setStatistics(stats);
      }
      
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatistics = (results: TestResult[]): Statistics => {
    const totalCount = results.length;
    const maleCount = results.filter(r => r.gender === 'male').length;
    const femaleCount = results.filter(r => r.gender === 'female').length;
    const averageScore = results.reduce((sum, r) => sum + r.total_score, 0) / totalCount;
    
    const tierDistribution: Record<string, number> = {};
    results.forEach(r => {
      tierDistribution[r.tier] = (tierDistribution[r.tier] || 0) + 1;
    });
    
    return {
      totalCount,
      maleCount,
      femaleCount,
      averageScore,
      tierDistribution
    };
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'S': 'bg-yellow-500',
      'A': 'bg-purple-500',
      'B': 'bg-blue-500',
      'C': 'bg-green-500',
      'D': 'bg-gray-500',
      'E': 'bg-orange-500',
      'F': 'bg-red-500'
    };
    return colors[tier] || 'bg-gray-400';
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('S')) return 'text-yellow-600';
    if (grade.includes('A')) return 'text-purple-600';
    if (grade.includes('B')) return 'text-blue-600';
    if (grade.includes('C')) return 'text-green-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-center text-teal-600/80">로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 flex items-center justify-center">
        <Card className="shadow-xl border-0 max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">접근 제한</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error || '관리자 권한이 필요합니다.'}</p>
            <Button 
              onClick={() => router.push('/login?redirect=/admin')} 
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600"
            >
              관리자 로그인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50/30 p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-800 mb-2">관리자 대시보드</h1>
            <p className="text-teal-600/80">테스트 결과 및 통계를 확인할 수 있습니다.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/accounts">
              <Button 
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Users className="h-4 w-4 mr-2" />
                계정 관리
              </Button>
            </Link>
            <Link href="/admin/scoring">
              <Button 
                variant="outline"
                className="border-teal-300 text-teal-600 hover:bg-teal-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                평가 기준 관리
              </Button>
            </Link>
            <Button 
              onClick={() => {
                localStorage.removeItem('adminAuth');
                sessionStorage.removeItem('adminAuth');
                window.location.href = '/login?redirect=/admin';
              }}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              로그아웃
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        {statistics && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">전체 참여자</p>
                    <p className="text-2xl font-bold text-teal-700">{statistics.totalCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">평균 점수</p>
                    <p className="text-2xl font-bold text-teal-700">{statistics.averageScore.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">남성 참여자</p>
                    <p className="text-2xl font-bold text-blue-600">{statistics.maleCount}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">여성 참여자</p>
                    <p className="text-2xl font-bold text-pink-600">{statistics.femaleCount}</p>
                  </div>
                  <Award className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 테이블 탭 */}
        <Card className="border-0 shadow-xl bg-white/95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-teal-800">테스트 결과 목록</CardTitle>
                <p className="text-sm text-gray-600 mt-1">최근 100건의 테스트 결과를 표시합니다.</p>
                <p className="text-sm text-blue-600 mt-1">
                  💡 <Link href="/admin/accounts" className="underline hover:text-blue-800">
                    계정 관리 페이지
                  </Link>에서 전체 계정 정보를 확인하고 Excel로 다운로드할 수 있습니다.
                </p>
              </div>
              <Button 
                onClick={fetchTestResults} 
                variant="outline"
                className="border-teal-300 text-teal-600 hover:bg-teal-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 w-full bg-teal-50/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  전체 ({testResults.length})
                </TabsTrigger>
                <TabsTrigger value="male" className="data-[state=active]:bg-white">
                  남성 ({testResults.filter(r => r.gender === 'male').length})
                </TabsTrigger>
                <TabsTrigger value="female" className="data-[state=active]:bg-white">
                  여성 ({testResults.filter(r => r.gender === 'female').length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <TestResultsTable results={testResults} getTierColor={getTierColor} getGradeColor={getGradeColor} />
              </TabsContent>
              
              <TabsContent value="male">
                <TestResultsTable 
                  results={testResults.filter(r => r.gender === 'male')} 
                  getTierColor={getTierColor} 
                  getGradeColor={getGradeColor} 
                />
              </TabsContent>
              
              <TabsContent value="female">
                <TestResultsTable 
                  results={testResults.filter(r => r.gender === 'female')} 
                  getTierColor={getTierColor} 
                  getGradeColor={getGradeColor} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 테스트 결과 테이블 컴포넌트
function TestResultsTable({ 
  results, 
  getTierColor, 
  getGradeColor 
}: { 
  results: TestResult[], 
  getTierColor: (tier: string) => string,
  getGradeColor: (grade: string) => string 
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] border rounded-lg">
        <Table className="w-full min-w-[1200px]">
        <TableHeader>
          <TableRow className="bg-teal-50">
            <TableHead className="font-bold text-teal-800 sticky left-0 bg-teal-50 z-10">유형</TableHead>
            <TableHead className="font-bold text-teal-800">Instagram</TableHead>
            <TableHead className="font-bold text-teal-800">성별</TableHead>
            <TableHead className="font-bold text-teal-800">나이</TableHead>
            <TableHead className="font-bold text-teal-800">총점</TableHead>
            <TableHead className="font-bold text-teal-800">티어</TableHead>
            <TableHead className="font-bold text-teal-800">카테고리별 점수</TableHead>
            <TableHead className="font-bold text-teal-800">가입일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={result.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="sticky left-0 bg-inherit">
                <Badge variant={result.user_type === 'registered' ? 'default' : 'secondary'}>
                  {result.user_type === 'registered' ? '회원' : '익명'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{result.nickname || '-'}</span>
                  {result.instagram_public !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {result.instagram_public ? '공개' : '비공개'}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={result.gender === 'male' ? 'outline' : 'outline'} 
                        className={result.gender === 'male' ? 'border-blue-500 text-blue-600' : 'border-pink-500 text-pink-600'}>
                  {result.gender === 'male' ? '남성' : '여성'}
                </Badge>
              </TableCell>
              <TableCell>{result.age || '-'}</TableCell>
              <TableCell className="font-bold">{result.total_score.toFixed(1)}</TableCell>
              <TableCell>
                <Badge className={getTierColor(result.tier)}>{result.tier}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {result.category_scores ? (
                    Object.entries(result.category_scores).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                      </div>
                    ))
                  ) : (
                    '-'
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs text-gray-500">
                {new Date(result.created_at).toLocaleDateString('ko-KR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}