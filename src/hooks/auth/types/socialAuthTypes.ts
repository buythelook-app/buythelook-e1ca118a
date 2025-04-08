
import { SocialProvider } from "../useSocialAuth";

export interface SocialAuthState {
  isLoading: {[key: string]: boolean};
  isMobile: boolean;
  authAttemptId: string | null;
}

export interface SocialAuthProviderProps {
  providerLoading: boolean;
  onClick: () => void;
}
