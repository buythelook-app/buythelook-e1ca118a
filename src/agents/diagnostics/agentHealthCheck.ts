import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent } from "@/agents";
import { supervisorAgent } from "@/agents/supervisorAgent";
import { agentCrew } from "@/agents/crew";

export interface AgentHealthDetail {
  name: string;
  role: string;
  success: boolean;
  error?: string;
  stats?: Record<string, number | string | boolean>;
}

export interface AgentHealthReport {
  userId: string;
  timestamp: string;
  agents: AgentHealthDetail[];
  coordinatedRun: AgentHealthDetail;
  overallOk: boolean;
}

export async function runAgentHealthCheck(userId: string): Promise<AgentHealthReport> {
  const agents: AgentHealthDetail[] = [];

  // 1) Personalization
  let personalizationResult: any = null;
  try {
    personalizationResult = await personalizationAgent.run(userId);
    agents.push({
      name: "personalizationAgent",
      role: "Personalization – user profile, body shape, preferences",
      success: !!personalizationResult?.success,
      error: personalizationResult?.success ? undefined : (personalizationResult?.error || "Unknown error"),
      stats: {
        looks: personalizationResult?.data?.looks?.length || 0,
      },
    });
  } catch (e: any) {
    agents.push({ name: "personalizationAgent", role: "Personalization", success: false, error: e?.message || String(e) });
  }

  // 2) Styling (optionally with personalization data)
  let stylingResult: any = null;
  try {
    if ((stylingAgent as any).runWithPersonalizationData && personalizationResult?.success) {
      stylingResult = await (stylingAgent as any).runWithPersonalizationData(userId, personalizationResult.data);
    } else {
      stylingResult = await stylingAgent.run(userId);
    }

    agents.push({
      name: "stylingAgent",
      role: "Styling – build outfits, pick items, color + event logic",
      success: !!stylingResult?.success,
      error: stylingResult?.success ? undefined : (stylingResult?.error || "Unknown error"),
      stats: {
        looks: stylingResult?.data?.looks?.length || 0,
      },
    });
  } catch (e: any) {
    agents.push({ name: "stylingAgent", role: "Styling", success: false, error: e?.message || String(e) });
  }

  // 3) Validator with outfit data
  let validatorResult: any = null;
  try {
    const looks = stylingResult?.data?.looks || [];
    if ((validatorAgent as any).runWithOutfitData) {
      validatorResult = await (validatorAgent as any).runWithOutfitData(userId, looks);
    } else {
      validatorResult = await validatorAgent.run(userId);
    }
    agents.push({
      name: "validatorAgent",
      role: "Validation – compatibility checks, completeness",
      success: !!validatorResult?.success,
      error: validatorResult?.success ? undefined : (validatorResult?.error || "Unknown error"),
      stats: {
        isCompatible: !!validatorResult?.data?.isCompatible,
        overallScore: validatorResult?.data?.overallScore ?? "",
      },
    });
  } catch (e: any) {
    agents.push({ name: "validatorAgent", role: "Validation", success: false, error: e?.message || String(e) });
  }

  // 4) Recommendation with context
  let recommendationResult: any = null;
  try {
    if ((recommendationAgent as any).runWithContext) {
      recommendationResult = await (recommendationAgent as any).runWithContext(userId, {
        personalization: undefined, // not strictly needed here
        styling: stylingResult?.data,
        validation: validatorResult?.data,
      });
    } else {
      recommendationResult = await recommendationAgent.run(userId);
    }
    agents.push({
      name: "recommendationAgent",
      role: "Recommendations – contextual tips and next steps",
      success: !!recommendationResult?.success || Array.isArray(recommendationResult),
      error: recommendationResult?.success === false ? (recommendationResult?.error || "Unknown error") : undefined,
      stats: {
        recCount: Array.isArray(recommendationResult?.data) ? recommendationResult?.data?.length : (recommendationResult?.data?.recommendations?.length || 0),
      },
    });
  } catch (e: any) {
    agents.push({ name: "recommendationAgent", role: "Recommendations", success: false, error: e?.message || String(e) });
  }

  // 5) Supervisor review
  try {
    const sup = await supervisorAgent.reviewAndTrain({
      personalization: undefined,
      styling: stylingResult,
      validation: validatorResult,
      recommendations: recommendationResult,
    });
    agents.push({
      name: "supervisorAgent",
      role: "Supervisor – quality control, deduping, training",
      success: true,
      stats: {
        approvedLooks: sup?.approvedLooks?.length || 0,
        duplicatesRemoved: sup?.duplicatesRemoved || 0,
        feedbackCount: sup?.feedback?.length || 0,
      },
    });
  } catch (e: any) {
    agents.push({ name: "supervisorAgent", role: "Supervisor", success: false, error: e?.message || String(e) });
  }

  // 6) Coordinated run via crew
  let coordinated: AgentHealthDetail = {
    name: "agentCrew",
    role: "Coordinated – end-to-end flow",
    success: false,
  };
  try {
    const res = await agentCrew.run(userId);
    coordinated = {
      name: "agentCrew",
      role: "Coordinated – end-to-end flow",
      success: !!res?.success,
      error: res?.success ? undefined : (res?.error || "Unknown error"),
      stats: {
        looks: res?.data?.looks?.length || 0,
        hasRecommendations: !!res?.data?.recommendations?.length,
      },
    };
  } catch (e: any) {
    coordinated = { name: "agentCrew", role: "Coordinated", success: false, error: e?.message || String(e) };
  }

  return {
    userId,
    timestamp: new Date().toISOString(),
    agents,
    coordinatedRun: coordinated,
    overallOk: agents.every(a => a.success) && coordinated.success,
  };
}
