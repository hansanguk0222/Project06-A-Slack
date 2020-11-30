interface Emoji {
  name: string;
  userId: number;
}

export interface Thread {
  id: number;
  userId: number;
  channelId: number;
  parentId: number | null;
  content: string;
  url: string;
  isEdited: number;
  isPinned: number;
  createdAt: string;
  emoji: Emoji[] | null;
  subCount: number;
  subThreadUserId1: number | null;
  subThreadUserId2: number | null;
  subThreadUserId3: number | null;
}
