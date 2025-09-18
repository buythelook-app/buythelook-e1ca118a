import { useState, useCallback } from "react";

interface GuidanceMessage {
  message: string;
  duration?: number;
  actions?: string[];
}

interface GuidanceState {
  completedActions: Set<string>;
  shownMessages: Set<string>;
}

export const useFairyGuidance = () => {
  const [state, setState] = useState<GuidanceState>({
    completedActions: new Set(),
    shownMessages: new Set()
  });

  const guidanceMap: Record<string, GuidanceMessage> = {
    // Home page guidance
    'home_welcome': {
      message: "Welcome! I'm your fashion assistant. Let's start by creating your styling profile so I can recommend personalized outfits for you!",
      duration: 10000,
      actions: ['start_quiz']
    },
    'home_returning_user': {
      message: "Great to see you again! Would you like to update your profile or view new recommendations?",
      duration: 8000,
      actions: ['view_looks', 'start_quiz']
    },
    'home_no_quiz': {
      message: "To give you personalized outfit recommendations, let's start with our quick styling quiz!",
      duration: 8000,
      actions: ['start_quiz']
    },

    // Quiz guidance
    'quiz_start': {
      message: "Excellent! This quiz will help me get to know you better and provide accurate recommendations. Let's begin!",
      duration: 6000
    },
    'quiz_progress': {
      message: "You're doing great! Just a few more questions and we can start creating personalized recommendations for you.",
      duration: 5000
    },

    // Results guidance
    'results_ready': {
      message: "Here are your recommendations! Each outfit was specially selected for you based on your style and color preferences.",
      duration: 8000,
      actions: ['save_looks', 'view_more']
    },

    // Filter guidance
    'filters_help': {
      message: "You can refine your search using filters. For example, choose a specific event or budget to get tailored recommendations!",
      duration: 7000
    },

    // Cart guidance
    'cart_help': {
      message: "Found something you love? Add it to your cart and see how the complete outfit looks together!",
      duration: 6000
    },

    // Idle messages
    'idle_home': {
      message: "Do you need help with anything? I'm here to help you find the perfect styling!",
      duration: 6000
    },
    'idle_quiz': {
      message: "Take your time, no need to rush. Every answer helps me get to know you better!",
      duration: 5000
    }
  };

  const getCurrentGuidance = useCallback((
    pathname: string, 
    isAuthenticated: boolean, 
    isIdle: boolean = false
  ): GuidanceMessage | null => {
    // Idle messages
    if (isIdle) {
      if (pathname === '/') return guidanceMap['idle_home'];
      if (pathname.includes('/quiz')) return guidanceMap['idle_quiz'];
      return null;
    }

    // Route-based guidance
    switch (pathname) {
      case '/':
        if (!isAuthenticated) {
          if (!state.shownMessages.has('home_welcome')) {
            setState(prev => ({
              ...prev,
              shownMessages: new Set([...prev.shownMessages, 'home_welcome'])
            }));
            return guidanceMap['home_welcome'];
          }
        } else {
          if (!state.shownMessages.has('home_returning_user')) {
            setState(prev => ({
              ...prev,
              shownMessages: new Set([...prev.shownMessages, 'home_returning_user'])
            }));
            return guidanceMap['home_returning_user'];
          }
        }
        
        // Check if user needs to take quiz
        if (!state.completedActions.has('quiz_completed')) {
          return guidanceMap['home_no_quiz'];
        }
        break;

      case '/quiz':
        if (!state.shownMessages.has('quiz_start')) {
          setState(prev => ({
            ...prev,
            shownMessages: new Set([...prev.shownMessages, 'quiz_start'])
          }));
          return guidanceMap['quiz_start'];
        }
        break;

      case '/fashion-results':
        if (!state.shownMessages.has('results_ready')) {
          setState(prev => ({
            ...prev,
            shownMessages: new Set([...prev.shownMessages, 'results_ready'])
          }));
          return guidanceMap['results_ready'];
        }
        break;

      default:
        break;
    }

    return null;
  }, [state]);

  const markActionCompleted = useCallback((action: string) => {
    setState(prev => ({
      ...prev,
      completedActions: new Set([...prev.completedActions, action])
    }));
  }, []);

  const resetGuidance = useCallback(() => {
    setState({
      completedActions: new Set(),
      shownMessages: new Set()
    });
  }, []);

  return {
    getCurrentGuidance,
    markActionCompleted,
    resetGuidance
  };
};