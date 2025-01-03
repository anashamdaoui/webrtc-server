import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET || 'access_default_secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m'
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'refresh_default_secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d'
  }
};
