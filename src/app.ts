import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Gestion des erreurs globale
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 