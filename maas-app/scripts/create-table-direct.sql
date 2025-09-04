-- scoring_weights 테이블 생성 및 초기 데이터 삽입
CREATE TABLE IF NOT EXISTS public.scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  weights JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 데이터 삽입
INSERT INTO public.scoring_weights (name, weights, description, is_active)
VALUES (
  'default',
  '{"male":{"wealth":0.6,"sense":0.3,"physical":0.1},"female":{"young":{"age":0.2,"appearance":0.4,"values":0.4},"old":{"age":0.4,"appearance":0.2,"values":0.4}}}'::jsonb,
  '시스템 기본 가중치 설정',
  true
) ON CONFLICT (name) DO UPDATE SET
  weights = EXCLUDED.weights,
  is_active = EXCLUDED.is_active;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_scoring_weights_active ON scoring_weights(is_active);
CREATE INDEX IF NOT EXISTS idx_scoring_weights_name ON scoring_weights(name);