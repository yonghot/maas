-- RLS 성능 최적화 스크립트
-- auth.uid() 함수를 서브쿼리로 감싸서 한 번만 평가되도록 수정

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own data" ON public.users;

-- 2. 최적화된 정책 재생성
-- SELECT 정책
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (id = (SELECT auth.uid()));

-- INSERT 정책
CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

-- UPDATE 정책
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- DELETE 정책
CREATE POLICY "Users can delete their own data" ON public.users
  FOR DELETE
  USING (id = (SELECT auth.uid()));

-- 3. profiles 테이블도 동일하게 최적화 (있는 경우)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- 4. 성능 향상 확인을 위한 쿼리 플랜 분석 (선택사항)
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.users WHERE id = (SELECT auth.uid());
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.profiles WHERE user_id = (SELECT auth.uid());