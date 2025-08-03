export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
  basics: {
    height: string;
    education: string;
    jobTitle: string;
    religion: string;
    lookingFor: string;
  };
  isOnboardingComplete: boolean;
}

export interface OnboardingData {
  name: string;
  age: string;
  location: string;
  height: string;
  education: string;
  jobTitle: string;
  religion: string;
  lookingFor: string;
  photos: string[];
  prompts: Array<{
    question: string;
    answer: string;
  }>;
}