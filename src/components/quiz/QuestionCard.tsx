import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Question } from './types';

interface QuestionCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAttempts: number[];
  totalHints: number;
  showHintText: boolean;
  selectedAnswer: number | null;
  isAnswered: boolean;
  onSelectAnswer: (index: number) => void;
  onConfirmAnswer: () => void;
  onUseHint: () => void;
}

const QuestionCard = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  currentAttempts,
  totalHints,
  showHintText,
  selectedAnswer,
  isAnswered,
  onSelectAnswer,
  onConfirmAnswer,
  onUseHint
}: QuestionCardProps) => {
  const isCorrect = isAnswered && selectedAnswer === question.correct;
  const isWrong = isAnswered && selectedAnswer !== null && selectedAnswer !== question.correct;

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

      <div className="grid gap-4">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index;
          const showCorrect = isAnswered && index === question.correct;
          const showWrong = isAnswered && isSelected && index !== question.correct;
          
          return (
            <Button
              key={index}
              onClick={() => onSelectAnswer(index)}
              disabled={isAnswered}
              className={`h-auto py-6 px-6 text-lg font-semibold transition-all duration-300 ${
                showCorrect
                  ? 'bg-green-600 hover:bg-green-600 border-green-400 text-white animate-pulse-gold'
                  : showWrong
                  ? 'bg-red-600 hover:bg-red-600 border-red-400 text-white'
                  : isSelected
                  ? 'bg-yellow-500 hover:bg-yellow-500 text-black border-yellow-400'
                  : 'bg-[#0a0e27] hover:bg-yellow-500/20 border-yellow-500/50 text-white'
              } border-2`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-left flex-1">{answer}</span>
                {showCorrect && <Icon name="Check" size={24} />}
                {showWrong && <Icon name="X" size={24} />}
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={onConfirmAnswer}
          disabled={selectedAnswer === null || isAnswered}
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 disabled:opacity-50"
        >
          Ответить
        </Button>
      </div>
    </Card>
  );
};

export default QuestionCard;
