export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  recommendations?: string[];
}

export interface Agent {
  name: string;
  role?: string;
  goal?: string;
  backstory?: string;
  tools?: any[];
  run(userId: string): Promise<AgentResult>;
}
