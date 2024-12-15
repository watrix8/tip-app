// src/app/types/user.ts

export interface UserData {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    restaurantId?: string;
    stripeAccountId?: string;
    stripeOnboardingStatus?: string;
    stripeOnboardingTimestamp?: string;
  }
  
  export interface SettingsPageProps {
    currentUser: UserData | null;
  }