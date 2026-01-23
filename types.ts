
export interface UserProfile {
  name: string;
  birthDate: string;
}

export interface AlignmentState {
  emotionLevel: number; 
  energyVector: number; 
  focusDimension: 'Material' | 'Spiritual' | 'Digital' | 'Social';
}

export interface NeuralStep {
  agent: 'Sattva-Logic' | 'Rajas-Action' | 'Tamas-Stability';
  hash: string;
  content: string;
  timestamp: number;
}

export interface GitaInsight {
  verse: string;
  summary: string;
  philosophicalStatement: string;
  modernReframing: string;
  neuralMeshID: string;
  rating?: 'Helpful' | 'Insightful' | 'Confusing';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thought?: string;
  steps?: NeuralStep[];
  sources?: { uri: string; title: string }[];
}

export interface ArchivedAnalysis {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: string;
}

export enum GunaType {
  SATTVA = 'SATTVA',
  RAJAS = 'RAJAS',
  TAMAS = 'TAMAS'
}
