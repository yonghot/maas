-- profiles 테이블에 Instagram 관련 필드 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_id TEXT,
ADD COLUMN IF NOT EXISTS instagram_public BOOLEAN DEFAULT true;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_id ON public.profiles(instagram_id);

-- users 테이블은 더 이상 필요없으므로 관련 정책 수정
-- (users 테이블은 Supabase Auth가 관리하는 auth.users와 혼동될 수 있음)

-- 기존 users 테이블 데이터를 profiles로 마이그레이션 (있는 경우)
UPDATE public.profiles p
SET 
  instagram_id = u.instagram_id,
  instagram_public = u.instagram_public
FROM public.users u
WHERE p.user_id = u.id
AND p.instagram_id IS NULL;