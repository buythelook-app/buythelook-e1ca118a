
import { ProfileFetcherTool } from "../tools/profileFetcherTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
}

/**
 * Personalization Agent
 * Collects and understands user-specific parameters like style, body type, mood and preferences
 */
export const personalizationAgent: Agent = {
  role: "Personalization Agent",
  goal: "Collect and understand user-specific parameters like style, body type, mood and preferences",
  backstory: "Knows the user profile from the database or asks for missing info",
  tools: [ProfileFetcherTool]
};
