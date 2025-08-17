import { 
  Gender, 
  Grade, 
  MaleScoring, 
  FemaleScoring, 
  TestResult, 
  UserInfo, 
  UserAnswer 
} from '@/lib/types';

export class ScoringCalculator {
  // 남성 점수 계산
  calculateMaleScore(answers: UserAnswer[], userInfo: UserInfo): TestResult {
    const scoring: MaleScoring = {
      wealth: { income: 0, assets: 0, jobStability: 0, total: 0 },
      sense: { socialIntelligence: 0, humor: 0, positivity: 0, total: 0 },
      physical: { bmi: 0, exercise: 0, style: 0, total: 0 }
    };

    // 답변에서 점수 추출
    answers.forEach(answer => {
      switch(answer.questionId) {
        // 재력
        case 'income':
          scoring.wealth.income = answer.score || 0;
          break;
        case 'assets':
          scoring.wealth.assets = answer.score || 0;
          break;
        case 'job_stability':
          scoring.wealth.jobStability = answer.score || 0;
          break;
        // 센스
        case 'social_intelligence':
          scoring.sense.socialIntelligence = Number(answer.value) || 0;
          break;
        case 'humor':
          scoring.sense.humor = Number(answer.value) || 0;
          break;
        case 'positivity':
          scoring.sense.positivity = Number(answer.value) || 0;
          break;
        // 피지컬
        case 'exercise':
          scoring.physical.exercise = answer.score || 0;
          break;
        case 'style':
          scoring.physical.style = answer.score || 0;
          break;
      }
    });

    // BMI 계산
    const height = answers.find(a => a.questionId === 'height')?.value as number;
    const weight = answers.find(a => a.questionId === 'weight')?.value as number;
    if (height && weight) {
      const bmi = weight / ((height / 100) ** 2);
      if (bmi >= 18.5 && bmi <= 24.9) {
        scoring.physical.bmi = 40;
      } else if (bmi < 18.5 || (bmi >= 25 && bmi <= 29.9)) {
        scoring.physical.bmi = 20;
      } else {
        scoring.physical.bmi = 10;
      }
    }

    // 카테고리별 총점 계산
    scoring.wealth.total = scoring.wealth.income + scoring.wealth.assets + scoring.wealth.jobStability;
    scoring.sense.total = scoring.sense.socialIntelligence + scoring.sense.humor + scoring.sense.positivity;
    scoring.physical.total = scoring.physical.bmi + scoring.physical.exercise + scoring.physical.style;

    // 최종 점수 계산 (가중치 적용)
    const finalScore = Math.round(
      (scoring.wealth.total * 0.6) + 
      (scoring.sense.total * 0.3) + 
      (scoring.physical.total * 0.1)
    );

    // 등급 산정
    const gradeInfo = this.getGrade(finalScore);

    // 분석 생성
    const analysis = this.generateMaleAnalysis(scoring);

    return {
      id: this.generateId(),
      userInfo,
      score: finalScore,
      grade: gradeInfo.grade,
      gradeInfo,
      categories: scoring,
      ...analysis,
      createdAt: new Date()
    };
  }

  // 여성 점수 계산
  calculateFemaleScore(answers: UserAnswer[], userInfo: UserInfo, evaluatorAge: number = 35): TestResult {
    const scoring: FemaleScoring = {
      age: { biologicalAge: 0, total: 0 },
      appearance: { attractiveness: 0, bodyManagement: 0, style: 0, total: 0 },
      values: { emotionalStability: 0, rationalThinking: 0, familyValues: 0, total: 0 }
    };

    // 나이 점수 계산
    const age = userInfo.age;
    if (age <= 29) scoring.age.biologicalAge = 95;
    else if (age <= 32) scoring.age.biologicalAge = 85;
    else if (age <= 34) scoring.age.biologicalAge = 75;
    else if (age === 35) scoring.age.biologicalAge = 60;
    else if (age <= 37) scoring.age.biologicalAge = 50;
    else if (age <= 40) scoring.age.biologicalAge = 35;
    else scoring.age.biologicalAge = 20;
    
    scoring.age.total = scoring.age.biologicalAge;

    // 답변에서 점수 추출
    answers.forEach(answer => {
      switch(answer.questionId) {
        // 외모
        case 'attractiveness':
          scoring.appearance.attractiveness = Number(answer.value) || 0;
          break;
        case 'body_management':
          scoring.appearance.bodyManagement = Number(answer.value) || 0;
          break;
        case 'style_atmosphere':
          scoring.appearance.style = Number(answer.value) || 0;
          break;
        // 가치관
        case 'emotional_stability':
          scoring.values.emotionalStability = Number(answer.value) || 0;
          break;
        case 'rational_thinking':
          scoring.values.rationalThinking = Number(answer.value) || 0;
          break;
        case 'family_values':
          scoring.values.familyValues = Number(answer.value) || 0;
          break;
      }
    });

    // 카테고리별 총점 계산
    scoring.appearance.total = scoring.appearance.attractiveness + scoring.appearance.bodyManagement + scoring.appearance.style;
    scoring.values.total = scoring.values.emotionalStability + scoring.values.rationalThinking + scoring.values.familyValues;

    // 최종 점수 계산 (평가자 연령에 따른 가중치)
    let finalScore: number;
    if (evaluatorAge < 35) {
      finalScore = Math.round(
        (scoring.age.total * 0.2) + 
        (scoring.appearance.total * 0.4) + 
        (scoring.values.total * 0.4)
      );
    } else {
      finalScore = Math.round(
        (scoring.age.total * 0.4) + 
        (scoring.appearance.total * 0.2) + 
        (scoring.values.total * 0.4)
      );
    }

    // 등급 산정
    const gradeInfo = this.getGrade(finalScore);

    // 분석 생성
    const analysis = this.generateFemaleAnalysis(scoring);

    return {
      id: this.generateId(),
      userInfo,
      score: finalScore,
      grade: gradeInfo.grade,
      gradeInfo,
      categories: scoring,
      ...analysis,
      createdAt: new Date()
    };
  }

