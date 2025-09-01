/**
 * State Manager - מנהל מרכזי לכל ההגדרות והמצבים
 */

export type Mode = "All" | "Casual" | "Work" | "Party" | "Date" | "Relaxing" | "Travel" | "Shopping" | "Sport";
export type Mood = 'mystery' | 'quiet' | 'elegant' | 'energized' | 'flowing' | 'optimist' | 'calm' | 'romantic' | 'unique' | 'sweet' | 'childish' | 'passionate' | 'powerful';
export type Event = 'casual' | 'work' | 'evening' | 'weekend';

export interface AppState {
  currentMood: Mood | null;
  currentEvent: Event;
  selectedMode: Mode;
  styleAnalysis: any;
  originalQuizStyle: any;
  userProfile: any;
}

class StateManager {
  private static instance: StateManager;
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  private constructor() {
    this.state = this.loadStateFromStorage();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private loadStateFromStorage(): AppState {
    try {
      return {
        currentMood: this.getFromStorage('current-mood') as Mood | null,
        currentEvent: (this.getFromStorage('current-event') as Event) || 'casual',
        selectedMode: (this.getFromStorage('selected-mode') as Mode) || 'All',
        styleAnalysis: this.getFromStorage('styleAnalysis', true),
        originalQuizStyle: this.getFromStorage('originalQuizStyle', true),
        userProfile: this.getFromStorage('userProfile', true),
      };
    } catch (error) {
      console.warn('Error loading state from storage:', error);
      return this.getDefaultState();
    }
  }

  private getDefaultState(): AppState {
    return {
      currentMood: null,
      currentEvent: 'casual',
      selectedMode: 'All',
      styleAnalysis: null,
      originalQuizStyle: null,
      userProfile: null,
    };
  }

  private getFromStorage(key: string, isJSON = false): any {
    try {
      const value = localStorage.getItem(key);
      return value ? (isJSON ? JSON.parse(value) : value) : null;
    } catch {
      return null;
    }
  }

  private setToStorage(key: string, value: any, isJSON = false): void {
    try {
      localStorage.setItem(key, isJSON ? JSON.stringify(value) : value);
    } catch (error) {
      console.warn(`Failed to save ${key} to storage:`, error);
    }
  }

  // Public methods for state management
  getState(): AppState {
    return { ...this.state };
  }

  updateState(updates: Partial<AppState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Save to localStorage
    Object.entries(updates).forEach(([key, value]) => {
      const storageKey = this.getStorageKey(key);
      if (storageKey) {
        const isJSON = ['styleAnalysis', 'originalQuizStyle', 'userProfile'].includes(key);
        this.setToStorage(storageKey, value, isJSON);
      }
    });

    // Notify listeners
    this.listeners.forEach(listener => listener(this.state));
    
    console.log('🔄 State updated:', { oldState, newState: this.state, updates });
  }

  private getStorageKey(stateKey: string): string | null {
    const keyMap: Record<string, string> = {
      currentMood: 'current-mood',
      currentEvent: 'current-event',
      selectedMode: 'selected-mode',
      styleAnalysis: 'styleAnalysis',
      originalQuizStyle: 'originalQuizStyle',
      userProfile: 'userProfile',
    };
    return keyMap[stateKey] || null;
  }

  // Specific methods for common operations
  setMood(mood: Mood): void {
    this.updateState({ currentMood: mood });
  }

  setEvent(event: Event): void {
    this.updateState({ currentEvent: event });
  }

  setMode(mode: Mode): void {
    this.updateState({ selectedMode: mode });
  }

  setModeAndEvent(mode: Mode, event: Event): void {
    this.updateState({ selectedMode: mode, currentEvent: event });
  }

  getMood(): Mood | null {
    return this.state.currentMood;
  }

  getEvent(): Event {
    return this.state.currentEvent;
  }

  getMode(): Mode {
    return this.state.selectedMode;
  }

  // Subscription system
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Reset functions
  resetUserData(): void {
    this.updateState({
      currentMood: null,
      styleAnalysis: null,
      userProfile: null,
    });
  }

  resetAll(): void {
    this.state = this.getDefaultState();
    // Clear localStorage
    ['current-mood', 'current-event', 'selected-mode', 'styleAnalysis', 'originalQuizStyle', 'userProfile'].forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const stateManager = StateManager.getInstance();

// Helper hooks for React components
export const useStateManager = () => {
  return stateManager;
};