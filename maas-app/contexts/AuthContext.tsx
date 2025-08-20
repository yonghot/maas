'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // 사용자 세션 확인 및 자동 로그인
  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // 세션이 있으면 자동으로 사용자 정보 새로고침
      if (session?.user) {
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    const { data: { user: refreshedUser } } = await supabase.auth.getUser();
    setUser(refreshedUser);
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    // 초기 로드 시 세션 확인
    checkUser();

    // Auth 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          
          // 로그인 성공 시 자동으로 프로필 페이지로 이동
          if (event === 'SIGNED_IN') {
            // 테스트 결과가 있으면 결과 페이지로, 없으면 프로필로
            const testResult = localStorage.getItem('latestTestResult');
            if (testResult) {
              const result = JSON.parse(testResult);
              router.push(`/result/${result.id}`);
            } else {
              router.push('/profile');
            }
          }
        } else {
          setUser(null);
        }
        
        // 토큰 새로고침 시 사용자 정보 업데이트
        if (event === 'TOKEN_REFRESHED') {
          await refreshUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};