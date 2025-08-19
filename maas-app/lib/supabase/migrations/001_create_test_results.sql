-- 테스트 결과 테이블 생성
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 사용자 정보
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age INTEGER DEFAULT 25,
  region TEXT DEFAULT 'seoul',
  nickname TEXT,
  
  -- 점수 정보
  total_score NUMERIC(5,2) NOT NULL,
  tier TEXT NOT NULL,
  grade TEXT NOT NULL,
  
  -- 카테고리별 점수
  appearance_score NUMERIC(5,2),
  economic_score NUMERIC(5,2),
  personality_score NUMERIC(5,2),
  lifestyle_score NUMERIC(5,2),
  relationship_score NUMERIC(5,2),
  
  -- 상세 답변 데이터
  answers JSONB,
  evaluation_data JSONB,
  
  -- 메타 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- 인덱스 생성
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_gender ON test_results(gender);
CREATE INDEX idx_test_results_tier ON test_results(tier);
CREATE INDEX idx_test_results_created_at ON test_results(created_at DESC);

-- RLS 정책 설정
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 결과만 볼 수 있음
CREATE POLICY "Users can view own test results" ON test_results
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 결과를 생성할 수 있음
CREATE POLICY "Users can insert own test results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 결과를 수정할 수 있음
CREATE POLICY "Users can update own test results" ON test_results
  FOR UPDATE USING (auth.uid() = user_id);

-- 익명 사용자를 위한 테스트 결과 테이블 (로그인하지 않은 사용자)
CREATE TABLE IF NOT EXISTS anonymous_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  
  -- 사용자 정보
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age INTEGER DEFAULT 25,
  region TEXT DEFAULT 'seoul',
  nickname TEXT,
  
  -- 점수 정보
  total_score NUMERIC(5,2) NOT NULL,
  tier TEXT NOT NULL,
  grade TEXT NOT NULL,
  
  -- 카테고리별 점수
  appearance_score NUMERIC(5,2),
  economic_score NUMERIC(5,2),
  personality_score NUMERIC(5,2),
  lifestyle_score NUMERIC(5,2),
  relationship_score NUMERIC(5,2),
  
  -- 상세 답변 데이터
  answers JSONB,
  evaluation_data JSONB,
  
  -- 메타 정보
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- 인덱스 생성
CREATE INDEX idx_anonymous_test_results_session_id ON anonymous_test_results(session_id);
CREATE INDEX idx_anonymous_test_results_gender ON anonymous_test_results(gender);
CREATE INDEX idx_anonymous_test_results_created_at ON anonymous_test_results(created_at DESC);

-- 관리자 뷰 생성 (모든 테스트 결과를 통합하여 보기)
CREATE OR REPLACE VIEW all_test_results AS
SELECT 
  'registered' as user_type,
  id,
  user_id::text as user_identifier,
  gender,
  age,
  region,
  nickname,
  total_score,
  tier,
  grade,
  appearance_score,
  economic_score,
  personality_score,
  lifestyle_score,
  relationship_score,
  created_at
FROM test_results
UNION ALL
SELECT 
  'anonymous' as user_type,
  id,
  session_id as user_identifier,
  gender,
  age,
  region,
  nickname,
  total_score,
  tier,
  grade,
  appearance_score,
  economic_score,
  personality_score,
  lifestyle_score,
  relationship_score,
  created_at
FROM anonymous_test_results
ORDER BY created_at DESC;