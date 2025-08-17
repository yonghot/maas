import { Question } from '@/lib/types';

export const maleQuestions: Question[] = [
  // ===== 재력 관련 질문 =====
  {
    id: 'income',
    category: 'wealth',
    text: '현재 연 소득은 얼마입니까?',
    subText: '세전 기준으로 선택해주세요',
    type: 'select',
    options: [
      { value: 2000, label: '3천만원 미만', score: 10 },
      { value: 4000, label: '3천-5천만원', score: 20 },
      { value: 6000, label: '5천-7천만원', score: 30 },
      { value: 8500, label: '7천만-1억원', score: 40 },
      { value: 12000, label: '1억원 초과', score: 50 }
    ],
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'assets',
    category: 'wealth',
    text: '순자산은 얼마입니까?',
    subText: '부동산, 금융자산 등 모든 자산에서 부채를 뺀 금액',
    type: 'select',
    options: [
      { value: 3000, label: '5천만원 미만', score: 5 },
      { value: 12500, label: '5천만-2억원', score: 15 },
      { value: 30000, label: '2억원 초과', score: 30 }
    ],
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'job_stability',
    category: 'wealth',
    text: '현재 직업의 안정성은 어느 정도입니까?',
    type: 'select',
    options: [
      { value: 5, label: '불안정 (무직, 일용직)', score: 5 },
      { value: 10, label: '보통 (계약직, 프리랜서)', score: 10 },
      { value: 15, label: '안정적 (중소기업 정규직)', score: 15 },
      { value: 20, label: '매우 안정적 (대기업, 공무원, 전문직)', score: 20 }
    ],
    genderSpecific: 'male',
    required: true
  },

  // ===== 센스 관련 질문 =====
  {
    id: 'social_intelligence',
    category: 'sense',
    text: '대화 시 분위기를 주도하고 상대방의 감정을 잘 파악하시나요?',
    type: 'slider',
    min: 10,
    max: 40,
    step: 5,
    labels: {
      10: '전혀 아님',
      25: '보통',
      40: '매우 그렇다'
    },
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'humor',
    category: 'sense',
    text: '이성에게 유머 감각이 뛰어나다는 평을 자주 듣나요?',
    type: 'slider',
    min: 5,
    max: 30,
    step: 5,
    labels: {
      5: '전혀 아님',
      15: '보통',
      30: '매우 자주'
    },
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'positivity',
    category: 'sense',
    text: '어려운 상황에서도 긍정적인 태도를 유지하고 해결책을 찾나요?',
    type: 'slider',
    min: 5,
    max: 30,
    step: 5,
    labels: {
      5: '전혀 아님',
      15: '보통',
      30: '매우 그렇다'
    },
    genderSpecific: 'male',
    required: true
  },

  // ===== 피지컬 관련 질문 =====
  {
    id: 'height',
    category: 'physical',
    text: '키를 입력해주세요',
    subText: 'cm 단위로 입력',
    type: 'number',
    min: 150,
    max: 200,
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'weight',
    category: 'physical',
    text: '몸무게를 입력해주세요',
    subText: 'kg 단위로 입력',
    type: 'number',
    min: 40,
    max: 150,
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'exercise',
    category: 'physical',
    text: '주 2회 이상 꾸준히 운동을 하시나요?',
    type: 'select',
    options: [
      { value: 10, label: '전혀 안 함', score: 10 },
      { value: 20, label: '가끔 함', score: 20 },
      { value: 30, label: '규칙적으로 함', score: 30 },
      { value: 40, label: '매우 열심히 함', score: 40 }
    ],
    genderSpecific: 'male',
    required: true
  },
  {
    id: 'style',
    category: 'physical',
    text: '평소 옷차림이나 외모 관리에 신경을 쓰시나요?',
    type: 'select',
    options: [
      { value: 5, label: '전혀 신경 안 씀', score: 5 },
      { value: 10, label: '보통', score: 10 },
      { value: 15, label: '신경 씀', score: 15 },
      { value: 20, label: '매우 신경 씀', score: 20 }
    ],
    genderSpecific: 'male',
    required: true
  }
];