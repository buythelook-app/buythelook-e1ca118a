
// Types for outfit agent results
export interface AgentOutfit {
  top?: any; // Database item from zara_cloth table
  bottom?: any; // Database item from zara_cloth table
  shoes?: any; // Database item from zara_cloth table
  coat?: any; // Database item from zara_cloth table
  score?: number;
  description?: string;
  recommendations?: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
  approved?: boolean;
  feedback?: string;
  userFeedback?: {
    isLiked?: boolean; 
    comment?: string;
  };
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

export interface ApprovalData {
  agentName: string;
  outfitId: string;
  approved: boolean;
  feedback?: string;
  userLiked?: boolean;
  userFeedback?: string;
}
