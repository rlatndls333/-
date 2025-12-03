import React from 'react';
import { Question } from '../types';
import { Button } from './Button';

interface QuizProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  onAnswer: (value: string) => void;
}

export const Quiz: React.FC<QuizProps> = ({ question, currentStep, totalSteps, onAnswer }) => {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center min-h-[60vh] justify-center fade-in">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-stone-200 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-amber-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-2 text-amber-600 font-bold tracking-widest text-sm uppercase">
        Question {currentStep + 1} / {totalSteps}
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-800 mb-12 leading-snug break-keep">
        {question.text}
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-lg">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(option.value)}
            className="group relative w-full p-6 text-left bg-white border-2 border-stone-200 rounded-xl hover:border-amber-600 hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-lg text-stone-700 font-medium group-hover:text-amber-900 break-keep">
              {option.text}
            </span>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
