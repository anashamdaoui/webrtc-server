import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { TokenPayload, TokenPair } from '../interfaces/token.interface';

export class TokenService {
  public generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, jwtConfig.access.secret, {
      expiresIn: jwtConfig.access.expiresIn
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refresh.secret, {
      expiresIn: jwtConfig.refresh.expiresIn
    });

    console.log('Generated tokens:', { accessToken, refreshToken });
    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, jwtConfig.access.secret) as TokenPayload;
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      console.log('Verifying refresh token:', token);
      const decoded = jwt.verify(token, jwtConfig.refresh.secret) as any;
      // Extraire seulement les données utiles du payload
      const payload: TokenPayload = {
        userId: decoded.userId,
        username: decoded.username
      };
      console.log('Refresh token payload:', payload);
      return payload;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      throw error;
    }
  }

  public refreshAccessToken(refreshToken: string): string {
    const payload = this.verifyRefreshToken(refreshToken);
    return jwt.sign(payload, jwtConfig.access.secret, {
      expiresIn: jwtConfig.access.expiresIn
    });
  }
}

export const tokenService = new TokenService();
