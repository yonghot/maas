'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, RotateCcw, Save, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

// 기본 가중치 설정
const DEFAULT_WEIGHTS = {
  male: {
    wealth: 0.6,
    sense: 0.3,
    physical: 0.1
  },
  female: {
    young: { // 35세 미만 평가자
      age: 0.2,
      appearance: 0.4,
      values: 0.4
    },
    old: { // 35세 이상 평가자
      age: 0.4,
      appearance: 0.2,
      values: 0.4
    }
  }
};

// 샘플 점수 (테스트용)
const SAMPLE_SCORES = {
  male: {
    wealth: 70,
    sense: 65,
    physical: 80
  },
  female: {
    age: 85,
    appearance: 75,
    values: 70
  }
};

export default function ScoringManagementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 가중치 상태
  const [maleWeights, setMaleWeights] = useState(DEFAULT_WEIGHTS.male);
  const [femaleYoungWeights, setFemaleYoungWeights] = useState(DEFAULT_WEIGHTS.female.young);
  const [femaleOldWeights, setFemaleOldWeights] = useState(DEFAULT_WEIGHTS.female.old);
  
  // 시뮬레이션 점수
  const [simulationScores, setSimulationScores] = useState(SAMPLE_SCORES);
  
  // 계산된 최종 점수
  const [maleResult, setMaleResult] = useState(0);
  const [femaleYoungResult, setFemaleYoungResult] = useState(0);
  const [femaleOldResult, setFemaleOldResult] = useState(0);

  useEffect(() => {
    // 관리자 인증 확인
    const localAuth = localStorage.getItem('adminAuth');
    const sessionAuth = sessionStorage.getItem('adminAuth');
    const isAdminAuth = localAuth || sessionAuth;
    
    if (!isAdminAuth || isAdminAuth !== 'true') {
      router.push('/login?redirect=/admin');
      return;
    }
    setIsAuthenticated(true);
    loadWeights(); // 가중치 불러오기
  }, [router]);

  // 서버에서 가중치 불러오기
  const loadWeights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scoring-weights');
      if (response.ok) {
        const data = await response.json();
        if (data.weights) {
          if (data.weights.male) {
            setMaleWeights(data.weights.male);
          }
          if (data.weights.female?.young) {
            setFemaleYoungWeights(data.weights.female.young);
          }
          if (data.weights.female?.old) {
            setFemaleOldWeights(data.weights.female.old);
          }
        }
      }
    } catch (error) {
      console.error('가중치 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 가중치 저장
  const saveWeights = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/scoring-weights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-maas-2025'
        },
        body: JSON.stringify({
          maleWeights,
          femaleYoungWeights,
          femaleOldWeights
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('저장 실패');
      }
    } catch (error) {
      console.error('가중치 저장 실패:', error);
      alert('가중치 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 점수 계산 함수
  useEffect(() => {
    // 남성 점수 계산
    const maleScore = Math.round(
      simulationScores.male.wealth * maleWeights.wealth +
      simulationScores.male.sense * maleWeights.sense +
      simulationScores.male.physical * maleWeights.physical
    );
    setMaleResult(maleScore);

    // 여성 점수 계산 (젊은 평가자)
    const femaleYoungScore = Math.round(
      simulationScores.female.age * femaleYoungWeights.age +
      simulationScores.female.appearance * femaleYoungWeights.appearance +
      simulationScores.female.values * femaleYoungWeights.values
    );
    setFemaleYoungResult(femaleYoungScore);

    // 여성 점수 계산 (나이든 평가자)
    const femaleOldScore = Math.round(
      simulationScores.female.age * femaleOldWeights.age +
      simulationScores.female.appearance * femaleOldWeights.appearance +
      simulationScores.female.values * femaleOldWeights.values
    );
    setFemaleOldResult(femaleOldScore);
  }, [maleWeights, femaleYoungWeights, femaleOldWeights, simulationScores]);

  // 가중치 조절 함수
  const adjustMaleWeight = (category: string, value: number) => {
    const newValue = value / 100;
    const oldValue = maleWeights[category as keyof typeof maleWeights];
    const diff = newValue - oldValue;
    
    // 다른 가중치들을 비례적으로 조정
    const otherKeys = Object.keys(maleWeights).filter(k => k !== category);
    const totalOthers = otherKeys.reduce((sum, key) => sum + maleWeights[key as keyof typeof maleWeights], 0);
    
    const newWeights = { ...maleWeights };
    newWeights[category as keyof typeof maleWeights] = newValue;
    
    otherKeys.forEach(key => {
      const ratio = totalOthers > 0 ? maleWeights[key as keyof typeof maleWeights] / totalOthers : 0.5;
      newWeights[key as keyof typeof maleWeights] = Math.max(0, maleWeights[key as keyof typeof maleWeights] - diff * ratio);
    });
    
    // 정규화 (합이 1이 되도록)
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    Object.keys(newWeights).forEach(key => {
      newWeights[key as keyof typeof newWeights] = newWeights[key as keyof typeof newWeights] / sum;
    });
    
    setMaleWeights(newWeights);
  };

  const adjustFemaleWeight = (ageGroup: 'young' | 'old', category: string, value: number) => {
    const weights = ageGroup === 'young' ? femaleYoungWeights : femaleOldWeights;
    const setWeights = ageGroup === 'young' ? setFemaleYoungWeights : setFemaleOldWeights;
    
    const newValue = value / 100;
    const oldValue = weights[category as keyof typeof weights];
    const diff = newValue - oldValue;
    
    const otherKeys = Object.keys(weights).filter(k => k !== category);
    const totalOthers = otherKeys.reduce((sum, key) => sum + weights[key as keyof typeof weights], 0);
    
    const newWeights = { ...weights };
    newWeights[category as keyof typeof weights] = newValue;
    
    otherKeys.forEach(key => {
      const ratio = totalOthers > 0 ? weights[key as keyof typeof weights] / totalOthers : 0.5;
      newWeights[key as keyof typeof weights] = Math.max(0, weights[key as keyof typeof weights] - diff * ratio);
    });
    
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    Object.keys(newWeights).forEach(key => {
      newWeights[key as keyof typeof newWeights] = newWeights[key as keyof typeof newWeights] / sum;
    });
    
    setWeights(newWeights);
  };

  // 초기화 함수
  const resetWeights = () => {
    setMaleWeights(DEFAULT_WEIGHTS.male);
    setFemaleYoungWeights(DEFAULT_WEIGHTS.female.young);
    setFemaleOldWeights(DEFAULT_WEIGHTS.female.old);
  };

  // 차트 데이터 준비
  const maleChartData = [
    { subject: '재력', value: simulationScores.male.wealth, fullMark: 100 },
    { subject: '센스', value: simulationScores.male.sense, fullMark: 100 },
    { subject: '피지컬', value: simulationScores.male.physical, fullMark: 100 },
  ];

  const femaleChartData = [
    { subject: '나이', value: simulationScores.female.age, fullMark: 100 },
    { subject: '외모', value: simulationScores.female.appearance, fullMark: 100 },
    { subject: '가치관', value: simulationScores.female.values, fullMark: 100 },
  ];

  // 등급 계산
  const getGrade = (score: number) => {
    if (score >= 95) return { grade: 'S', color: 'bg-yellow-500' };
    if (score >= 85) return { grade: 'A', color: 'bg-purple-500' };
    if (score >= 70) return { grade: 'B', color: 'bg-blue-500' };
    if (score >= 55) return { grade: 'C', color: 'bg-green-500' };
    if (score >= 40) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">평가 기준 관리</h1>
            <p className="mt-2 text-gray-600">평가 가중치를 조절하고 실시간으로 결과를 확인하세요</p>
          </div>
          <div className="flex gap-4">
            {saveSuccess && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">저장 완료!</span>
              </div>
            )}
            <Button 
              onClick={saveWeights} 
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  가중치 저장
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetWeights}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="male" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="male">남성 평가 (CAI-M)</TabsTrigger>
            <TabsTrigger value="female">여성 평가 (CAI-F)</TabsTrigger>
          </TabsList>

          {/* 남성 평가 탭 */}
          <TabsContent value="male" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 가중치 조절 */}
              <Card>
                <CardHeader>
                  <CardTitle>가중치 조절</CardTitle>
                  <CardDescription>각 카테고리의 가중치를 조절하세요 (합계: 100%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>재력 (Wealth)</Label>
                      <span className="text-sm font-medium">{(maleWeights.wealth * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[maleWeights.wealth * 100]}
                      onValueChange={(value) => adjustMaleWeight('wealth', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>센스 (Sense)</Label>
                      <span className="text-sm font-medium">{(maleWeights.sense * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[maleWeights.sense * 100]}
                      onValueChange={(value) => adjustMaleWeight('sense', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>피지컬 (Physical)</Label>
                      <span className="text-sm font-medium">{(maleWeights.physical * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[maleWeights.physical * 100]}
                      onValueChange={(value) => adjustMaleWeight('physical', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 시뮬레이션 */}
              <Card>
                <CardHeader>
                  <CardTitle>점수 시뮬레이션</CardTitle>
                  <CardDescription>샘플 점수로 결과를 미리 확인하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>재력 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.male.wealth}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.male.wealth]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        male: { ...simulationScores.male, wealth: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>센스 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.male.sense}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.male.sense]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        male: { ...simulationScores.male, sense: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>피지컬 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.male.physical}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.male.physical]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        male: { ...simulationScores.male, physical: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">최종 점수</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-600">{maleResult}점</span>
                        <Badge className={getGrade(maleResult).color}>{getGrade(maleResult).grade}급</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 차트 */}
            <Card>
              <CardHeader>
                <CardTitle>점수 분포 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={maleChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="점수"
                      dataKey="value"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 여성 평가 탭 */}
          <TabsContent value="female" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 젊은 평가자 가중치 */}
              <Card>
                <CardHeader>
                  <CardTitle>35세 미만 평가자 가중치</CardTitle>
                  <CardDescription>젊은 남성의 관점</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>나이 (Age)</Label>
                      <span className="text-sm font-medium">{(femaleYoungWeights.age * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleYoungWeights.age * 100]}
                      onValueChange={(value) => adjustFemaleWeight('young', 'age', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>외모 (Appearance)</Label>
                      <span className="text-sm font-medium">{(femaleYoungWeights.appearance * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleYoungWeights.appearance * 100]}
                      onValueChange={(value) => adjustFemaleWeight('young', 'appearance', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>가치관 (Values)</Label>
                      <span className="text-sm font-medium">{(femaleYoungWeights.values * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleYoungWeights.values * 100]}
                      onValueChange={(value) => adjustFemaleWeight('young', 'values', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">최종 점수</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-pink-600">{femaleYoungResult}점</span>
                        <Badge className={getGrade(femaleYoungResult).color}>{getGrade(femaleYoungResult).grade}급</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 나이든 평가자 가중치 */}
              <Card>
                <CardHeader>
                  <CardTitle>35세 이상 평가자 가중치</CardTitle>
                  <CardDescription>성숙한 남성의 관점</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>나이 (Age)</Label>
                      <span className="text-sm font-medium">{(femaleOldWeights.age * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleOldWeights.age * 100]}
                      onValueChange={(value) => adjustFemaleWeight('old', 'age', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>외모 (Appearance)</Label>
                      <span className="text-sm font-medium">{(femaleOldWeights.appearance * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleOldWeights.appearance * 100]}
                      onValueChange={(value) => adjustFemaleWeight('old', 'appearance', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>가치관 (Values)</Label>
                      <span className="text-sm font-medium">{(femaleOldWeights.values * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[femaleOldWeights.values * 100]}
                      onValueChange={(value) => adjustFemaleWeight('old', 'values', value[0])}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">최종 점수</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-pink-600">{femaleOldResult}점</span>
                        <Badge className={getGrade(femaleOldResult).color}>{getGrade(femaleOldResult).grade}급</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시뮬레이션 점수 조절 */}
            <Card>
              <CardHeader>
                <CardTitle>점수 시뮬레이션</CardTitle>
                <CardDescription>샘플 점수로 결과를 미리 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>나이 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.female.age}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.female.age]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        female: { ...simulationScores.female, age: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>외모 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.female.appearance}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.female.appearance]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        female: { ...simulationScores.female, appearance: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>가치관 점수</Label>
                      <span className="text-sm font-medium">{simulationScores.female.values}점</span>
                    </div>
                    <Slider
                      value={[simulationScores.female.values]}
                      onValueChange={(value) => setSimulationScores({
                        ...simulationScores,
                        female: { ...simulationScores.female, values: value[0] }
                      })}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 차트 */}
            <Card>
              <CardHeader>
                <CardTitle>점수 분포 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={femaleChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="점수"
                      dataKey="value"
                      stroke="#ec4899"
                      fill="#ec4899"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 평가 기준 설명 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>평가 기준 상세 설명</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold">남성 평가 (CAI-M)</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">재력 (Wealth):</span> 소득, 자산, 직업 안정성
                  </div>
                  <div>
                    <span className="font-medium">센스 (Sense):</span> 사회적 지능, 유머 감각, 긍정성
                  </div>
                  <div>
                    <span className="font-medium">피지컬 (Physical):</span> BMI, 운동 습관, 스타일
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-semibold">여성 평가 (CAI-F)</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">나이 (Age):</span> 생물학적 나이 기반 고정 점수
                  </div>
                  <div>
                    <span className="font-medium">외모 (Appearance):</span> 매력도, 몸매 관리, 스타일
                  </div>
                  <div>
                    <span className="font-medium">가치관 (Values):</span> 정서적 안정성, 합리적 사고, 가족 가치관
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}