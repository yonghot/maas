import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo, UserAnswer, TestResult, Gender, UserLead } from '@/lib/types';

interface TestState {
  // 사용자 정보
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  
  // 리드 정보 (연락처 정보)
  userLead: UserLead | null;
  setUserLead: (lead: UserLead) => void;
  hasSubmittedLead: boolean;  // 리드 정보 제출 여부
  
  // 답변 관리
  answers: UserAnswer[];
  setAnswer: (answer: UserAnswer) => void;
  clearAnswers: () => void;
  
  // 진행 상태
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  isTestCompleted: boolean;  // 테스트 완료 여부
  setTestCompleted: (completed: boolean) => void;
  
  // 결과
  result: TestResult | null;
  setResult: (result: TestResult) => void;
  
  // 초기화
  resetTest: () => void;
}

export const useTestStore = create<TestState>()(
  persist(
    (set) => ({
      // 초기 상태
      userInfo: null,
      userLead: null,
      hasSubmittedLead: false,
      answers: [],
      currentQuestionIndex: 0,
      isTestCompleted: false,
      result: null,
      
      // 사용자 정보 설정
      setUserInfo: (info) => set({ userInfo: info }),
      
      // 리드 정보 설정
      setUserLead: (lead) => set({ 
        userLead: lead, 
        hasSubmittedLead: true 
      }),
      
      // 답변 관리
      setAnswer: (answer) => set((state) => {
        const existingIndex = state.answers.findIndex(
          a => a.questionId === answer.questionId
        );
        
        if (existingIndex >= 0) {
          const newAnswers = [...state.answers];
          newAnswers[existingIndex] = answer;
          return { answers: newAnswers };
        } else {
          return { answers: [...state.answers, answer] };
        }
      }),
      
      clearAnswers: () => set({ answers: [] }),
      
      // 진행 상태 관리
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      nextQuestion: () => set((state) => ({ 
        currentQuestionIndex: state.currentQuestionIndex + 1 
      })),
      previousQuestion: () => set((state) => ({ 
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1) 
      })),
      setTestCompleted: (completed) => set({ isTestCompleted: completed }),
      
      // 결과 설정
      setResult: (result) => set({ result }),
      
      // 테스트 초기화
      resetTest: () => set({
        userInfo: null,
        userLead: null,
        hasSubmittedLead: false,
        answers: [],
        currentQuestionIndex: 0,
        isTestCompleted: false,
        result: null
      })
    }),
    {
      name: 'maas-test-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        userLead: state.userLead,
        hasSubmittedLead: state.hasSubmittedLead,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        isTestCompleted: state.isTestCompleted
      })
    }
  )
);