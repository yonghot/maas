-- 평가 가중치 설정 테이블
CREATE TABLE IF NOT EXISTS scoring_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gender VARCHAR(10) NOT NULL, -- 'male' or 'female'
  evaluator_age_group VARCHAR(10), -- 'young' or 'old' (for female only)
  weights JSONB NOT NULL, -- 가중치 데이터
  is_active BOOLEAN DEFAULT true, -- 현재 활성화된 설정인지
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'admin'
);

-- 인덱스 생성
CREATE INDEX idx_scoring_weights_gender ON scoring_weights(gender);
CREATE INDEX idx_scoring_weights_active ON scoring_weights(is_active);
CREATE INDEX idx_scoring_weights_created_at ON scoring_weights(created_at DESC);

-- RLS 정책 설정
ALTER TABLE scoring_weights ENABLE ROW LEVEL SECURITY;

-- 관리자만 CRUD 가능
CREATE POLICY "Admin can manage scoring weights" ON scoring_weights
  FOR ALL USING (true);

-- 기본 가중치 삽입
INSERT INTO scoring_weights (gender, evaluator_age_group, weights, is_active) VALUES
  ('male', NULL, '{"wealth": 0.6, "sense": 0.3, "physical": 0.1}', true),
  ('female', 'young', '{"age": 0.2, "appearance": 0.4, "values": 0.4}', true),
  ('female', 'old', '{"age": 0.4, "appearance": 0.2, "values": 0.4}', true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scoring_weights_updated_at 
  BEFORE UPDATE ON scoring_weights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();