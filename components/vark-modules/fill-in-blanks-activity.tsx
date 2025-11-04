'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Target,
  BookOpen,
  PenTool,
  CheckCircle
} from 'lucide-react';
import { VARKActivityData } from '@/types/vark-module';

interface FillInBlanksActivityProps {
  activity: VARKActivityData;
  onComplete: () => void;
}

export default function FillInBlanksActivity({
  activity,
  onComplete
}: FillInBlanksActivityProps) {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const handleBlankChange = (questionIndex: number, blankIndex: number, value: string) => {
    const key = `q${questionIndex}`;
    const currentAnswers = userAnswers[key] || [];
    const newAnswers = [...currentAnswers];
    newAnswers[blankIndex] = value;
    setUserAnswers({ ...userAnswers, [key]: newAnswers });
    setIsChecked(false);
  };

  const checkAnswers = () => {
    let correct = 0;
    let total = 0;

    activity.questions?.forEach((question, qIndex) => {
      const blankCount = (question.match(/_____/g) || []).length;
      const correctAnswers = activity.correct_answers?.[qIndex] || [];
      const userAns = userAnswers[`q${qIndex}`] || [];

      for (let i = 0; i < blankCount; i++) {
        total++;
        const correct_answer = correctAnswers[i]?.toLowerCase().trim();
        const user_answer = userAns[i]?.toLowerCase().trim();
        if (correct_answer && user_answer === correct_answer) {
          correct++;
        }
      }
    });

    setScore({ correct, total });
    setIsChecked(true);
  };

  const isBlankCorrect = (questionIndex: number, blankIndex: number): boolean | null => {
    if (!isChecked) return null;
    const correctAnswers = activity.correct_answers?.[questionIndex] || [];
    const userAns = userAnswers[`q${questionIndex}`] || [];
    const correct_answer = correctAnswers[blankIndex]?.toLowerCase().trim();
    const user_answer = userAns[blankIndex]?.toLowerCase().trim();
    return correct_answer === user_answer;
  };

  const renderQuestionWithBlanks = (question: string, questionIndex: number) => {
    const parts = question.split('_____');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      if (part) {
        elements.push(
          <span key={`text-${index}`} className="text-gray-800">
            {part}
          </span>
        );
      }

      if (index < parts.length - 1) {
        const blankIndex = index;
        const isCorrect = isBlankCorrect(questionIndex, blankIndex);
        const userAnswer = userAnswers[`q${questionIndex}`]?.[blankIndex] || '';
        const correctAnswer = activity.correct_answers?.[questionIndex]?.[blankIndex] || '';

        elements.push(
          <span key={`blank-${index}`} className="inline-flex items-center relative">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => handleBlankChange(questionIndex, blankIndex, e.target.value)}
              disabled={isChecked}
              className={`inline-block px-3 py-1 mx-1 border-b-2 bg-transparent text-center font-semibold transition-all min-w-[120px] focus:outline-none ${
                isChecked
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-blue-400 hover:border-blue-600 focus:border-blue-600'
              }`}
              placeholder="___________"
              style={{ width: `${Math.max(120, correctAnswer.length * 10)}px` }}
            />
            {isChecked && !isCorrect && (
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 whitespace-nowrap z-10">
                ✓ {correctAnswer}
              </span>
            )}
          </span>
        );
      }
    });

    return <div className="leading-loose py-2">{elements}</div>;
  };

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-blue-800">
              📝 Fill-in-the-Blanks Activity
            </h4>
            <h5 className="text-lg font-semibold text-blue-700">
              {activity.title}
            </h5>
          </div>
        </div>
        <p className="text-blue-700 mb-4">{activity.description}</p>

        <div className="space-y-3">
          <h6 className="font-semibold text-blue-800 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Instructions:
          </h6>
          <ul className="list-decimal list-inside space-y-2 text-blue-700">
            {activity.instructions.map((instruction, index) => (
              <li key={index} className="font-medium">
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Word Bank */}
      {activity.word_bank && activity.word_bank.length > 0 && (
        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h6 className="font-bold text-blue-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            WORD BANK
          </h6>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activity.word_bank.map((word, index) => (
              <div
                key={index}
                className="p-3 bg-white border border-blue-300 rounded-lg text-center font-semibold text-blue-800 shadow-sm hover:shadow-md transition-shadow">
                {word}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions with Inline Blanks */}
      {activity.questions && activity.questions.length > 0 && (
        <div className="space-y-6">
          <h6 className="font-bold text-gray-800 text-lg flex items-center">
            <PenTool className="w-5 h-5 mr-2" />
            Complete the sentences by typing in the blanks:
          </h6>
          {activity.questions.map((question, index) => (
            <div
              key={index}
              className="p-5 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <span className="text-lg font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  {index + 1}
                </span>
                <div className="flex-1 text-lg font-medium pt-1">
                  {renderQuestionWithBlanks(question, index)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check Answers Button */}
      {!isChecked && (
        <Button
          onClick={checkAnswers}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <CheckCircle className="w-5 h-5 mr-2" />
          Check My Answers
        </Button>
      )}

      {/* Score Display */}
      {isChecked && score && (
        <div
          className={`p-6 rounded-xl border-2 ${
            score.correct === score.total
              ? 'bg-green-50 border-green-300'
              : score.correct >= score.total * 0.7
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-red-50 border-red-300'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h6
              className={`font-bold text-xl flex items-center ${
                score.correct === score.total
                  ? 'text-green-800'
                  : score.correct >= score.total * 0.7
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
              <Target className="w-6 h-6 mr-2" />
              Your Score: {score.correct} / {score.total}
            </h6>
            <span
              className={`text-3xl font-bold ${
                score.correct === score.total
                  ? 'text-green-600'
                  : score.correct >= score.total * 0.7
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
              {Math.round((score.correct / score.total) * 100)}%
            </span>
          </div>
          <p
            className={`font-medium ${
              score.correct === score.total
                ? 'text-green-700'
                : score.correct >= score.total * 0.7
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
            {score.correct === score.total
              ? '🎉 Perfect! You got all answers correct!'
              : score.correct >= score.total * 0.7
              ? '👍 Good job! Review the incorrect answers above.'
              : '📚 Keep practicing! Review the correct answers above.'}
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => {
                setUserAnswers({});
                setIsChecked(false);
                setScore(null);
              }}
              variant="outline"
              className="flex-1">
              Try Again
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              <CheckCircle className="w-5 h-5 mr-2" />
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Expected Outcome */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h6 className="font-semibold text-green-800 mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Expected Outcome:
        </h6>
        <p className="text-green-700">{activity.expected_outcome}</p>
      </div>
    </div>
  );
}