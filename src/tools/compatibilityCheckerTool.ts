
/**
 * Tool for checking outfit compatibility
 * Ensures that outfit combinations are appropriate and match well
 */
export const CompatibilityCheckerTool = {
  name: "CompatibilityCheckerTool",
  description: "Checks if all items in the outfit match and make sense together",
  execute: async (outfit: {
    top: {
      color: string;
      product_name: string;
      description: string;
      price: string;
      image: string;
    };
    bottom: {
      color: string;
      product_name: string;
      description: string;
      price: string;
      image: string;
    };
    shoes: {
      color: string;
      product_name: string;
      description: string;
      price: string;
      image: string;
    };
    coat?: {
      color: string;
      product_name: string;
      description: string;
      price: string;
      image: string;
    };
    description: string;
  }) => {
    console.log(`Checking compatibility for: ${JSON.stringify(outfit)}`);
    
    try {
      // Here we would implement real compatibility checking logic
      // For now we return placeholder data
      const isValid = outfit.top && outfit.bottom && outfit.shoes;
      
      return {
        success: true,
        data: {
          isCompatible: isValid,
          compatibilityScore: isValid ? 0.85 : 0.3,
          suggestions: isValid ? [
            "Consider adding a silver accessory to enhance this look"
          ] : [
            "This outfit is missing essential pieces",
            "Try adding a complementary piece to balance the look"
          ]
        }
      };
    } catch (error) {
      console.error('Error checking compatibility:', error);
      return {
        success: false,
        error: 'Failed to check outfit compatibility'
      };
    }
  },
  
  // Add run method as an alias to execute for compatibility
  run: async (input: { top: any, bottom: any, shoes: any }) => {
    const result = await CompatibilityCheckerTool.execute(input);
    return {
      valid: result.success ? result.data.isCompatible : false,
      message: result.success ? 
        (result.data.isCompatible ? "Outfit is compatible" : "Incompatible outfit") : 
        "Failed to check compatibility"
    };
  }
};
