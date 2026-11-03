import { Community } from '../../community/models/community.model';
import { Post } from '../../post/models/post.model';
import { UserProfile } from '../../user/models/user.model';
import { PagedResponse } from '../../../shared/models/paged-response.model';

export interface SearchResponse {
  posts: PagedResponse<Post>;
  communities: PagedResponse<Community>;
  users: PagedResponse<UserProfile>;
}
