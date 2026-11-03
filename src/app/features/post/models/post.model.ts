import { MediaRef } from '../../../shared/models/media.model';

export interface Post {
  postId: string;
  communityId: string;
  authorId: string;
  title: string;
  body: string | null;
  media: MediaRef | null;
  score: number;
  upCount: number;
  downCount: number;
  commentCount: number;
  hotScore: number;
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  body?: string | null;
}

export interface FeedPost extends Post {
  communitySlug: string | null;
  communityName: string | null;
  authorUsername: string | null;
  myVote: -1 | 0 | 1;
}
