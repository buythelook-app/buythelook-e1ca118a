export interface QuizFormData {
  gender: string;
  height: string;
  weight: string;
  waist: string;
  chest: string;
  bodyShape: string;
  photo: File | null;
  colorPreferences: string[];
  stylePreferences: string[];
}

export interface QuizContextType {
  formData: QuizFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuizFormData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
}