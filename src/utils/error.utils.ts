export class AuthError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export class TokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenError';
    }
  }