
-- 근본적 해결: 단일 테이블 구조로 마이그레이션
-- 실행 전 반드시 백업 확인!

BEGIN TRANSACTION;

-- 1단계: 새 profiles 테이블 생성
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
  instagram_id TEXT UNIQUE, -- NOT NULL 제거됨
  instagram_public BOOLEAN DEFAULT false,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2단계: 데이터 마이그레이션

INSERT INTO public.profiles_new (
  id, user_id, gender, age, region, tier, grade, total_score,
  category_scores, evaluation_data, last_evaluated_at,
  instagram_id, instagram_public, created_at, updated_at
) VALUES (
  '9de80e0c-11ff-45be-baec-6cd9dc478a4e',
  'eb3404af-0fba-4059-881d-6385f6c43c20',
  'male',
  30,
  'seoul',
  'A',
  'A',
  75,
  '{"sense":7,"wealth":8,"physical":7.5}'::jsonb,
  '{"answers":[],"percentile":85}'::jsonb,
  '2025-08-20T18:42:13.271+00:00',
  'test_user',
  true,
  '2025-08-20T18:42:13.271+00:00',
  '2025-08-20T18:42:13.271+00:00'
);
INSERT INTO public.profiles_new (
  id, user_id, gender, age, region, tier, grade, total_score,
  category_scores, evaluation_data, last_evaluated_at,
  instagram_id, instagram_public, created_at, updated_at
) VALUES (
  '5050b25c-c3b4-4d19-b5cc-6a4d66ea9c40',
  '48f20fff-e25f-40e2-91ff-05fe361370c5',
  'male',
  25,
  'seoul',
  'F',
  'F',
  0,
  '{}'::jsonb,
  '{}'::jsonb,
  NULL,
  NULL,
  false,
  '2025-08-24T16:59:09.905534+00:00',
  '2025-08-24T17:19:52.042+00:00'
);
INSERT INTO public.profiles_new (
  id, user_id, gender, age, region, tier, grade, total_score,
  category_scores, evaluation_data, last_evaluated_at,
  instagram_id, instagram_public, created_at, updated_at
) VALUES (
  '62ae5979-24d1-4659-9b8d-9de053e784b5',
  'f1f56370-0137-4fc5-b0bd-09bfeceeb625',
  'male',
  25,
  'seoul',
  'F',
  'F',
  0,
  '{}'::jsonb,
  '{}'::jsonb,
  NULL,
  NULL,
  false,
  '2025-08-21T10:42:24.430548+00:00',
  '2025-08-24T17:19:52.14+00:00'
);

-- 3단계: 테이블 교체 (주의: 다운타임 발생)
-- DROP TABLE public.profiles;
-- DROP TABLE public.users;
-- ALTER TABLE public.profiles_new RENAME TO profiles;

-- 4단계: 인덱스 재생성
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_age ON public.profiles(age);
CREATE INDEX idx_profiles_region ON public.profiles(region);

-- 5단계: RLS 정책 재생성
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

COMMIT;

-- 검증 쿼리
SELECT 'auth.users' as table_name, COUNT(*) FROM auth.users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
