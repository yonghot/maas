'use client';

import { useState } from 'react';
import { UserInfo, Gender } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, User2 } from 'lucide-react';

interface UserInfoFormProps {
  onSubmit: (info: UserInfo) => void;
}

export function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [gender, setGender] = useState<Gender | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) return;

    // 성별만 전송, 나머지는 기본값
    onSubmit({
      gender,
      age: 25, // 기본값
      region: 'seoul' // 기본값
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-teal-800">
            성별을 선택해주세요
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            성별에 따라 다른 질문이 주어집니다.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`p-6 cursor-pointer transition-all border-2 touch-manipulation ${
              gender === 'male'
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => setGender('male')}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-4 rounded-full ${
                gender === 'male' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <svg 
                  className={`w-10 h-10 ${
                    gender === 'male' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Mars symbol - 남성 기호 */}
                  <path d="M9.5 11c1.93 0 3.5 1.57 3.5 3.5S11.43 18 9.5 18 6 16.43 6 14.5 7.57 11 9.5 11m0-2C6.46 9 4 11.46 4 14.5S6.46 20 9.5 20s5.5-2.46 5.5-5.5c0-1.16-.36-2.23-.97-3.12L18 7.42V10h2V4h-6v2h2.58l-3.97 3.97C11.73 9.36 10.66 9 9.5 9z"/>
                </svg>
              </div>
              <span className={`font-medium text-base ${
                gender === 'male' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                남성
              </span>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all border-2 touch-manipulation ${
              gender === 'female'
                ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
            }`}
            onClick={() => setGender('female')}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-4 rounded-full ${
                gender === 'female' ? 'bg-pink-100' : 'bg-gray-100'
              }`}>
                <svg 
                  className={`w-10 h-10 ${
                    gender === 'female' ? 'text-pink-600' : 'text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Venus symbol - 여성 기호 */}
                  <path d="M12 4a4 4 0 0 1 4 4c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4m0-2C8.69 2 6 4.69 6 8c0 2.97 2.16 5.44 5 5.92V16h-2v2h2v2h2v-2h2v-2h-2v-2.08c2.84-.48 5-2.95 5-5.92 0-3.31-2.69-6-6-6z"/>
                </svg>
              </div>
              <span className={`font-medium text-base ${
                gender === 'female' ? 'text-pink-700' : 'text-gray-700'
              }`}>
                여성
              </span>
            </div>
          </Card>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!gender}
        className="w-full h-14 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-lg font-medium shadow-lg disabled:opacity-50 transition-all touch-manipulation"
      >
        테스트 시작하기
      </Button>

    </form>
  );
}