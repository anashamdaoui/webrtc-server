const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Stockage des utilisateurs connectés avec leur socket ID
const users = new Map();

io.on("connection", (socket) => {
    const userId = `user-${Date.now()}`;
    users.set(socket.id, { id: userId, socketId: socket.id });

    // Envoyer l'ID à l'utilisateur qui vient de se connecter
    socket.emit("userId", userId);

    // Fonction pour obtenir la liste des autres utilisateurs
    const getOtherUsers = (currentUserId) => {
        return Array.from(users.values())
            .filter(u => u.id !== currentUserId)
            .map(u => ({ id: u.id }));
    };

    // Envoyer la liste mise à jour à tous les utilisateurs
    const broadcastUsersList = () => {
        users.forEach((user) => {
            io.to(user.socketId).emit("usersList", getOtherUsers(user.id));
        });
    };

    // Envoyer la liste initiale et informer les autres
    broadcastUsersList();

    // Gestion des appels
    socket.on("callUser", ({ targetUserId, signalData }) => {
        const targetUser = Array.from(users.values()).find(u => u.id === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("incomingCall", {
                from: userId,
                signalData
            });
        }
    });

    // Gestion des réponses aux appels
    socket.on("answerCall", ({ targetUserId, signalData }) => {
        const targetUser = Array.from(users.values()).find(u => u.id === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("callAnswered", {
                from: userId,
                signalData
            });
        }
    });

    // Gestion des candidats ICE
    socket.on("iceCandidate", ({ targetUserId, candidate }) => {
        const targetUser = Array.from(users.values()).find(u => u.id === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("iceCandidate", {
                from: userId,
                candidate
            });
        }
    });

    // Gestion du rejet d'appel
    socket.on("rejectCall", ({ targetUserId }) => {
        const targetUser = Array.from(users.values()).find(u => u.id === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("callRejected", { from: userId });
        }
    });

    // Gestion de la fin d'appel
    socket.on("endCall", ({ targetUserId }) => {
        const targetUser = Array.from(users.values()).find(u => u.id === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("callEnded", { from: userId });
        }
    });

    // Gestion de la déconnexion
    socket.on("disconnect", () => {
        const disconnectedUser = users.get(socket.id);
        if (disconnectedUser) {
            users.delete(socket.id);
            broadcastUsersList();
            socket.broadcast.emit("userDisconnected", { userId: disconnectedUser.id });
        }
    });

    // Réponse à la demande de mise à jour de la liste
    socket.on("requestUsersList", () => {
        socket.emit("usersList", getOtherUsers(userId));
    });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'
server.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
}); 