export type Category = 
  | 'performance' 
  | 'physics' 
  | 'rendering' 
  | 'ai' 
  | 'architecture'
  | 'networking'
  | 'audio';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CodeSnippet {
  title?: string;
  language: string;
  badTitle?: string;
  badCode?: string;
  goodTitle?: string;
  goodCode?: string;
  explanation: string;
}

export interface TopicCodeExamples {
  pureLogic: CodeSnippet;
  unity: CodeSnippet;
  unreal: CodeSnippet;
}

export interface MetricComparison {
  metric: string;
  unoptimized: string;
  optimized: string;
  improvement: string;
  explanation: string;
}

export interface ChallengeBlank {
  id: string;
  label: string;
  expected: string;
  acceptedAlternatives?: string[];
  hint: string;
  options?: string[];
}

export interface ChallengeItem {
  id: string;
  type: 'pure' | 'unity' | 'unreal';
  title: string;
  language: 'typescript' | 'csharp' | 'cpp';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  conceptNotes: string;
  starterCode: string; // Code with placeholders like ___BLANK_1___, ___BLANK_2___
  blanks: ChallengeBlank[];
  fullSolution: string;
  explanation: string;
  testCaseDescription?: string;
}

export interface TopicChallenges {
  pureLogic: ChallengeItem;
  unity: ChallengeItem;
  unreal: ChallengeItem;
}

export interface Topic {
  id: string;
  title: string;
  titleEn: string;
  category: Category;
  difficulty: Difficulty;
  summary: string;
  iconName: string;
  hasInteractiveLab: boolean;
  labType?:
    | 'object-pool'
    | 'spatial-grid'
    | 'ecs-dod'
    | 'fixed-timestep'
    | 'draw-calls'
    | 'pathfinding'
    | 'ai-fsm'
    | 'frustum-culling'
    | 'multi-threading'
    | 'shader-overdraw'
    | 'netcode-prediction'
    | 'texture-streaming'
    | 'audio-concurrency'
    | 'async-loading';
  
  // 3 Explanation Tiers
  simpleExplanation: {
    analogy: string;
    keyConcept: string;
    whyItMatters: string;
    visualAnalogyDesc: string;
    bulletPoints: string[];
  };

  deepExplanation: {
    architecturalDetail: string;
    lowLevelMechanics: string;
    engineInternals: {
      unity?: string;
      unreal?: string;
      godot?: string;
    };
    complexity: {
      time: string;
      space: string;
      explanation: string;
    };
    mathOrTheory?: string;
    pitfalls: string[];
  };

  codeExample?: CodeSnippet;
  codeExamples: TopicCodeExamples;

  performanceComparison: {
    benchmarkTitle: string;
    metrics: MetricComparison[];
    verdict: string;
  };

  // 3 Challenge Variants (Pure Logic, Unity C#, Unreal C++)
  challenges: TopicChallenges;
}
