'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw, 
  Download,
  Search,
  Users,
  TrendingUp,
  BarChart3,
  Award,
  ChevronLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// 통합 계정 정보 인터페이스
interface UserAccount {
  user_id: string;
  email: string;
  provider: string;
  auth_created_at: string;
  last_sign_in_at?: string;
  
  gender: 'male' | 'female';
  age: number;
  region: string;
  total_score: number;
  tier: string;
  grade: string;
  instagram_id?: string;
  instagram_public: boolean;
  category_scores?: any;
  evaluation_data?: any;
  last_evaluated_at?: string;
  profile_created_at: string;
  profile_updated_at: string;
}

interface Statistics {
  totalCount: number;
  maleCount: number;
  femaleCount: number;
  averageScore: number;
  tierDistribution: Record<string, number>;
}

export default function AdminAccountsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchAccounts(1, true); // 첫 페이지부터 다시 로드
    }
  }, [searchTerm, genderFilter, isAuthorized]);

  const checkAuthorization = async () => {
    try {
      if (typeof window !== 'undefined') {
        const localAuth = localStorage.getItem('adminAuth');
        const sessionAuth = sessionStorage.getItem('adminAuth');
        const isAdminAuth = localAuth || sessionAuth;
        
        if (!isAdminAuth || isAdminAuth !== 'true') {
          router.push('/login?redirect=/admin/accounts');
          return;
        }
        
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error('Authorization error:', err);
      setError('인증 확인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const fetchAccounts = async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(genderFilter !== 'all' && { gender: genderFilter })
      });

      const response = await fetch(`/api/admin/accounts?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-maas-2025'
        }
      });

      if (!response.ok) {
        throw new Error('계정 정보 조회 실패');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const newAccounts = result.data || [];
        
        if (reset || page === 1) {
          setAccounts(newAccounts);
          setCurrentPage(1);
        } else {
          setAccounts(prev => [...prev, ...newAccounts]);
        }
        
        setHasMore(result.pagination?.hasMore || false);
        setCurrentPage(page);
        
        // 통계 계산
        if (reset || page === 1) {
          calculateStatistics(newAccounts);
        }
      } else {
        throw new Error(result.error || '데이터 조회 실패');
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Fetch accounts error:', err);
      setError('계정 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchAccounts(currentPage + 1);
    }
  }, [currentPage, hasMore, isLoadingMore]);

  const calculateStatistics = (accountList: UserAccount[]) => {
    if (accountList.length === 0) {
      setStatistics(null);
      return;
    }

    const totalCount = accountList.length;
    const maleCount = accountList.filter(acc => acc.gender === 'male').length;
    const femaleCount = accountList.filter(acc => acc.gender === 'female').length;
    const averageScore = accountList.reduce((sum, acc) => sum + (acc.total_score || 0), 0) / totalCount;
    
    const tierDistribution: Record<string, number> = {};
    accountList.forEach(acc => {
      if (acc.tier) {
        tierDistribution[acc.tier] = (tierDistribution[acc.tier] || 0) + 1;
      }
    });
    
    setStatistics({
      totalCount,
      maleCount,
      femaleCount,
      averageScore,
      tierDistribution
    });
  };

  const downloadExcel = async () => {
    try {
      const response = await fetch('/api/admin/accounts/export', {
        headers: {
          'Authorization': 'Bearer admin-maas-2025'
        }
      });

      if (!response.ok) {
        throw new Error('Excel 다운로드 실패');
      }

      // Blob으로 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date().toISOString().split('T')[0];
      link.download = `MAAS_계정정보_${today}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Excel download error:', err);
      setError('Excel 다운로드 중 오류가 발생했습니다.');
    }
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
              <p className="text-center text-purple-600/80">계정 정보 로딩 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 flex items-center justify-center">
        <Card className="shadow-xl border-0 max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">접근 제한</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error || '관리자 권한이 필요합니다.'}</p>
            <Button 
              onClick={() => router.push('/login?redirect=/admin/accounts')} 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
            >
              관리자 로그인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50/30 p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  관리자 메인
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-purple-800">계정 관리</h1>
            </div>
            <p className="text-purple-600/80">전체 사용자 계정 정보를 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={downloadExcel}
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel 다운로드
            </Button>
            <Button 
              onClick={() => fetchAccounts(1, true)}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
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
                    <p className="text-sm text-gray-600">총 계정 수</p>
                    <p className="text-2xl font-bold text-purple-700">{statistics.totalCount}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">평균 점수</p>
                    <p className="text-2xl font-bold text-purple-700">{statistics.averageScore.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/90">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">남성 계정</p>
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
                    <p className="text-sm text-gray-600">여성 계정</p>
                    <p className="text-2xl font-bold text-pink-600">{statistics.femaleCount}</p>
                  </div>
                  <Award className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 검색 및 필터 */}
        <Card className="border-0 shadow-lg bg-white/95 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">검색</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="이메일 또는 Instagram ID로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="text-sm font-medium text-gray-700 mb-2 block">성별 필터</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계정 목록 테이블 */}
        <Card className="border-0 shadow-xl bg-white/95">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800">
              계정 목록 ({accounts.length}개 표시)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AccountsTable 
              accounts={accounts} 
              getTierColor={getTierColor}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 계정 목록 테이블 컴포넌트
function AccountsTable({ 
  accounts, 
  getTierColor,
  onLoadMore,
  hasMore,
  isLoadingMore
}: { 
  accounts: UserAccount[];
  getTierColor: (tier: string) => string;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        계정 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] border rounded-lg">
        <Table className="w-full min-w-[1400px]">
          <TableHeader>
            <TableRow className="bg-purple-50">
              <TableHead className="font-bold text-purple-800 sticky left-0 bg-purple-50 z-10">이메일</TableHead>
              <TableHead className="font-bold text-purple-800">제공자</TableHead>
              <TableHead className="font-bold text-purple-800">성별</TableHead>
              <TableHead className="font-bold text-purple-800">나이</TableHead>
              <TableHead className="font-bold text-purple-800">지역</TableHead>
              <TableHead className="font-bold text-purple-800">총점</TableHead>
              <TableHead className="font-bold text-purple-800">티어</TableHead>
              <TableHead className="font-bold text-purple-800">Instagram</TableHead>
              <TableHead className="font-bold text-purple-800">최근 평가</TableHead>
              <TableHead className="font-bold text-purple-800">가입일</TableHead>
              <TableHead className="font-bold text-purple-800">최근 로그인</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, index) => (
              <TableRow key={account.user_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="sticky left-0 bg-inherit font-medium">
                  <div className="max-w-[200px] truncate" title={account.email}>
                    {account.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    account.provider === 'google' ? 'border-blue-500 text-blue-600' :
                    account.provider === 'kakao' ? 'border-yellow-500 text-yellow-600' :
                    'border-gray-500 text-gray-600'
                  }>
                    {account.provider === 'google' ? '구글' : 
                     account.provider === 'kakao' ? '카카오' : account.provider}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    account.gender === 'male' ? 'border-blue-500 text-blue-600' : 'border-pink-500 text-pink-600'
                  }>
                    {account.gender === 'male' ? '남성' : '여성'}
                  </Badge>
                </TableCell>
                <TableCell>{account.age || '-'}</TableCell>
                <TableCell>{account.region || '-'}</TableCell>
                <TableCell className="font-bold">{account.total_score?.toFixed(1) || '0.0'}</TableCell>
                <TableCell>
                  {account.tier && (
                    <Badge className={getTierColor(account.tier)}>{account.tier}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm max-w-[100px] truncate" title={account.instagram_id}>
                      {account.instagram_id || '-'}
                    </span>
                    {account.instagram_id && (
                      <Badge variant="outline" className="text-xs">
                        {account.instagram_public ? '공개' : '비공개'}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {account.last_evaluated_at 
                    ? new Date(account.last_evaluated_at).toLocaleDateString('ko-KR')
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {new Date(account.auth_created_at).toLocaleDateString('ko-KR')}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {account.last_sign_in_at 
                    ? new Date(account.last_sign_in_at).toLocaleDateString('ko-KR')
                    : '없음'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* 무한 스크롤 로드 더 보기 */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}