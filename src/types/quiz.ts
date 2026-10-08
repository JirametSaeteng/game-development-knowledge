export type QuizDifficulty = 'beginner' | 'practical';

export type QuestionFormat = 
  | 'code-block-fill'     // Code snippet with a blank [ ___BLANK___ ], choose from clickable blocks
  | 'concept-fill'        // Conceptual statement with a blank [ ___BLANK___ ], choose from clickable terms
  | 'multiple-choice'     // Deep technical multiple-choice question
  | 'bug-diagnostic'     // Diagnostic analysis of code/profiler bottleneck
  | 'step-order';         // Sequence of steps to arrange in correct order

export interface QuizQuestion {
  id: string;
  topicId: string;
  difficulty: QuizDifficulty;
  format: QuestionFormat;
  title: string;
  prompt: string;
  codeSnippet?: string; // Contains `___BLANK___` for fill questions, or code to analyze
  options: string[]; // Options or blocks to choose from
  correctAnswer: string | number | string[]; // string for blank/fill, number (index 0..3) for choice/diagnostic, or string[] for order
  hint?: string;
  explanation: string;
  engineContext?: 'Unity' | 'Unreal Engine' | 'C++ / Low-Level' | 'General Engine';
}

export interface TopicQuizData {
  topicId: string;
  beginner: QuizQuestion[];
  practical: QuizQuestion[];
}
