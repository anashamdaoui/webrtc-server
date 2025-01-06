import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/search', 
    authMiddleware, // Protection de la route
    userController.searchUsers.bind(userController)
);

export default router; 