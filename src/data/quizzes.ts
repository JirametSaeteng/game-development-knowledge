import type { TopicQuizData } from '../types/quiz';
import { QUIZZES_PART_1 } from './quizzesPart1';
import { QUIZZES_PART_2 } from './quizzesPart2';
import { QUIZZES_PART_3 } from './quizzesPart3';

export const TOPIC_QUIZZES: Record<string, TopicQuizData> = {
  ...QUIZZES_PART_1,
  ...QUIZZES_PART_2,
  ...QUIZZES_PART_3,
};
