# CLAUDE.md - 개발 기본 지침서

이 문서는 모든 프로젝트에서 코드를 분석, 작성, 수정할 때 준수해야 할 기본 원칙과 지침을 정의합니다.

## 목차
1. [기본 원칙](#기본-원칙)
2. [코드 작성 표준](#코드-작성-표준)
3. [모듈화 원칙](#모듈화-원칙)
4. [구현 방침](#구현-방침)
5. [디버깅 원칙](#디버깅-원칙)
6. [문서화 규칙](#문서화-규칙)
7. [품질 관리](#품질-관리)
8. [보안 원칙](#보안-원칙)

---

## 기본 원칙

### 1. 언어 설정
- **항상 한국어로 응답**
- 코드 주석도 한국어로 작성
- 기술 용어는 필요시 영어 병기 가능

### 2. 핵심 철학
- **증거 기반 개발**: 추측이 아닌 검증된 사실 기반
- **최소 변경 원칙**: 요청된 사항만 정확히 구현
- **명확한 커뮤니케이션**: 간결하고 명확한 설명

---

## 코드 작성 표준

### Google Style Guide 준수
```javascript
// 좋은 예
function calculateScore(answers) {
  const validAnswers = answers.filter(a => a.value !== null);
  return validAnswers.reduce((sum, a) => sum + a.score, 0);
}

// 나쁜 예
function calc(a){
  return a.filter(x=>x.value).reduce((s,x)=>s+x.score,0)
}
```

### 코드 품질 기준
1. **가독성 우선**
   - 명확한 변수명과 함수명 사용
   - 복잡한 로직에는 주석 필수
   - 한 함수는 하나의 책임만

2. **일관성 유지**
   - 프로젝트 내 동일한 코딩 스타일
   - ESLint/Prettier 규칙 엄격 준수
   - 네이밍 컨벤션 통일

3. **타입 안정성**
   ```typescript
   // TypeScript strict mode 필수
   interface UserData {
     id: string;
     name: string;
     age: number;
   }
   ```

---

## 모듈화 원칙

### 1. 단일 책임 원칙 (SRP)
```typescript
// 좋은 예 - 각 모듈이 하나의 책임만 가짐
// auth.module.ts
export class AuthModule {
  login() { /* 로그인 로직 */ }
  logout() { /* 로그아웃 로직 */ }
}

// scoring.module.ts
export class ScoringModule {
  calculate() { /* 점수 계산 */ }
  normalize() { /* 정규화 */ }
}
```

### 2. 의존성 격리
```typescript
// 모듈 간 인터페이스 정의
interface IScoringService {
  calculateScore(data: any): number;
}

// 구현체는 인터페이스에만 의존
class ScoringService implements IScoringService {
  calculateScore(data: any): number {
    // 독립적인 구현
  }
}
```

### 3. 모듈 명명 규칙
- **기능별 분류**: `auth.module`, `payment.module`, `user.module`
- **계층별 분류**: `controller`, `service`, `repository`
- **명확한 경계**: 각 모듈의 역할과 범위 명시

### 4. 영향 범위 제한
```typescript
// 수정 전 영향 분석 필수
// 1. 해당 모듈만 수정
// 2. 의존 모듈 확인
// 3. 테스트 범위 설정
// 4. 격리된 수정 실행
```

---

## 구현 방침

### 1. 보수적 구현 원칙
```typescript
// 요청: "사용자 목록 보여줘"
// ❌ 나쁜 예 - 요청하지 않은 기능 추가
function getUserList() {
  // 사용자 목록
  // + 페이지네이션 (요청 X)
  // + 필터링 (요청 X)  
  // + 정렬 기능 (요청 X)
}

// ✅ 좋은 예 - 요청한 기능만 구현
function getUserList() {
  // 사용자 목록만 반환
  return users;
}
```

### 2. 기능 추가 규칙
- **명시적 요청만 구현**: 추측하지 않고 확인
- **단계적 확장**: 기본 기능 → 검증 → 추가 기능
- **문서화 우선**: 구현 전 요구사항 문서화

### 3. 기존 코드 우선
- 새 파일 생성보다 기존 파일 수정 선호
- 기존 패턴과 컨벤션 따르기
- 리팩토링은 별도 요청시에만

---

## 디버깅 원칙

### 1. 근본 원인 분석 (Root Cause Analysis)
```typescript
// ❌ 임시 방편
try {
  riskyOperation();
} catch (e) {
  // 에러 무시
}

// ✅ 근본 원인 해결
try {
  validateInput(data);  // 원인 1: 입력 검증 누락
  checkPermission();    // 원인 2: 권한 체크 누락
  riskyOperation();
} catch (e) {
  logger.error('Operation failed', e);
  throw new AppError('작업 실패', e);
}
```

### 2. 재발 방지 메커니즘
1. **원인 분석**: 왜 5번 기법(5 Whys) 활용
2. **해결책 구현**: 근본 원인 제거
3. **테스트 추가**: 재발 방지 테스트
4. **문서화**: 해결 과정과 예방법 기록

### 3. 디버깅 체크리스트
- [ ] 에러 메시지와 스택 트레이스 분석
- [ ] 재현 가능한 최소 케이스 작성
- [ ] 관련 코드 히스토리 확인
- [ ] 유사 이슈 검색
- [ ] 해결 후 회귀 테스트

### 4. 문제 해결 패턴 기록
```markdown
## 이슈: [문제 설명]
### 증상
- 어떤 현상이 발생했는지

### 원인
- 근본 원인 분석 결과

### 해결
- 적용한 해결 방법

### 예방
- 재발 방지 조치
```

---

## 문서화 규칙

### 1. 코드 내 문서화
```typescript
/**
 * 사용자 점수 계산
 * @param answers - 사용자 답변 배열
 * @returns 정규화된 점수 (0-100)
 * @throws ValidationError - 유효하지 않은 답변
 */
function calculateScore(answers: Answer[]): number {
  // 1. 입력 검증
  validateAnswers(answers);
  
  // 2. 가중치 적용
  const weighted = applyWeights(answers);
  
  // 3. 정규화
  return normalize(weighted);
}
```

### 2. 프로젝트 문서 관리
- **CLAUDE.md**: 개발 기본 지침 (이 문서)
- **PRD.md**: 프로젝트 요구사항 정의
- **DESIGN.md**: UI/UX 디자인 시스템
- **README.md**: 프로젝트 개요와 시작 가이드
- **ALL_PROMPT.md**: 주요 프롬프트 로그

### 3. 변경 사항 추적
```markdown
## 변경 로그
- 날짜: 변경 내용
- 이유: 변경 사유
- 영향: 영향 받는 모듈
```

---

## 품질 관리

### 1. 테스트 기준
```typescript
// 단위 테스트 필수
describe('ScoringModule', () => {
  it('should calculate score correctly', () => {
    expect(calculate([...])).toBe(75);
  });
  
  it('should handle edge cases', () => {
    expect(calculate([])).toBe(0);
    expect(calculate(null)).toThrow();
  });
});
```

### 2. 코드 리뷰 체크리스트
- [ ] 요구사항 충족 여부
- [ ] 코드 스타일 가이드 준수
- [ ] 테스트 커버리지
- [ ] 성능 영향도
- [ ] 보안 취약점

### 3. 배포 전 검증
```bash
# 필수 검증 단계
npm run lint        # 린트 검사
npm run test        # 테스트 실행
npm run build       # 빌드 성공 확인
npm run type-check  # 타입 체크
```

---

## 보안 원칙

### 1. 민감 정보 보호
```typescript
// ❌ 하드코딩 금지
const API_KEY = "sk-abc123...";

// ✅ 환경 변수 사용
const API_KEY = process.env.API_KEY;
```

### 2. 입력 검증
```typescript
// 모든 사용자 입력 검증
function validateInput(input: string): string {
  // XSS 방지
  const sanitized = DOMPurify.sanitize(input);
  
  // SQL Injection 방지
  const escaped = escapeSQL(sanitized);
  
  return escaped;
}
```

### 3. 인증/인가
- 모든 API 엔드포인트 보호
- 최소 권한 원칙 적용
- 세션 관리 보안

---

## 성능 최적화

### 1. 측정 우선
```typescript
// 추측하지 말고 측정하기
console.time('operation');
expensiveOperation();
console.timeEnd('operation'); // operation: 234ms
```

### 2. 점진적 개선
1. 병목 지점 식별
2. 개선 방안 수립
3. 측정 가능한 목표 설정
4. 구현 및 검증

---

## 버전 관리

### 1. 커밋 메시지 규칙
```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

### 2. 브랜치 전략
```bash
main        # 프로덕션
develop     # 개발
feature/*   # 기능 개발
hotfix/*    # 긴급 수정
```

---

## 지속적 개선

이 문서는 프로젝트 진행에 따라 계속 업데이트됩니다.
- 새로운 이슈 발생 시 해결 패턴 추가
- 베스트 프랙티스 발견 시 문서화
- 팀 피드백 반영

---

*최종 업데이트: 2025-01-04*