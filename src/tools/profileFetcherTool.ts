
/**
 * Tool for fetching user profile data
 * Retrieves style preferences, body measurements, and other personalization data
 */
export const ProfileFetcherTool = {
  name: "ProfileFetcherTool",
  description: "Fetches user profile details from the database (e.g. style, body type, mood)",
  execute: async (userId: string) => {
    console.log(`Fetching profile for user: ${userId}`);
    
    // Get stored data from localStorage if available
    try {
      const styleAnalysis = localStorage.getItem('styleAnalysis') ? 
        JSON.parse(localStorage.getItem('styleAnalysis')!) : null;
      
      const currentMood = localStorage.getItem('current-mood');
      
      return {
        success: true,
        data: {
          userId: userId,
          style: styleAnalysis?.analysis?.styleProfile || "Classic",
          bodyType: styleAnalysis?.analysis?.bodyShape || "Hourglass",
          mood: currentMood || "Romantic"
        }
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: 'Failed to fetch user profile'
      };
    }
  }
};
