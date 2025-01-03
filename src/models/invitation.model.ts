import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    code: string;
    isUsed: boolean;
    usedBy?: string;
    usedAt?: Date;
    createdAt: Date;
}

const invitationSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: String,
        ref: 'User'
    },
    usedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Invitation = mongoose.model<IInvitation>('Invitation', invitationSchema); 