import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { Community } from '../../community/models/community.model';
import { CommunityService } from '../../community/services/community.service';
import { FeedPost, Post } from '../../post/models/post.model';
import { PostService } from '../../post/services/post.service';
import { AuthorLookupService } from '../../user/services/author-lookup.service';

@Injectable({ providedIn: 'root' })
export class HomeFeedService {
  private readonly communities = inject(CommunityService);
  private readonly posts = inject(PostService);
  private readonly authors = inject(AuthorLookupService);

  loadFeed(): Observable<{ posts: FeedPost[]; joined: Community[]; discovery: Community[] }> {
    return forkJoin({
      joined: this.communities.listJoined(0, 50),
      discovery: this.communities.list(0, 50),
    }).pipe(
      switchMap(({ joined, discovery }) => {
        const joinedList = joined.content;
        const joinedIds = new Set(joinedList.map((c) => c.communityId));
        const discoveryList = discovery.content.filter((c) => !joinedIds.has(c.communityId));
        const communityById = new Map<string, Community>(
          [...joinedList, ...discovery.content].map((c) => [c.communityId, c]),
        );

        const joinedRequests = joinedList.map((c) =>
          this.posts.listByCommunity(c.communityId, { sort: 'new', size: 20 }),
        );
        const discoveryRequests = discoveryList.map((c) =>
          this.posts.listByCommunity(c.communityId, { sort: 'new', size: 20 }),
        );

        const joinedPosts$ =
          joinedRequests.length > 0
            ? forkJoin(joinedRequests).pipe(map((pages) => pages.flatMap((p) => p.content)))
            : of([] as Post[]);
        const discoveryPosts$ =
          discoveryRequests.length > 0
            ? forkJoin(discoveryRequests).pipe(map((pages) => pages.flatMap((p) => p.content)))
            : of([] as Post[]);

        return forkJoin({ joinedPosts: joinedPosts$, discoveryPosts: discoveryPosts$ }).pipe(
          switchMap(({ joinedPosts, discoveryPosts }) => {
            const seen = new Set<string>();
            const collect = (list: Post[]): Post[] => {
              const result: Post[] = [];
              for (const post of list.slice().sort(byNewest)) {
                if (seen.has(post.postId)) {
                  continue;
                }
                seen.add(post.postId);
                result.push(post);
              }
              return result;
            };

            const ordered = [...collect(joinedPosts), ...collect(discoveryPosts)];

            return this.authors.enrichFeedPosts(ordered, (post, authorUsername) => {
              const community = communityById.get(post.communityId);
              return {
                ...post,
                communitySlug: community?.slug ?? null,
                communityName: community?.name ?? null,
                authorUsername,
                myVote: 0,
              };
            }).pipe(
              map((posts) => ({
                posts,
                joined: joinedList,
                discovery: discovery.content,
              })),
            );
          }),
        );
      }),
    );
  }
}

function byNewest(a: Post, b: Post): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
