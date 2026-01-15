
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thought?: string;
  steps?: NeuralStep[];
  sources?: { uri: string; title: string }[];
}

export enum GunaType {
  SATTVA = 'SATTVA',
  RAJAS = 'RAJAS',
  TAMAS = 'TAMAS'
}
