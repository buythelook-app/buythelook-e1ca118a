
// Export all agents from a single entry point
export { personalizationAgent } from './personalizationAgent';
export { stylingAgent } from './stylingAgent';
export { validatorAgent } from './validatorAgent';
export { recommendationAgent } from './recommendationAgent';
export { trainerAgent, runValidationCycle } from './trainerAgent';

// Define and export the common Agent interface and result types
export interface Agent {
  name: string;
  run: (userId: string) => Promise<AgentResult>;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  recommendations?: string[];
}
