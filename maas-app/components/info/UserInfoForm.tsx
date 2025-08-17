'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/test-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserLead } from '@/lib/types';
import { AlertCircle, Loader2 } from 'lucide-react';

// 에러 메시지를 위한 타입
type FormErrors = {
  [K in keyof UserLead]?: string;
};

export default function UserInfoForm() {
  const router = useRouter();
  const { setUserLead, userInfo } = useTestStore();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<Partial<UserLead>>({
    name: '',
    phone: '',
    email: '',
    age: userInfo?.age || 0,
    gender: userInfo?.gender || 'male',
    region: '',
    privacyConsent: false,
    marketingConsent: false,
  });

  // 휴대폰 번호 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 입력 핸들러
  const handleInputChange = (field: keyof UserLead, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    const phoneNumbers = formData.phone?.replace(/[^\d]/g, '');
    if (!phoneNumbers || phoneNumbers.length < 10) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 주소를 입력해주세요';
    }
    
    if (!formData.age || formData.age < 15 || formData.age > 100) {
      newErrors.age = '올바른 나이를 입력해주세요';
    }
    
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = '개인정보 수집 동의는 필수입니다';
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
      // 리드 정보 저장
      const leadData: UserLead = {
        name: formData.name!,
        phone: formData.phone!,
        email: formData.email,
        age: formData.age!,
        gender: formData.gender!,
        region: formData.region,
        privacyConsent: formData.privacyConsent!,
        marketingConsent: formData.marketingConsent,
        submittedAt: new Date(),
      };
      
      setUserLead(leadData);
      
      // 결과 페이지로 이동
      router.push('/result/test');
    } catch (error) {
      console.error('정보 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">
          이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="홍길동"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      {/* 휴대폰 번호 */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          휴대폰 번호 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="010-1234-5678"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
          maxLength={13}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>

      {/* 이메일 (선택) */}
      <div className="space-y-2">
        <Label htmlFor="email">
          이메일 <span className="text-gray-400">(선택)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      {/* 나이 */}
      <div className="space-y-2">
        <Label htmlFor="age">
          나이 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="age"
          type="number"
          placeholder="25"
          value={formData.age || ''}
          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
          min={15}
          max={100}
          className={errors.age ? 'border-red-500' : ''}
        />
        {errors.age && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.age}
          </p>
        )}
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <Label>
          성별 <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => handleInputChange('gender', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">남성</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">여성</Label>
          </div>
        </RadioGroup>
      </div>

      {/* 지역 (선택) */}
      <div className="space-y-2">
        <Label htmlFor="region">
          거주 지역 <span className="text-gray-400">(선택)</span>
        </Label>
        <select
          id="region"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.region}
          onChange={(e) => handleInputChange('region', e.target.value)}
        >
          <option value="">선택하세요</option>
          <option value="서울">서울</option>
          <option value="경기">경기</option>
          <option value="인천">인천</option>
          <option value="대전">대전</option>
          <option value="대구">대구</option>
          <option value="부산">부산</option>
          <option value="광주">광주</option>
          <option value="울산">울산</option>
          <option value="세종">세종</option>
          <option value="강원">강원</option>
          <option value="충북">충북</option>
          <option value="충남">충남</option>
          <option value="전북">전북</option>
          <option value="전남">전남</option>
          <option value="경북">경북</option>
          <option value="경남">경남</option>
          <option value="제주">제주</option>
        </select>
      </div>

      {/* 개인정보 동의 */}
      <div className="space-y-3 pt-4 border-t">
        {/* 필수 동의 */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={formData.privacyConsent}
            onCheckedChange={(checked) => handleInputChange('privacyConsent', checked)}
            className={errors.privacyConsent ? 'border-red-500' : ''}
          />
          <div className="space-y-1">
            <Label htmlFor="privacy" className="text-sm font-normal cursor-pointer">
              <span className="text-red-500">[필수]</span> 개인정보 수집 및 이용에 동의합니다
            </Label>
            <p className="text-xs text-gray-500">
              결과 분석 및 통계 목적으로 개인정보를 수집합니다.
            </p>
          </div>
        </div>
        
        {/* 선택 동의 */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="marketing"
            checked={formData.marketingConsent}
            onCheckedChange={(checked) => handleInputChange('marketingConsent', checked)}
          />
          <div className="space-y-1">
            <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
              <span className="text-gray-400">[선택]</span> 마케팅 정보 수신에 동의합니다
            </Label>
            <p className="text-xs text-gray-500">
              유용한 정보와 이벤트 소식을 받아보실 수 있습니다.
            </p>
          </div>
        </div>
        
        {errors.privacyConsent && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.privacyConsent}
          </p>
        )}
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            처리 중...
          </>
        ) : (
          '결과 확인하기'
        )}
      </Button>
    </form>
  );
}