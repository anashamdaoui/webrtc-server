import { Router } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Invitation } from '../models/invitation.model';
import { authMiddleware } from '../middleware/auth.middleware';
import crypto from 'crypto';

const router = Router();

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req: AuthRequest, res: Response, next: Function): void => {
    console.log('User in isAdmin middleware:', req.user); // Debug
    const ADMIN_USERS = ['usertest1'];
    
    if (!req.user) {
        console.log('No user found in request'); // Debug
        res.status(403).json({ message: 'No user found' });
        return;
    }

    if (ADMIN_USERS.includes(req.user.username)) {
        console.log('Admin access granted for:', req.user.username); // Debug
        next();
    } else {
        console.log('Admin access denied for:', req.user.username); // Debug
        res.status(403).json({ message: 'Admin access required' });
    }
};

// Routes avec debug
router.post('/invitations/generate', authMiddleware, isAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    console.log('Generate invitation request from:', req.user);
    try {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const invitation = await Invitation.create({ code });
        
        console.log('Generated invitation code:', code); // Debug
        res.status(201).json({
            success: true,
            message: 'Invitation code generated',
            code: invitation.code
        });
    } catch (error) {
        console.error('Generate invitation error:', error);
        res.status(500).json({ message: 'Failed to generate invitation code' });
    }
});

// Lister les codes d'invitation
router.get('/invitations', authMiddleware, isAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const invitations = await Invitation.find().sort({ createdAt: -1 });
        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch invitations' });
    }
});

export default router; 