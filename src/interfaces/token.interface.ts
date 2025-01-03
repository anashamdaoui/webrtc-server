export interface TokenPayload {
    userId: string;
    username: string;
  }
  
  export interface TokenPair {
    accessToken: string;
    refreshToken: string;
  }