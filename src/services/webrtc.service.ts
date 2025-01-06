import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { tokenService } from './token.service';
import { User } from '../models/user.model';

interface ConnectedUser {
    userId: string;
    username: string;
    socketId: string;
}

export class WebRTCService {
    private io: SocketServer;
    private connectedUsers: Map<string, ConnectedUser> = new Map(); // socketId -> user

    constructor(server: Server) {
        this.io = new SocketServer(server, {
            cors: {
                origin: "*", // En production, pour des raisons de sécurité : Changer origin: "*" en l’URL de ton frontend : origin: "https://mon-extension-chrome.com".
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"]
            }
        });

        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) return next(new Error('Authentication error'));

                const payload = tokenService.verifyAccessToken(token);
                const user = await User.findById(payload.userId);
                if (!user) return next(new Error('User not found'));

                socket.data.user = {
                    userId: user._id.toString(),
                    username: user.username
                };
                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });

        this.setupSocketHandlers();
    }

    private getOtherUsers(currentUserId: string): Array<{ id: string; username: string }> {
        console.log('Getting users for', currentUserId); // Debug
        console.log('Connected users:', Array.from(this.connectedUsers.values())); // Debug
        return Array.from(this.connectedUsers.values())
            .filter(u => u.userId !== currentUserId)
            .map(u => ({ 
                id: u.userId, 
                username: u.username 
            }));
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket) => {
            const { userId, username } = socket.data.user;
            console.log(`User connected: ${username} (${userId})`); // Debug
            
            // Stocker l'utilisateur connecté
            this.connectedUsers.set(socket.id, { userId, username, socketId: socket.id });

            // Envoyer la liste mise à jour à tous
            this.broadcastUsersList();

            // Gestion des appels
            socket.on('callUser', ({ targetUserId, signalData }) => {
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.userId === targetUserId);
                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('incomingCall', {
                        from: userId,
                        username,
                        signalData
                    });
                }
            });

            // Gestion des réponses
            socket.on('answerCall', ({ targetUserId, signalData }) => {
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.userId === targetUserId);
                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('callAnswered', {
                        from: userId,
                        signalData
                    });
                }
            });

            // Gestion des candidats ICE
            socket.on('iceCandidate', ({ targetUserId, candidate }) => {
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.userId === targetUserId);
                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('iceCandidate', {
                        from: userId,
                        candidate
                    });
                }
            });

            // Gestion du rejet d'appel
            socket.on('rejectCall', ({ targetUserId }) => {
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.userId === targetUserId);
                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('callRejected', { 
                        from: userId 
                    });
                }
            });

            // Gestion de la fin d'appel
            socket.on('endCall', ({ targetUserId }) => {
                const targetUser = Array.from(this.connectedUsers.values())
                    .find(u => u.userId === targetUserId);
                if (targetUser) {
                    this.io.to(targetUser.socketId).emit('callEnded', { 
                        from: userId 
                    });
                }
            });

            // Gestion de la déconnexion
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${username} (${userId})`); // Debug
                this.connectedUsers.delete(socket.id);
                this.broadcastUsersList();
                socket.broadcast.emit('userDisconnected', { userId });
            });
        });
    }

    private broadcastUsersList(): void {
        console.log('Broadcasting users list'); // Debug
        const allUsers = Array.from(this.connectedUsers.values()).map(u => ({
            id: u.userId,
            username: u.username
        }));
        
        // Émettre la liste complète à tous les utilisateurs
        this.io.emit('users', allUsers);
    }
} 