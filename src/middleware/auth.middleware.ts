import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
