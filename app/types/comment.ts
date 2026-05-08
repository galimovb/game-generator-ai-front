export interface GameComment {
  id: number;
  gameId: number;
  author: UserProfile;
  text: string;
  parentId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}
