
// Export all agents from a single entry point
export { personalizationAgent } from './personalizationAgent';
export { stylingAgent } from './stylingAgent';
export { validatorAgent } from './validatorAgent';
export { recommendationAgent } from './recommendationAgent';
export { trainerAgent, runValidationCycle } from './trainerAgent';

// Define and export the common Agent interface from this central location
export interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run: (userId: string) => Promise<any>; // Make run method required
}

// Define agent result interface
export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  recommendations?: string[];
}
