import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './utils/error.handler';
import { createServer } from 'http';
import { WebRTCService } from './services/webrtc.service';
import cors from 'cors';

export const app = express();
const httpServer = createServer(app);
const webRTCService = new WebRTCService(httpServer);

app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Connexion à MongoDB avec gestion d'erreur
try {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/webrtc')
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });
} catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
}); 