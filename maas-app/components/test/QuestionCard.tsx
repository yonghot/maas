'use client';

import { useState, useEffect } from 'react';
import { Question, QuestionOption, UserAnswer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface QuestionCardProps {
  question: Question;
  answer?: UserAnswer;
  onAnswerChange: (questionId: string, value: string | number) => void;
}

export function QuestionCard({ question, answer, onAnswerChange }: QuestionCardProps) {
  const [localValue, setLocalValue] = useState<string | number>('');

  // 답변 값 초기화
  useEffect(() => {
    if (answer) {
      setLocalValue(answer.value);
    } else {
      // 질문 타입별 기본값 설정
      switch (question.type) {
        case 'slider':
          setLocalValue(question.min || 0);
          break;
        case 'number':
          setLocalValue('');
          break;
        case 'select':
          setLocalValue('');
          break;
        default:
          setLocalValue('');
      }
    }
  }, [question.id, answer]);

  // 값 변경 처리
  const handleValueChange = (newValue: string | number) => {
    setLocalValue(newValue);
    onAnswerChange(question.id, newValue);
  };

  // Select 타입 질문 렌더링 - 모바일 최적화
  const renderSelectQuestion = () => {
    if (!question.options) return null;

    return (
      <RadioGroup
        value={localValue.toString()}
        onValueChange={(value) => {
          const option = question.options?.find(opt => opt.value.toString() === value);
          if (option) {
            handleValueChange(option.value);
          }
        }}
        className="space-y-3"
      >
        {question.options.map((option: QuestionOption) => (
          <div key={option.value.toString()} 
               className="flex items-center space-x-3 p-3 rounded-xl bg-teal-50/50 hover:bg-teal-100/50 transition-colors touch-manipulation">
            <RadioGroupItem
              value={option.value.toString()}
              id={`${question.id}-${option.value}`}
              className="text-teal-600 border-teal-300 data-[state=checked]:bg-teal-600"
            />
            <Label
              htmlFor={`${question.id}-${option.value}`}
              className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed text-center text-teal-700"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  // Slider 타입 질문 렌더링 - 모바일 최적화
  const renderSliderQuestion = () => {
    const min = question.min || 0;
    const max = question.max || 100;
    const step = question.step || 1;
    const currentValue = typeof localValue === 'number' ? localValue : min;

    return (
      <div className="space-y-6">
        {/* 현재 값 표시 - 모바일에서 크게 */}
        <div className="text-center bg-teal-50 rounded-2xl p-4">
          <span className="text-3xl font-bold text-teal-600">
            {currentValue}
          </span>
          {question.labels && question.labels[currentValue] && (
            <p className="text-sm text-teal-600/80 mt-2">
              {question.labels[currentValue]}
            </p>
          )}
        </div>

        {/* 슬라이더 - 터치 영역 확대 */}
        <div className="px-4 py-2">
          <Slider
            value={[currentValue]}
            onValueChange={(values) => handleValueChange(values[0])}
            min={min}
            max={max}
            step={step}
            className="w-full touch-manipulation"
          />
        </div>

        {/* 라벨 범위 표시 */}
        {question.labels && (
          <div className="flex justify-between text-xs sm:text-sm text-teal-600/70 px-2">
            <span>{question.labels[min] || min}</span>
            <span className="text-center flex-1">{question.labels[Math.floor((min + max) / 2)]}</span>
            <span>{question.labels[max] || max}</span>
          </div>
        )}
      </div>
    );
  };

  // Number 타입 질문 렌더링 - 모바일 최적화
  const renderNumberQuestion = () => {
    return (
      <div className="space-y-4">
        <Input
          type="number"
          value={localValue}
          onChange={(e) => {
            const value = e.target.value;
            setLocalValue(value);
            if (value && !isNaN(Number(value))) {
              handleValueChange(Number(value));
            }
          }}
          min={question.min}
          max={question.max}
          placeholder={`${question.min || 0} ~ ${question.max || 100}`}
          className="text-center text-xl font-semibold h-14 bg-teal-50/50 border-teal-200 focus:border-teal-400 text-teal-700 placeholder:text-teal-400"
        />
        
        {question.min !== undefined && question.max !== undefined && (
          <p className="text-sm text-teal-600/70 text-center">
            입력 범위: {question.min} ~ {question.max}
          </p>
        )}
      </div>
    );
  };

  // BMI Calculator 타입 질문 렌더링
  const renderBMICalculator = () => {
    return (
      <div className="space-y-4">
        <p className="text-center text-teal-600 p-6 bg-teal-50 rounded-xl">
          BMI 계산기 기능은 곧 추가될 예정입니다.
        </p>
      </div>
    );
  };

  // 질문 타입별 컴포넌트 선택
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'select':
        return renderSelectQuestion();
      case 'slider':
        return renderSliderQuestion();
      case 'number':
        return renderNumberQuestion();
      case 'bmi-calculator':
        return renderBMICalculator();
      default:
        return (
          <p className="text-center text-teal-500 p-6">
            지원하지 않는 질문 타입입니다.
          </p>
        );
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-0 backdrop-blur-lg bg-white/95">
      <CardHeader className="pb-4 text-center">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-medium text-teal-700 bg-gradient-to-r from-teal-100 to-teal-50 px-4 py-1.5 rounded-full">
              {question.category}
            </span>
            {question.required && (
              <span className="text-xs font-medium text-teal-600 bg-teal-100 px-3 py-1.5 rounded-full">
                필수
              </span>
            )}
          </div>
          
          <CardTitle className="text-lg sm:text-xl leading-relaxed text-teal-800 px-2">
            {question.text}
          </CardTitle>
          
          {question.subText && (
            <CardDescription className="text-sm text-teal-600/70 px-2">
              {question.subText}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6">
        {renderQuestionContent()}
      </CardContent>
    </Card>
  );
}