import { Timestamp } from 'firebase/firestore';

export interface Savings {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsWithId extends Savings {
  id: string;
}

export interface SavingsInvitation {
  savingsId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsInvitationWithId extends SavingsInvitation {
  id: string;
} 