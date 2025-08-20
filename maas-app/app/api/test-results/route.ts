import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// 테스트 결과 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient();
    
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    // 카테고리별 점수 추출
    const categoryScores = body.categoryScores || {};
    
    if (user) {
      // 로그인한 사용자의 테스트 결과 저장
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          gender: body.gender,
          age: body.age || 25,
          region: body.region || 'seoul',
          nickname: body.nickname,
          total_score: body.totalScore,
          tier: body.tier,
          grade: body.grade,
          appearance_score: categoryScores['외모/건강'],
          economic_score: categoryScores['경제력'],
          personality_score: categoryScores['성격/인성'],
          lifestyle_score: categoryScores['생활능력'],
          relationship_score: categoryScores['관계능력'],
          answers: body.answers,
          evaluation_data: body.evaluationData
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving test result:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data, type: 'registered' });
    } else {
      // 익명 사용자의 테스트 결과 저장
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('session_id')?.value || 
                       `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 세션 ID 쿠키 설정
      cookieStore.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30일
      });
      
      const { data, error } = await supabase
        .from('anonymous_test_results')
        .insert({
          session_id: sessionId,
          gender: body.gender,
          age: body.age || 25,
          region: body.region || 'seoul',
          nickname: body.nickname,
          total_score: body.totalScore,
          tier: body.tier,
          grade: body.grade,
          appearance_score: categoryScores['외모/건강'],
          economic_score: categoryScores['경제력'],
          personality_score: categoryScores['성격/인성'],
          lifestyle_score: categoryScores['생활능력'],
          relationship_score: categoryScores['관계능력'],
          answers: body.answers,
          evaluation_data: body.evaluationData,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving anonymous test result:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ data, type: 'anonymous', sessionId });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 테스트 결과 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // 관리자 세션 확인 (실제 환경에서는 더 안전한 방법 사용 권장)
    // Authorization 헤더로 간단한 확인
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== 'Bearer admin-maas-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // profiles 테이블에서 직접 데이터 조회 (users 테이블 JOIN 제거)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
    
    // 프로필 데이터를 관리자 페이지 형식으로 변환
    const formattedData = (profiles || []).map(profile => ({
      id: profile.id,
      user_type: 'registered' as const,
      user_identifier: profile.instagram_id || profile.user_id,
      gender: profile.gender,
      age: profile.age || 0,
      region: '',
      nickname: profile.instagram_id ? `@${profile.instagram_id}` : '',
      total_score: profile.total_score,
      tier: profile.tier,
      grade: '',
      instagram_public: profile.instagram_public !== false, // 기본값 true
      created_at: profile.created_at,
      category_scores: profile.category_scores,
      percentile: profile.percentile
    }));
    
    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}