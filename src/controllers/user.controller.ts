import { Request, Response } from 'express';
import { User } from '../models/user.model';

export class UserController {
    async searchUsers(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            if (!query || query.length < 2) {
                res.status(400).json({ 
                    message: 'Search query must be at least 2 characters long' 
                });
                return;
            }

            const users = await User.find({
                username: { $regex: query, $options: 'i' }
            })
            .limit(3)
            .select('username _id');

            res.json(users);
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
} 