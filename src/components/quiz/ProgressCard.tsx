import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Question } from './types';

interface ProgressCardProps {
  questions: Question[];
  currentQuestionIndex: number;
}

const ProgressCard = ({ questions, currentQuestionIndex }: ProgressCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30">
      <h4 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
        <Icon name="ListChecks" size={24} />
        Прогресс
      </h4>
      <div className="flex gap-2 flex-wrap">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              index < currentQuestionIndex
                ? 'bg-green-600 text-white'
                : index === currentQuestionIndex
                ? 'bg-yellow-400 text-black animate-pulse-gold'
                : 'bg-[#0a0e27] text-gray-500'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProgressCard;
