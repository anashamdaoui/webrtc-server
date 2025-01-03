import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { tokenService } from '../services/token.service';
import { User } from '../models/user.model';
import { Invitation } from '../models/invitation.model';
import { loginValidation, registerValidation, validate } from '../middleware/validation.middleware';
import { loginLimiter, registerLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/login', 
    loginLimiter,
    loginValidation,
    validate,
    async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        
        // Vérifier l'utilisateur dans la base de données
        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Vérifier le mot de passe
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer les tokens
        const tokens = tokenService.generateTokenPair({
            userId: user._id.toString(),
            username: user.username
        });

        res.json({
            message: 'Login successful',
            ...tokens
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
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

router.post('/register',
    registerLimiter,
    registerValidation,
    validate,
    async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, invitationCode } = req.body;

        // Vérifier le code d'invitation
        const invitation = await Invitation.findOne({ code: invitationCode, isUsed: false });
        if (!invitation) {
            res.status(400).json({ message: 'Invalid or used invitation code' });
            return;
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }

        // Créer l'utilisateur
        const user = await User.create({ username, password });

        // Marquer le code comme utilisé
        invitation.isUsed = true;
        invitation.usedBy = user._id;
        invitation.usedAt = new Date();
        await invitation.save();

        // Générer les tokens
        const tokens = tokenService.generateTokenPair({
            userId: user._id.toString(),
            username: user.username
        });

        res.status(201).json({
            message: 'Registration successful',
            ...tokens
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

export default router; 