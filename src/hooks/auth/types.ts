
export interface AuthFlowState {
  isLoading: boolean;
  isSignIn: boolean;
  isPasswordRecovery: boolean;
  authError: string | null;
}
