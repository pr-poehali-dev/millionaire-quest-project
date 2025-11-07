import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MoneyLadderProps {
  currentQuestion: number;
  currentMoney: number;
}

const MONEY_LADDER = [
  { level: 12, amount: 1000000, label: '1 000 000 ₽' },
  { level: 11, amount: 500000, label: '500 000 ₽' },
  { level: 10, amount: 250000, label: '250 000 ₽' },
  { level: 9, amount: 125000, label: '125 000 ₽' },
  { level: 8, amount: 64000, label: '64 000 ₽' },
  { level: 7, amount: 32000, label: '32 000 ₽' },
  { level: 6, amount: 16000, label: '16 000 ₽' },
  { level: 5, amount: 8000, label: '8 000 ₽' },
  { level: 4, amount: 4000, label: '4 000 ₽' },
  { level: 3, amount: 2000, label: '2 000 ₽' },
  { level: 2, amount: 1500, label: '1 500 ₽' },
  { level: 1, amount: 1000, label: '1 000 ₽' },
];

const MoneyLadder = ({ currentQuestion, currentMoney }: MoneyLadderProps) => {
  const currentLevel = currentQuestion + 1;

  return (
    <Card className="p-4 bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border-2 border-yellow-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Trophy" size={24} className="text-yellow-400" />
        <h4 className="text-yellow-400 font-bold text-lg">Ваш выигрыш</h4>
      </div>
      
      <div className="mb-4 p-3 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg">
        <p className="text-yellow-400 text-sm text-center">Текущая сумма</p>
        <p className="text-white text-2xl font-bold text-center">
          {currentMoney.toLocaleString('ru-RU')} ₽
        </p>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {MONEY_LADDER.map((item) => {
          const isCurrent = item.level === currentLevel;
          const isPassed = item.level < currentLevel;
          const isFireproof = item.level === 5 || item.level === 10;

          return (
            <div
              key={item.level}
              className={`p-2 rounded-lg border-2 transition-all ${
                isCurrent
                  ? 'bg-yellow-500 border-yellow-400 text-black animate-pulse-gold'
                  : isPassed
                  ? 'bg-green-600/30 border-green-500/50 text-green-300'
                  : 'bg-[#0a0e27] border-yellow-500/20 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.level}</span>
                <span className={`text-sm font-bold ${isCurrent ? 'text-black' : ''}`}>
                  {item.label}
                </span>
                {isFireproof && !isPassed && (
                  <Icon 
                    name="Shield" 
                    size={16} 
                    className={isCurrent ? 'text-black' : 'text-orange-400'}
                  />
                )}
                {isPassed && <Icon name="Check" size={16} className="text-green-400" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-2 bg-blue-600/20 border border-blue-500/50 rounded text-xs text-blue-200">
        <Icon name="Info" size={14} className="inline mr-1" />
        Несгораемые суммы: 8 000 ₽ и 250 000 ₽
      </div>
    </Card>
  );
};

export default MoneyLadder;
