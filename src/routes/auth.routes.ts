import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { tokenService } from '../services/token.service';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // TODO: Vérifier les credentials dans la DB
        // Pour l'instant, on simule une authentification réussie
        const userData = {
            userId: '123', // Sera remplacé par l'ID de la DB
            username: username
        };

        const tokens = tokenService.generateTokenPair(userData);

        res.json({
            message: 'Login successful',
            ...tokens
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        console.log('Received refresh request with token:', refreshToken);
        
        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        const accessToken = tokenService.refreshAccessToken(refreshToken);
        console.log('Generated new access token:', accessToken);

        res.json({ accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ 
            message: 'Invalid refresh token',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route protégée d'exemple
router.get('/protected', authMiddleware, (req: AuthRequest, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Vérification de la validité du token
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const { accessToken } = req.body;
        
        if (!accessToken) {
            res.status(400).json({ message: 'Access token is required' });
            return;
        }

        const payload = tokenService.verifyAccessToken(accessToken);
        res.json({ 
            valid: true,
            user: payload
        });
    } catch (error) {
        res.status(401).json({ 
            valid: false,
            message: 'Invalid token',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Déconnexion
router.post('/logout', authMiddleware, (req: AuthRequest, res: Response): void => {
    try {
        // Dans une implémentation future avec base de données,
        // on pourrait blacklister le refresh token ici
        
        res.json({ 
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Logout failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router; 