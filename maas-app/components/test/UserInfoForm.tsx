'use client';

import { useState } from 'react';
import { Gender, UserInfo, AgeGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

export function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState({
    nickname: '',
    gender: '' as Gender | '',
    age: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 나이 그룹 계산
  const getAgeGroup = (age: number): AgeGroup => {
    if (age >= 20 && age <= 25) return '20-25';
    if (age >= 26 && age <= 30) return '26-30';
    if (age >= 31 && age <= 35) return '31-35';
    if (age >= 36 && age <= 40) return '36-40';
    return '40+';
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    if (!formData.age) {
      newErrors.age = '나이를 입력해주세요.';
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 20 || ageNum > 60) {
        newErrors.age = '20-60 사이의 나이를 입력해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const age = parseInt(formData.age);
    const userInfo: UserInfo = {
      nickname: formData.nickname.trim() || undefined,
      gender: formData.gender as Gender,
      age,
      ageGroup: getAgeGroup(age)
    };

    onSubmit(userInfo);
  };

  // 입력값 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 닉네임 입력 */}
      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임 (선택사항)</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="닉네임을 입력하세요"
          value={formData.nickname}
          onChange={(e) => handleInputChange('nickname', e.target.value)}
          maxLength={20}
        />
        <p className="text-xs text-gray-500">
          닉네임을 입력하지 않으면 익명으로 진행됩니다.
        </p>
      </div>

      {/* 성별 선택 */}
      <div className="space-y-3">
        <Label>성별</Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => handleInputChange('gender', value)}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="cursor-pointer">남성</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="cursor-pointer">여성</Label>
          </div>
        </RadioGroup>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender}</p>
        )}
      </div>

      {/* 나이 입력 */}
      <div className="space-y-2">
        <Label htmlFor="age">나이</Label>
        <Input
          id="age"
          type="number"
          placeholder="만 나이를 입력하세요"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          min="20"
          max="60"
        />
        {errors.age && (
          <p className="text-sm text-red-500">{errors.age}</p>
        )}
        <p className="text-xs text-gray-500">
          만 20세 ~ 60세까지 입력 가능합니다.
        </p>
      </div>

      {/* 제출 버튼 */}
      <Button 
        type="submit" 
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all"
        size="lg"
      >
        테스트 시작하기
      </Button>

      {/* 안내 메시지 */}
      <div className="text-xs text-gray-600 text-center space-y-1 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
        <p>• 테스트는 약 5-10분 소요됩니다</p>
        <p>• 정확한 결과를 위해 솔직하게 답변해주세요</p>
        <p>• 언제든지 테스트를 다시 시작할 수 있습니다</p>
      </div>
    </form>
  );
}