import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Question } from './types';

interface MatchingQuestionProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAttempts: number[];
  totalHints: number;
  showHintText: boolean;
  isAnswered: boolean;
  onConfirm: (isCorrect: boolean, selectedOrder: number[]) => void;
  onUseHint: () => void;
}

const MatchingQuestion = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  currentAttempts,
  totalHints,
  showHintText,
  isAnswered,
  onConfirm,
  onUseHint
}: MatchingQuestionProps) => {
  const [selectedMatches, setSelectedMatches] = useState<{ [key: number]: number | null }>({
    0: null,
    1: null,
    2: null,
    3: null
  });

  const { elements = [], functions = [], correctOrder = [] } = question.matchingPairs || {};

  const handleSelectMatch = (elementIndex: number, functionIndex: number) => {
    if (isAnswered) return;
    
    setSelectedMatches(prev => ({
      ...prev,
      [elementIndex]: prev[elementIndex] === functionIndex ? null : functionIndex
    }));
  };

  const handleConfirm = () => {
    const allMatched = Object.values(selectedMatches).every(val => val !== null);
    if (!allMatched) return;

    const userOrder = Object.values(selectedMatches) as number[];
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    
    onConfirm(isCorrect, userOrder);
  };

  const allSelected = Object.values(selectedMatches).every(val => val !== null);

  return (
    <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xl">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <p className="text-gray-400 text-sm">Вопрос {currentQuestionIndex + 1} из {totalQuestions}</p>
            {currentAttempts.length > 0 && (
              <p className="text-orange-400 text-sm">Попыток: {currentAttempts.length + 1}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Подсказок осталось</p>
            <p className="text-yellow-400 font-bold text-xl">{totalHints}</p>
          </div>
          <Button
            onClick={onUseHint}
            disabled={totalHints === 0 || showHintText}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:bg-gray-700"
          >
            <Icon name="Lightbulb" className="mr-2" size={20} />
            Подсказка
          </Button>
        </div>
      </div>

      {showHintText && (
        <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" className="text-blue-400 flex-shrink-0 mt-1" size={24} />
            <p className="text-blue-200">{question.hint}</p>
          </div>
        </div>
      )}

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
        {question.question}
      </h3>

      <p className="text-gray-300 mb-6 text-center">
        Нажми на элемент слева, затем на соответствующую функцию справа
      </p>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-3">
          <h4 className="text-yellow-400 font-bold text-lg mb-4 text-center">Элементы</h4>
          {elements.map((element, index) => {
            const matchedFunction = selectedMatches[index];
            const hasMatch = matchedFunction !== null;
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  hasMatch
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'bg-[#0a0e27] border-yellow-500/30 hover:border-yellow-500/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{element}</span>
                  {hasMatch && (
                    <Icon name="ArrowRight" className="text-yellow-400" size={20} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h4 className="text-yellow-400 font-bold text-lg mb-4 text-center">Функции</h4>
          {functions.map((func, funcIndex) => {
            const elementIndex = Object.entries(selectedMatches).find(
              ([_, val]) => val === funcIndex
            )?.[0];
            const isSelected = elementIndex !== undefined;
            
            return (
              <button
                key={funcIndex}
                onClick={() => {
                  if (isSelected) {
                    const elemIdx = parseInt(elementIndex as string);
                    handleSelectMatch(elemIdx, funcIndex);
                  } else {
                    const firstUnmatched = Object.entries(selectedMatches).find(
                      ([_, val]) => val === null
                    );
                    if (firstUnmatched) {
                      handleSelectMatch(parseInt(firstUnmatched[0]), funcIndex);
                    }
                  }
                }}
                disabled={isAnswered}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'bg-yellow-500/20 border-yellow-500'
                    : 'bg-[#0a0e27] border-yellow-500/30 hover:border-yellow-500/60'
                } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <Icon name="Check" className="text-yellow-400 flex-shrink-0" size={20} />
                  )}
                  <span className="text-white font-semibold">{func}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleConfirm}
          disabled={!allSelected || isAnswered}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 disabled:opacity-50"
        >
          Ответить
        </Button>
      </div>
    </Card>
  );
};

export default MatchingQuestion;
