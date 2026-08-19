export interface CommentItem {
  id: string;
  blogId: string;
  userId: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  parentCommentId?: string;
  comment: string;
  status: 'pending' | 'approved' | 'hidden' | 'deleted';
  createdAt: string;
}
