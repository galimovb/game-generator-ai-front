export interface Ticket {
  id: number;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  author: User;
  assignedTo: User | null;
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
}

export interface TicketMessage {
  id: number;
  text: string | null;
  photos: string[] | null;
  messageType: string;
  owner: User;
  createdAt: string;
  updatedAt: string | null;
}
