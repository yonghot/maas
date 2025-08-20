import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    
    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(new URL('/signup-result?error=auth_failed', requestUrl.origin));
      }
      
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('로그인 성공, user.id:', user.id);
        
        // 기존 프로필이 있는지 확인
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, instagram_id')
          .eq('user_id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('프로필 조회 오류:', profileError);
        }
        
        if (existingProfile) {
          // 기존 프로필이 있으면 바로 결과 페이지로
          console.log('기존 프로필 발견:', existingProfile);
          return NextResponse.redirect(new URL('/result', requestUrl.origin));
        } else {
          // 프로필이 없으면 저장 페이지로 (localStorage에서 데이터 가져와서 저장)
          console.log('프로필 없음, 저장 페이지로 이동');
          return NextResponse.redirect(new URL('/result/save', requestUrl.origin));
        }
      }
    } catch (error) {
      console.error('Session exchange error:', error);
      return NextResponse.redirect(new URL('/signup-result?error=session_failed', requestUrl.origin));
    }
  }

  // No code present, redirect to signup
  return NextResponse.redirect(new URL('/signup-result', requestUrl.origin));
}