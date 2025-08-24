# 데이터베이스 스키마 근본적 개선 마이그레이션 계획

## 🎯 목표
**현재 문제**: 이중 사용자 테이블 구조로 인한 동기화 이슈 및 데이터 무결성 문제
**해결 방향**: 단일 테이블 구조로 개선하여 근본적 해결

## 📊 현재 상태 분석

### 문제점
1. **구조적 결함**
   ```
   auth.users (Supabase 자동) ←→ public.users (수동 관리) ←→ profiles
   ```
   - 동기화 메커니즘 부재
   - 수동 개입 필수 (휴먼 에러 위험)
   - 데이터 일관성 보장 어려움

2. **비즈니스 로직 모순**
   - Instagram ID 필수 설계 vs 소셜 로그인 사용패턴 불일치
   - `instagram_id NOT NULL` 제약으로 소셜 로그인 차단

3. **데이터 무결성 위험**
   - 임시 Instagram ID 생성으로 의미 없는 데이터 증가
   - Foreign Key 제약 위반 잠재성

## 🚀 마이그레이션 전략

### 옵션 1: 단일 테이블 구조 (권장 ⭐)

**장점**:
- 근본적 문제 해결
- 동기화 이슈 완전 제거
- 데이터 무결성 향상
- 코드 복잡성 감소

**단점**:
- 마이그레이션 복잡성
- 기존 코드 수정 필요

**구조**:
```sql
profiles (새로운 구조)
├── user_id REFERENCES auth.users(id) -- 직접 참조
├── 기본 프로필 (gender, age, region)
├── 평가 결과 (tier, grade, scores)
└── Instagram 정보 (선택사항)
```

### 옵션 2: 자동 동기화 메커니즘 (대안)

**장점**:
- 기존 구조 유지
- 점진적 적용 가능

**단점**:
- 복잡성 증가
- Supabase Trigger 제한
- 근본적 해결 아님

## 📝 마이그레이션 단계 (옵션 1)

### Phase 1: 새 스키마 준비
```sql
-- 1.1 새로운 profiles_new 테이블 생성
CREATE TABLE profiles_new (
  user_id UUID REFERENCES auth.users(id) -- 직접 참조
  -- ... 기타 컬럼들
);

-- 1.2 데이터 마이그레이션
INSERT INTO profiles_new 
SELECT ... FROM profiles p
LEFT JOIN users u ON p.user_id = u.id;
```

### Phase 2: 코드 수정
```typescript
// Before: profiles → public.users → auth.users
const profileData = {
  user_id: user.id, // public.users.id 참조
  // ...
};

// After: profiles → auth.users (직접)
const profileData = {
  user_id: user.id, // auth.users.id 직접 참조
  instagram_id: instagram_id || null, // NULL 허용
  // ...
};
```

### Phase 3: 테이블 교체
```sql
-- 3.1 기존 테이블 백업
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 3.2 기존 테이블 제거
DROP TABLE profiles;
DROP TABLE users; -- public.users 완전 제거

-- 3.3 새 테이블 활성화
ALTER TABLE profiles_new RENAME TO profiles;
```

### Phase 4: 검증 및 정리
- 데이터 무결성 검증
- 애플리케이션 기능 테스트
- 백업 테이블 정리

## 🔄 롤백 계획

### 문제 발생 시
```sql
-- 긴급 롤백
DROP TABLE profiles;
ALTER TABLE profiles_backup RENAME TO profiles;

-- 수동으로 public.users 복원
-- 애플리케이션 이전 버전으로 롤백
```

## ⚠️ 위험 요소 및 대응

### 위험 1: 데이터 손실
**대응**: 마이그레이션 전 전체 데이터 백업

### 위험 2: 다운타임
**대응**: 
- 새 테이블 미리 생성 → 데이터 복사 → 원자적 교체
- 점검 시간대 마이그레이션 실행

### 위험 3: 코드 호환성
**대응**: 
- 마이그레이션 전 코드 수정 완료
- 철저한 테스트 환경 검증

## 📋 체크리스트

### 사전 준비
- [ ] 전체 데이터베이스 백업
- [ ] 스키마 변경사항 코드 반영
- [ ] 테스트 환경 마이그레이션 검증
- [ ] 롤백 스크립트 준비

### 실행 단계
- [ ] 새 스키마 생성
- [ ] 데이터 마이그레이션 실행  
- [ ] 데이터 검증
- [ ] 테이블 교체
- [ ] 애플리케이션 기능 테스트

### 사후 정리
- [ ] 성능 모니터링
- [ ] 백업 테이블 정리
- [ ] 문서 업데이트
- [ ] 팀 공유

## 🗓️ 예상 일정

- **Phase 1 (스키마 준비)**: 1-2시간
- **Phase 2 (코드 수정)**: 2-3시간  
- **Phase 3 (실행)**: 30분 (다운타임)
- **Phase 4 (검증)**: 1-2시간
- **총 소요시간**: 4-7시간

## 📞 비상 연락체계

마이그레이션 중 문제 발생 시:
1. 즉시 롤백 실행
2. 개발팀 긴급 회의
3. 사용자 공지 (필요시)