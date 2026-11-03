import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';

import { FeedPost, Post } from '../../post/models/post.model';
import { UserProfile } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthorLookupService {
  private readonly users = inject(UserService);
  private readonly cache = new Map<string, string | null>();

  resolveUsername(userId: string): Observable<string | null> {
    if (this.cache.has(userId)) {
      return of(this.cache.get(userId) ?? null);
    }

    return this.users.getById(userId).pipe(
      map((user: UserProfile) => user.username),
      tap((username) => this.cache.set(userId, username)),
      catchError(() => {
        this.cache.set(userId, null);
        return of(null);
      }),
    );
  }

  resolveUsernames(userIds: string[]): Observable<Map<string, string | null>> {
    const unique = [...new Set(userIds.filter(Boolean))];
    if (unique.length === 0) {
      return of(new Map());
    }

    return forkJoin(
      unique.map((userId) =>
        this.resolveUsername(userId).pipe(map((username) => [userId, username] as const)),
      ),
    ).pipe(map((entries) => new Map(entries)));
  }

  enrichFeedPosts<T extends Post>(
    posts: T[],
    mapPost: (post: T, authorUsername: string | null) => FeedPost,
  ): Observable<FeedPost[]> {
    return this.resolveUsernames(posts.map((post) => post.authorId)).pipe(
      map((usernames) =>
        posts.map((post) => mapPost(post, usernames.get(post.authorId) ?? null)),
      ),
    );
  }
}
