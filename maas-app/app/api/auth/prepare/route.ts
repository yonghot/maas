import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { result, userInfo, answers, instagram_id, instagram_public } = body;
    
    if (!result || !userInfo) {
      return NextResponse.json(
        { error: '테스트 데이터가 없습니다.' },
        { status: 400 }
      );
    }
    
    // 테스트 데이터를 JSON으로 변환
    const testData = {
      result,
      userInfo,
      answers,
      instagram_id,
      instagram_public,
      timestamp: Date.now()
    };
    
    // 응답 생성
    const response = NextResponse.json({ success: true });
    
    // 서버 사이드 쿠키 설정
    response.cookies.set({
      name: 'test_result',
      value: JSON.stringify(testData),
      httpOnly: false, // 클라이언트에서도 읽을 수 있도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1시간
      path: '/'
    });
    
    console.log('서버 쿠키 설정 완료:', testData);
    
    return response;
  } catch (error) {
    console.error('쿠키 설정 오류:', error);
    return NextResponse.json(
      { error: '쿠키 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}