import { MediaRef } from '../../../shared/models/media.model';

export interface Community {
  communityId: string;
  name: string;
  slug: string;
  description: string;
  topicId: number | null;
  topicName: string | null;
  typeId: number | null;
  typeName: string | null;
  icon: MediaRef | null;
  banner: MediaRef | null;
  memberCount: number;
  isMember: boolean;
  createdAt: string;
}

export interface CreateCommunityRequest {
  name: string;
  slug: string;
  description: string;
  topicId: number;
  typeId: number;
  statusId: number;
}
