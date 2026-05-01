export type CommentAuthor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type OrderComment = {
  id: string;
  orderId: string;
  authorId: string;
  organizationId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
};

export type CreateCommentInput = {
  body: string;
};