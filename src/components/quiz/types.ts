export interface Question {
  id: number;
  question: string;
  answers: string[];
  correct: number;
  hint?: string;
}

export interface AttemptLog {
  questionId: number;
  attempts: number[];
  usedHint: boolean;
  correctAnswer: number;
}

export type GameScreen = 'welcome' | 'game' | 'result';
