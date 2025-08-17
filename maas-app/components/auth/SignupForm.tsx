'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserAuth } from '@/lib/types';
import { AlertCircle, Loader2, Instagram, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type FormErrors = {
  instagramId?: string;
  password?: string;
  passwordConfirm?: string;
};

export default function SignupForm() {
  const router = useRouter();
  const { userInfo, result } = useTestStore();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    instagramId: '',
    password: '',
    passwordConfirm: '',
    instagramPublic: false,
  });

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    return { checks, strength };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  // 입력 핸들러
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 인스타그램 아이디 검증
    if (!formData.instagramId) {
      newErrors.instagramId = '인스타그램 아이디를 입력해주세요';
    } else if (formData.instagramId.length < 3) {
      newErrors.instagramId = '인스타그램 아이디는 3자 이상이어야 합니다';
    } else if (!/^[a-z0-9._]+$/.test(formData.instagramId)) {
      newErrors.instagramId = '영문 소문자, 숫자, 마침표, 언더스코어만 사용 가능합니다';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    } else if (passwordStrength.strength < 3) {
      newErrors.password = '더 강력한 비밀번호를 사용해주세요';
    }
    
    // 비밀번호 확인 검증
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Supabase 연동 후 실제 회원가입 처리
      // 현재는 임시로 로컬 스토리지에 저장
      const userData: UserAuth = {
        instagramId: formData.instagramId,
        password: formData.password,
        instagramPublic: formData.instagramPublic,
      };
      
      // 임시 저장 (추후 Supabase로 대체)
      localStorage.setItem('userAuth', JSON.stringify(userData));
      
      // 결과 페이지로 이동
      router.push('/result/test');
    } catch (error) {
      console.error('회원가입 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 인스타그램 아이디 */}
        <div className="space-y-2">
          <Label htmlFor="instagramId" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            인스타그램 아이디
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
            <Input
              id="instagramId"
              type="text"
              placeholder="your_instagram_id"
              value={formData.instagramId}
              onChange={(e) => handleInputChange('instagramId', e.target.value.toLowerCase())}
              className={`pl-8 ${errors.instagramId ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.instagramId && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.instagramId}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            비밀번호
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8자 이상의 비밀번호"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* 비밀번호 강도 표시 */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength.strength >= level
                        ? level <= 2 ? 'bg-red-500' 
                        : level <= 3 ? 'bg-yellow-500'
                        : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs space-y-1">
                <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className="w-3 h-3" />
                  8자 이상
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase && passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className="w-3 h-3" />
                  대소문자 포함
                </div>
                <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className="w-3 h-3" />
                  숫자 포함
                </div>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
          <div className="relative">
            <Input
              id="passwordConfirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해주세요"
              value={formData.passwordConfirm}
              onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
              className={errors.passwordConfirm ? 'border-red-500' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.passwordConfirm}
            </p>
          )}
        </div>

        {/* 인스타그램 공개 설정 */}
        <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="instagramPublic"
              checked={formData.instagramPublic}
              onCheckedChange={(checked) => handleInputChange('instagramPublic', checked)}
              className="mt-1"
            />
            <div className="space-y-1.5">
              <Label htmlFor="instagramPublic" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Instagram className="w-4 h-4 text-purple-600" />
                프로필 카드에 인스타그램 아이디 공개
              </Label>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-start gap-1">
                  <span className="text-green-600 font-bold">공개 시:</span>
                  <span>다른 사용자가 내 카드를 보고 바로 인스타그램 DM으로 연락 가능</span>
                </p>
                <p className="flex items-start gap-1">
                  <span className="text-orange-600 font-bold">비공개 시:</span>
                  <span>상호 좋아요(매칭 성공) 후에만 서로의 인스타그램 공개</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 평가 결과 요약 */}
        {result && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              <strong>{result.gradeInfo.title}</strong> 등급으로 평가되었습니다.
              회원가입 후 비슷한 등급의 이성을 만나보세요!
            </p>
          </div>
        )}

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              가입 중...
            </>
          ) : (
            '가입하고 매칭 시작하기'
          )}
        </Button>

        {/* 이용약관 안내 */}
        <p className="text-xs text-center text-gray-500">
          가입 시 <span className="text-purple-600 underline cursor-pointer">이용약관</span> 및{' '}
          <span className="text-purple-600 underline cursor-pointer">개인정보처리방침</span>에 동의하게 됩니다.
        </p>
      </form>
    </motion.div>
  );
}