
export interface Repository {
  id: string;
  url: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  aiSummary: string;
  useCases: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  addedAt: number;
  imageUrl?: string;
}

export interface GeminiRepoAnalysis {
  summary: string;
  useCases: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryLanguage: string;
  topics: string[];
  estimatedStars: number;
}
