-- all_test_results 뷰 생성 (관리자 페이지용)
-- 회원가입한 사용자와 익명 사용자의 테스트 결과를 통합하여 보여주는 뷰

CREATE OR REPLACE VIEW all_test_results AS
SELECT 
  id,
  'registered' as user_type,
  user_id as user_identifier,
  gender,
  age,
  region,
  nickname,
  total_score,
  tier,
  grade,
  -- 통합 카테고리 점수 (남녀 공통 필드명 사용)
  appearance_score,
  economic_score,
  personality_score,
  lifestyle_score,
  relationship_score,
  created_at
FROM test_results

UNION ALL

SELECT 
  id,
  'anonymous' as user_type,
  session_id as user_identifier,
  gender,
  age,
  region,
  nickname,
  total_score,
  tier,
  grade,
  -- 통합 카테고리 점수 (남녀 공통 필드명 사용)
  appearance_score,
  economic_score,
  personality_score,
  lifestyle_score,
  relationship_score,
  created_at
FROM anonymous_test_results;

-- 권한 부여
GRANT SELECT ON all_test_results TO anon;
GRANT SELECT ON all_test_results TO authenticated;