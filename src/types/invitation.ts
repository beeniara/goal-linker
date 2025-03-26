
import { Timestamp } from 'firebase/firestore';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface SavingsInvitation {
  id?: string;
  savingsId: string;
  savingsTitle: string;
  inviterId: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeId?: string;
  status: InvitationStatus;
  createdAt: Timestamp | Date | any;
}

export interface InvitationResponse {
  success: boolean;
  invitationId?: string;
  savingsId?: string;
  message?: string;
  warning?: string;
  code?: string;
  error?: any;
}
