import mongoose from 'mongoose';
import { User } from '../models/user.model';

async function initDb() {
    try {
        await mongoose.connect('mongodb://mongodb:27017/webrtc');
        
        // Créer les utilisateurs de test
        const testUsers = [
            {
                username: 'usertest1',
                password: 'P@ssw0rd2024Test1'
            },
            {
                username: 'usertest2',
                password: 'P@ssw0rd2024Test2'
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                await User.create(userData);
                console.log(`User ${userData.username} created`);
            }
        }

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initDb(); 