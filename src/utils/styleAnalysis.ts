
import { QuizFormData } from "@/components/quiz/types";
import { Mood } from "@/components/filters/MoodFilter";

interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    preferences: string[];
    bodyMeasurements: {
      height: string;
      weight: string;
      waist: string;
      chest: string;
      bodyShape: string;
    };
    moodBasedStyle?: {
      mood: Mood;
      recommendations: string[];
    };
  };
}

const moodStyleMap: Record<Mood, string[]> = {
  mystery: ["experimental", "avant-garde", "unique"],
  quiet: ["minimalist", "neutral", "comfortable"],
  elegant: ["sophisticated", "classic", "refined"],
  energized: ["bold", "sporty", "vibrant"],
  flowing: ["bohemian", "relaxed", "natural"],
  optimist: ["bright", "playful", "casual"],
  calm: ["soft", "comfortable", "relaxed"],
  romantic: ["feminine", "delicate", "dreamy"],
  unique: ["eclectic", "artistic", "statement"],
  sweet: ["cute", "feminine", "playful"],
  childish: ["playful", "casual", "comfortable"],
  passionate: ["bold", "dramatic", "statement"],
  powerful: ["structured", "professional", "bold"]
};

export const analyzeStyleWithAI = (quizData: QuizFormData, currentMood?: Mood): StyleAnalysis => {
  console.log('Analyzing style with quiz data:', quizData, 'and mood:', currentMood);

  const analysis: StyleAnalysis = {
    analysis: {
      styleProfile: quizData.stylePreferences?.[0] || "Classic",
      preferences: quizData.stylePreferences || [],
      bodyMeasurements: {
        height: quizData.height,
        weight: quizData.weight,
        waist: quizData.waist,
        chest: quizData.chest,
        bodyShape: quizData.bodyShape
      }
    }
  };

  if (currentMood) {
    analysis.analysis.moodBasedStyle = {
      mood: currentMood,
      recommendations: moodStyleMap[currentMood] || []
    };
  }

  return analysis;
};

export const combineStyleAndMood = (styleAnalysis: StyleAnalysis, currentMood?: Mood): StyleAnalysis => {
  if (!currentMood) return styleAnalysis;

  return {
    ...styleAnalysis,
    analysis: {
      ...styleAnalysis.analysis,
      moodBasedStyle: {
        mood: currentMood,
        recommendations: moodStyleMap[currentMood] || []
      }
    }
  };
};
