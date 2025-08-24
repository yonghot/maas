-- 근본적 해결: 올바른 데이터베이스 구조 재설계
-- 🎯 목표: 단일 책임 원칙 적용, 데이터 무결성 보장

-- ==============================================
-- 옵션 1: 단일 테이블 구조 (권장 ⭐)
-- ==============================================

-- 1.1 기존 public.users 테이블 제거 후 profiles에 통합
/*
새로운 profiles 테이블 구조:
- auth.users 직접 참조로 동기화 문제 해결  
- Instagram 정보 선택사항으로 변경
- 모든 사용자 정보를 한 곳에서 관리
*/

-- 1단계: 새로운 profiles 테이블 생성 (임시)
CREATE TABLE IF NOT EXISTS public.profiles_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 기본 프로필 정보
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 19 AND age <= 100),
  region TEXT NOT NULL DEFAULT 'seoul',
  
  -- 평가 결과
  tier TEXT,
  grade TEXT,
  total_score INTEGER DEFAULT 0,
  category_scores JSONB DEFAULT '{}',
  evaluation_data JSONB DEFAULT '{}',
  last_evaluated_at TIMESTAMPTZ,
  
  -- Instagram 정보 (선택사항)
  instagram_id TEXT UNIQUE, -- NOT NULL 제거 ⭐
  instagram_public BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2단계: 기존 데이터 마이그레이션
-- profiles → profiles_new 데이터 복사
INSERT INTO public.profiles_new (
  user_id, gender, age, region, tier, grade, total_score,
  category_scores, evaluation_data, last_evaluated_at,
  instagram_id, instagram_public, created_at, updated_at
)
SELECT 
  p.user_id,
  p.gender,
  p.age,
  p.region,
  p.tier,
  p.grade,
  p.total_score,
  p.category_scores,
  p.evaluation_data,
  p.last_evaluated_at,
  -- Instagram 정보는 users 테이블에서 가져오되 NULL 허용
  CASE 
    WHEN u.instagram_id LIKE 'temp_%' THEN NULL -- 임시 ID는 NULL로
    ELSE u.instagram_id 
  END,
  u.instagram_public,
  p.created_at,
  p.updated_at
FROM public.profiles p
LEFT JOIN public.users u ON p.user_id = u.id;

-- 3단계: 기존 테이블 제거 및 새 테이블로 교체
-- DROP TABLE public.profiles;       -- 기존 profiles 제거
-- DROP TABLE public.users;          -- public.users 제거  
-- ALTER TABLE public.profiles_new RENAME TO profiles; -- 새 테이블로 교체

-- ==============================================
-- 옵션 2: 자동 동기화 메커니즘 (대안)
-- ==============================================

/*
만약 현재 구조를 유지해야 한다면:
1. Instagram ID 제약조건 완화
2. Database Trigger로 자동 동기화
*/

-- 2.1 제약조건 수정
ALTER TABLE public.users 
ALTER COLUMN instagram_id DROP NOT NULL;

-- 2.2 자동 동기화 Trigger 함수
CREATE OR REPLACE FUNCTION sync_auth_to_public_users()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.users에 새 사용자가 생성될 때 public.users에 자동 생성
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, instagram_id, instagram_public, created_at, updated_at)
    VALUES (NEW.id, NULL, false, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Trigger 생성 (Supabase에서는 제한적)
-- CREATE TRIGGER trigger_sync_auth_users
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION sync_auth_to_public_users();

-- ==============================================
-- 데이터 검증 쿼리
-- ==============================================

-- 마이그레이션 후 데이터 검증
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'public.profiles' as table_name, 
  COUNT(*) as count 
FROM public.profiles;

-- Instagram ID 상태 확인
SELECT 
  COUNT(*) as total_profiles,
  COUNT(instagram_id) as with_instagram,
  COUNT(*) - COUNT(instagram_id) as without_instagram
FROM public.profiles;

-- 고아 레코드 확인
SELECT p.user_id, 'orphaned profile' as issue
FROM public.profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE au.id IS NULL;