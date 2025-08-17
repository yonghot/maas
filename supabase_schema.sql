-- MAAS 데이터베이스 스키마
-- Supabase Dashboard > SQL Editor에서 실행
-- 실행 전 확인사항:
-- 1. 새 프로젝트인지 확인 (기존 데이터 손실 방지)
-- 2. 전체 선택 후 실행 (Ctrl+A → Run)

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  instagram_id TEXT UNIQUE NOT NULL,
  instagram_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 19 AND age <= 100),
  region TEXT NOT NULL,
  tier TEXT,
  grade TEXT,
  total_score INTEGER DEFAULT 0,
  category_scores JSONB DEFAULT '{}',
  evaluation_data JSONB DEFAULT '{}',
  last_evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 테이블
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT CHECK (plan_id IN ('free', 'basic', 'premium')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 테이블
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  payment_key TEXT NOT NULL,
  amount INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 조회수 테이블
CREATE TABLE IF NOT EXISTS public.daily_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  view_date DATE DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, view_date)
);

-- 프로필 조회 기록 테이블
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  viewed_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(viewer_id, viewed_id)
);

-- RLS (Row Level Security) 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Users 정책
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles 정책
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions 정책
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Payments 정책
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Views 정책
CREATE POLICY "Users can view their own daily views" ON public.daily_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily views" ON public.daily_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily views" ON public.daily_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Profile Views 정책
CREATE POLICY "Users can view their own profile views" ON public.profile_views
  FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_id);

CREATE POLICY "Users can insert their own profile views" ON public.profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- 인덱스
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_age ON public.profiles(age);
CREATE INDEX idx_profiles_region ON public.profiles(region);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_daily_views_user_date ON public.daily_views(user_id, view_date);
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed ON public.profile_views(viewed_id);

-- Trigger 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_views_updated_at BEFORE UPDATE ON public.daily_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();