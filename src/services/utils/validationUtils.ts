
/**
 * Utility functions for validating input data
 */

/**
 * Validates mood against the allowed values
 */
export const validateMood = (mood: string | null): string => {
  const validMoods = [
    "mystery", "quiet", "elegant", "energized", 
    "flowing", "optimist", "calm", "romantic", 
    "unique", "sweet", "childish", "passionate", 
    "powerful"
  ];
  
  // Log the mood being validated to debug
  console.log('Validating mood:', mood);
  
  if (!mood || typeof mood !== 'string') {
    console.log('Mood is null or not a string, using default: "energized"');
    return "energized";
  }
  
  const lowerCaseMood = mood.toLowerCase();
  
  // Check if the mood contains a timestamp (from development forced refresh)
  if (lowerCaseMood.includes('-')) {
    const baseMood = lowerCaseMood.split('-')[0];
    if (validMoods.includes(baseMood)) {
      console.log(`Found timestamp in mood "${lowerCaseMood}", using base mood: "${baseMood}"`);
      return baseMood;
    }
  }
  
  // Check if the mood is valid
  if (validMoods.includes(lowerCaseMood)) {
    return lowerCaseMood;
  }
  
  console.log(`Invalid mood "${lowerCaseMood}", using default: "energized"`);
  return "energized";
};
