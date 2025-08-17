import { Question } from '@/lib/types';

export const femaleQuestions: Question[] = [
  // ===== 나이 관련 질문 =====
  {
    id: 'age',
    category: 'age',
    text: '나이를 입력해주세요',
    subText: '만 나이 기준',
    type: 'number',
    min: 20,
    max: 50,
    genderSpecific: 'female',
    required: true
  },

  // ===== 외모 관련 질문 =====
  {
    id: 'attractiveness',
    category: 'appearance',
    text: '스스로 생각하기에 이성에게 어필할 만한 외모인가요?',
    subText: '객관적으로 평가해주세요',
    type: 'slider',
    min: 10,
    max: 50,
    step: 10,
    labels: {
      10: '전혀 아니다',
      30: '보통',
      50: '매우 그렇다'
    },
    genderSpecific: 'female',
    required: true
  },
  {
    id: 'body_management',
    category: 'appearance',
    text: '꾸준한 식단 관리나 운동으로 몸매를 관리하고 있나요?',
    type: 'slider',
    min: 5,
    max: 30,
    step: 5,
    labels: {
      5: '전혀 안 함',
      15: '보통',
      30: '매우 열심히'
    },
    genderSpecific: 'female',
    required: true
  },
  {
    id: 'style_atmosphere',
    category: 'appearance',
    text: '자신에게 어울리는 스타일을 알고 매력적인 분위기를 풍기나요?',
    type: 'slider',
    min: 5,
    max: 20,
    step: 5,
    labels: {
      5: '전혀 아니다',
      10: '보통',
      20: '매우 그렇다'
    },
    genderSpecific: 'female',
    required: true
  },

  // ===== 가치관 관련 질문 =====
  {
    id: 'emotional_stability',
    category: 'values',
    text: '스트레스 상황에서 감정적으로 행동하기보다 이성적으로 대처하나요?',
    type: 'slider',
    min: 10,
    max: 50,
    step: 10,
    labels: {
      10: '매우 감정적',
      30: '보통',
      50: '매우 이성적'
    },
    genderSpecific: 'female',
    required: true
  },
  {
    id: 'rational_thinking',
    category: 'values',
    text: '타인의 의견을 경청하고 논리적으로 대화할 수 있나요?',
    type: 'slider',
    min: 5,
    max: 30,
    step: 5,
    labels: {
      5: '전혀 아니다',
      15: '보통',
      30: '매우 그렇다'
    },
    genderSpecific: 'female',
    required: true
  },
  {
    id: 'family_values',
    category: 'values',
    text: '안정적인 가정을 꾸리는 것에 긍정적인가요?',
    type: 'slider',
    min: 5,
    max: 20,
    step: 5,
    labels: {
      5: '부정적',
      10: '보통',
      20: '매우 긍정적'
    },
    genderSpecific: 'female',
    required: true
  },

  // ===== 추가 정보 (외모 관련 상세) =====
  {
    id: 'height',
    category: 'appearance',
    text: '키를 입력해주세요',
    subText: 'cm 단위로 입력',
    type: 'number',
    min: 140,
    max: 185,
    genderSpecific: 'female',
    required: true
  },
  {
    id: 'weight',
    category: 'appearance',
    text: '몸무게를 입력해주세요',
    subText: 'kg 단위로 입력',
    type: 'number',
    min: 35,
    max: 100,
    genderSpecific: 'female',
    required: true
  }
];