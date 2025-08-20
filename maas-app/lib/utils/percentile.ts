/**
 * 정규분포 기반 백분위수 계산
 * 평균 5, 표준편차 1.5 (10점 만점 기준)
 */

// 표준정규분포 누적분포함수 (CDF) 계산
function normCDF(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / stdDev;
  
  // Abramowitz and Stegun 근사식 사용
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  
  const t = 1.0 / (1.0 + p * absZ);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;
  
  const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t) * Math.exp(-absZ * absZ / 2)) / Math.sqrt(2 * Math.PI);
  
  return 0.5 * (1.0 + sign * y);
}

// 백분위수 계산 (10점 만점 기준)
export function calculatePercentile(score: number): number {
  // 10점 만점 기준: 평균 5, 표준편차 1.5
  const mean = 5;
  const stdDev = 1.5;
  
  // CDF 계산 후 백분위수로 변환
  const cdf = normCDF(score, mean, stdDev);
  const percentile = (1 - cdf) * 100; // 상위 X%로 변환
  
  // 소수점 1자리까지 반올림
  return Math.round(percentile * 10) / 10;
}

// 백분위수에서 등급 계산
export function getGradeFromPercentile(percentile: number): {
  grade: string;
  tier: string;
  color: string;
  description: string;
} {
  // 상위 X% 기준 (낮을수록 좋음)
  if (percentile <= 0.01) return {
    grade: 'Challenger',
    tier: 'S+',
    color: 'from-yellow-400 to-yellow-600',
    description: '시장의 법칙을 지배하는 최상위 0.01%'
  };
  if (percentile <= 0.05) return {
    grade: 'Grandmaster',
    tier: 'S',
    color: 'from-purple-400 to-purple-600',
    description: '독보적 존재감의 상위 0.05%'
  };
  if (percentile <= 0.5) return {
    grade: 'Master',
    tier: 'S-',
    color: 'from-indigo-400 to-indigo-600',
    description: '선망의 대상, 상위 0.5%'
  };
  if (percentile <= 3) return {
    grade: 'Diamond',
    tier: 'A+',
    color: 'from-cyan-400 to-cyan-600',
    description: '확실한 상류층, 상위 3%'
  };
  if (percentile <= 15) return {
    grade: 'Emerald',
    tier: 'A',
    color: 'from-emerald-400 to-emerald-600',
    description: '상위권의 증명, 상위 15%'
  };
  if (percentile <= 35) return {
    grade: 'Platinum',
    tier: 'B+',
    color: 'from-slate-400 to-slate-600',
    description: '평균 이상의 매력, 상위 35%'
  };
  if (percentile <= 50) return {
    grade: 'Gold',
    tier: 'B',
    color: 'from-amber-400 to-amber-600',
    description: '대한민국 표준, 상위 50%'
  };
  if (percentile <= 65) return {
    grade: 'Silver',
    tier: 'C',
    color: 'from-gray-400 to-gray-600',
    description: '성장의 기회, 상위 65%'
  };
  if (percentile <= 85) return {
    grade: 'Bronze',
    tier: 'D',
    color: 'from-orange-400 to-orange-600',
    description: '기본기 구축, 상위 85%'
  };
  return {
    grade: 'Iron',
    tier: 'F',
    color: 'from-red-400 to-red-600',
    description: '자기 객관화의 시작'
  };
}

// 정규분포 그래프용 데이터 생성
export function generateNormalDistributionData() {
  const data = [];
  const mean = 5;
  const stdDev = 1.5;
  
  // 0부터 10까지 0.1 간격으로 데이터 생성
  for (let x = 0; x <= 10; x += 0.1) {
    const z = (x - mean) / stdDev;
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    data.push({
      x: Math.round(x * 10) / 10,
      y: y * 100, // 시각화를 위해 스케일 조정
      label: x.toFixed(1)
    });
  }
  
  return data;
}