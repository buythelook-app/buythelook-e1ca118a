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
      message: "ברוכה הבאה! אני עוזרת האופנה שלך. בואי נתחיל ביצירת הפרופיל הסטיילינג שלך כדי שאוכל להמליץ לך על תלבושות מותאמות אישית!",
      duration: 10000,
      actions: ['start_quiz']
    },
    'home_returning_user': {
      message: "שמחה לראות אותך שוב! האם את רוצה לעדכן את הפרופיל שלך או לצפות בהמלצות חדשות?",
      duration: 8000,
      actions: ['view_looks', 'start_quiz']
    },
    'home_no_quiz': {
      message: "כדי שאוכל להמליץ לך על תלבושות מותאמות אישית, בואי נתחיל בשאלון הסטיילינג המהיר שלנו!",
      duration: 8000,
      actions: ['start_quiz']
    },

    // Quiz guidance
    'quiz_start': {
      message: "מעולה! השאלון יעזור לי להכיר אותך טוב יותר ולהתאים לך המלצות מדויקות. בואי נתחיל!",
      duration: 6000
    },
    'quiz_progress': {
      message: "את מתקדמת מצוין! עוד כמה שאלות ונוכל להתחיל ליצור עבורך המלצות מותאמות אישית.",
      duration: 5000
    },

    // Results guidance
    'results_ready': {
      message: "הנה ההמלצות שלך! כל תלבושת נבחרה במיוחד עבורך בהתבסס על הסגנון והצבעים שאת אוהבת.",
      duration: 8000,
      actions: ['save_looks', 'view_more']
    },

    // Filter guidance
    'filters_help': {
      message: "את יכולה לחדד את החיפוש שלך באמצעות הפילטרים. לדוגמה, בחרי אירוע מסוים או תקציב כדי לקבל המלצות מותאמות!",
      duration: 7000
    },

    // Cart guidance
    'cart_help': {
      message: "מצאת משהו שאת אוהבת? הוסיפי לעגלה ותוכלי לראות איך כל התלבושת נראית יחד!",
      duration: 6000
    },

    // Idle messages
    'idle_home': {
      message: "האם את צריכה עזרה במשהו? אני כאן כדי לעזור לך למצוא את הסטיילינג המושלם!",
      duration: 6000
    },
    'idle_quiz': {
      message: "קחי את הזמן שלך, אין צורך למהר. כל תשובה עוזרת לי להכיר אותך טוב יותר!",
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