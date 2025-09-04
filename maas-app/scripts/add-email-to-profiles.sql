-- profiles 테이블에 이메일 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 기존 데이터에 이메일 정보 업데이트 (auth.users에서 가져오기)
-- 이는 수동으로 실행해야 하는 SQL입니다
-- UPDATE public.profiles SET email = (
--   SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id
-- ) WHERE email IS NULL;