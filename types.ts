
export interface UserProfile {
  name: string;
  birthDate: string;
}

export interface AlignmentState {
  emotionLevel: number; // -100 to 100 (Negative Affection to Positive Emotion)
  energyVector: number; // 0 to 100
  focusDimension: 'Material' | 'Spiritual' | 'Digital' | 'Social';
}

export interface QuarterlyFocus {
  quarter: string;
  theme: string;
  gitaVerse: string;
  balancingAction: string;
}

export interface YearlyDedication {
  introduction: string;
  coreSpiritualLesson: string;
  quarters: QuarterlyFocus[];
}

export interface GitaInsight {
  verse: string;
  summary: string;
  philosophicalStatement: string;
  modernReframing: string;
}

export enum GunaType {
  SATTVA = 'SATTVA',
  RAJAS = 'RAJAS',
  TAMAS = 'TAMAS'
}
