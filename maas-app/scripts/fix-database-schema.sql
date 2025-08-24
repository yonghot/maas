-- 데이터베이스 스키마 수정 스크립트
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. users 테이블의 instagram_id 제약 조건 수정
ALTER TABLE public.users 
ALTER COLUMN instagram_id DROP NOT NULL;

-- 2. 기존 제약 조건 확인 및 수정 (필요시)
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_instagram_id_key;

-- 3. 새로운 제약 조건 추가 (NULL 허용하되 중복 불허)
ALTER TABLE public.users 
ADD CONSTRAINT users_instagram_id_unique 
UNIQUE NULLS NOT DISTINCT (instagram_id);

-- 4. auth.users의 사용자들을 public.users에 동기화
-- (이 부분은 수동으로 확인 후 실행)
-- SELECT id, email, created_at FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM public.users);

-- 5. 확인 쿼리
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name, 
    COUNT(*) as count 
FROM public.users
UNION ALL
SELECT 
    'profiles' as table_name, 
    COUNT(*) as count 
FROM profiles;