  // 등급 산정
  private getGrade(score: number): { grade: Grade; title: string; description: string; color: string } {
    if (score >= 95) return { 
      grade: 'S', 
      title: '결혼 끝판왕',
      description: '상위 1% - 모든 면에서 완벽한 매력',
      color: 'from-yellow-400 to-yellow-600'
    };
    if (score >= 85) return { 
      grade: 'A', 
      title: '결혼 준비 완료',
      description: '상위 10% - 매우 매력적인 결혼 상대',
      color: 'from-purple-400 to-purple-600'
    };
    if (score >= 70) return { 
      grade: 'B', 
      title: '매력 충분',
      description: '상위 30% - 충분히 매력적',
      color: 'from-blue-400 to-blue-600'
    };
    if (score >= 55) return { 
      grade: 'C', 
      title: '노력하면 가능',
      description: '평균 수준 - 몇 가지 개선 필요',
      color: 'from-green-400 to-green-600'
    };
    if (score >= 40) return { 
      grade: 'D', 
      title: '자기계발 필요',
      description: '하위 30% - 많은 노력 필요',
      color: 'from-orange-400 to-orange-600'
    };
    return { 
      grade: 'F', 
      title: '솔로가 편해요',
      description: '하위 10% - 전면적인 개선 필요',
      color: 'from-red-400 to-red-600'
    };
  }

  // 남성 분석 생성
  private generateMaleAnalysis(scores: MaleScoring) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const advice: string[] = [];

    // 재력 분석
    if (scores.wealth.total >= 80) {
      strengths.push('탄탄한 경제력');
    } else if (scores.wealth.total <= 40) {
      weaknesses.push('경제력 개선 필요');
      advice.push('커리어 개발과 재테크에 더 신경쓰세요');
    }

    // 센스 분석
    if (scores.sense.total >= 70) {
      strengths.push('뛰어난 소통 능력과 유머');
    } else if (scores.sense.total <= 40) {
      weaknesses.push('대인관계 스킬 부족');
      advice.push('다양한 사람들과 교류하며 소통 능력을 키우세요');
    }

    // 피지컬 분석
    if (scores.physical.total >= 70) {
      strengths.push('건강한 신체와 좋은 외모 관리');
    } else if (scores.physical.total <= 40) {
      weaknesses.push('자기관리 부족');
      advice.push('규칙적인 운동과 스타일 개선에 투자하세요');
    }

    const summary = `당신은 ${strengths.length > 0 ? strengths.join(', ') + '를 가진' : ''} 
      ${weaknesses.length > 0 ? '하지만 ' + weaknesses.join(', ') + '이 필요한' : ''} 남성입니다.`;

    return { strengths, weaknesses, advice, summary: summary.trim() };
  }

  // 여성 분석 생성
  private generateFemaleAnalysis(scores: FemaleScoring) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const advice: string[] = [];

    // 나이 분석
    if (scores.age.total >= 85) {
      strengths.push('최적의 결혼 적령기');
    } else if (scores.age.total <= 50) {
      advice.push('나이는 숫자일 뿐, 다른 매력을 더욱 강화하세요');
    }

    // 외모 분석
    if (scores.appearance.total >= 70) {
      strengths.push('뛰어난 외모와 자기관리');
    } else if (scores.appearance.total <= 40) {
      weaknesses.push('외모 관리 필요');
      advice.push('건강한 식단과 운동, 스타일 연구를 통해 매력을 높이세요');
    }

    // 가치관 분석
    if (scores.values.total >= 70) {
      strengths.push('안정적인 정서와 성숙한 가치관');
    } else if (scores.values.total <= 40) {
      weaknesses.push('정서적 안정성 부족');
      advice.push('명상이나 상담을 통해 내면의 안정을 찾으세요');
    }

    const summary = `당신은 ${strengths.length > 0 ? strengths.join(', ') + '을 가진' : ''} 
      ${weaknesses.length > 0 ? '하지만 ' + weaknesses.join(', ') + '이 필요한' : ''} 여성입니다.`;

    return { strengths, weaknesses, advice, summary: summary.trim() };
  }

  // ID 생성
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}