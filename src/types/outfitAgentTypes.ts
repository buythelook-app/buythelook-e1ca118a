
// Types for outfit agent results
export interface AgentOutfit {
  top?: string;
  bottom?: string;
  shoes?: string;
  score?: number;
  description?: string;
  recommendations?: string[];
}

export interface AgentResult {
  agent: string;
  output: AgentOutfit;
  timestamp?: string;
}

export interface TrainerAgentResponse {
  success: boolean;
  status: string;
  results: AgentResult[];
  message?: string;
}

export interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
