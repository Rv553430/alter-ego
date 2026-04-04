export interface AlterEgoResult {
  name: string;
  bio: string[];
  personality: string;
  auraScore: number;
  roast: string;
}

export interface TwitterProfile {
  bio: string;
  tweets: string[];
  avatar: string;
  displayName: string;
  username: string;
}

export interface ApiResponse {
  success: boolean;
  data?: AlterEgoResult;
  error?: string;
}
