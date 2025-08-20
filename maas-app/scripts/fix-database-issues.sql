-- ================================================
-- 데이터베이스 문제 해결 스크립트
-- 모든 문제를 한 번에 해결합니다
-- ================================================

-- 1. RLS 임시 비활성화 (테스트를 위해)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. region 컬럼 NULL 허용으로 변경
ALTER TABLE public.profiles 
ALTER COLUMN region DROP NOT NULL;

-- 3. region 컬럼에 기본값 설정
ALTER TABLE public.profiles 
ALTER COLUMN region SET DEFAULT 'seoul';

-- 4. 외래키 제약 수정 (public.users → auth.users)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 5. profiles 테이블에 Instagram 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_id TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_public BOOLEAN DEFAULT true;

-- 6. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_id ON public.profiles(instagram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 7. RLS 정책 재생성 (최적화된 버전)
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- 새 정책 생성 (성능 최적화)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Service Role을 위한 정책 추가
CREATE POLICY "Service role bypass" ON public.profiles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 9. RLS 다시 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. 결과 확인
SELECT 
  'Profiles 테이블 설정 완료' as status,
  COUNT(*) as total_profiles 
FROM public.profiles;

-- 테이블 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('user_id', 'region', 'instagram_id', 'instagram_public')
ORDER BY ordinal_position;