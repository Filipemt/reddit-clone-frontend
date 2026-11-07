import { Component, OnInit, inject, signal, viewChild } from '@angular/core';

import { PageHeader } from '../../../shared';
import { Community } from '../../community/models/community.model';
import {
  PostComposer,
  PostComposerSubmit,
} from '../../post/components/post-composer/post-composer';
import { PostFeed } from '../../post/components/post-feed/post-feed';
import { FeedPost } from '../../post/models/post.model';
import { PostService } from '../../post/services/post.service';
import { AuthorLookupService } from '../../user/services/author-lookup.service';
import { VoteValue } from '../../vote/models/vote.model';
import { VoteService } from '../../vote/services/vote.service';
import { HomeFeedService } from '../services/home-feed.service';

@Component({
  selector: 'app-home-page',
  imports: [PageHeader, PostComposer, PostFeed],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly feedService = inject(HomeFeedService);
  private readonly postService = inject(PostService);
  private readonly authors = inject(AuthorLookupService);
  private readonly voteService = inject(VoteService);

  private readonly composer = viewChild.required(PostComposer);

  readonly loading = signal(true);
  readonly posting = signal(false);
  readonly error = signal<string | null>(null);
  readonly posts = signal<FeedPost[]>([]);
  readonly joinedCommunities = signal<Community[]>([]);

  ngOnInit(): void {
    this.reloadFeed();
  }

  reloadFeed(): void {
    this.loading.set(true);
    this.error.set(null);

    this.feedService.loadFeed().subscribe({
      next: ({ posts, joined }) => {
        this.posts.set(posts);
        this.joinedCommunities.set(joined);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o feed.');
        this.loading.set(false);
      },
    });
  }

  onComposerSubmit(payload: PostComposerSubmit): void {
    if (this.posting()) {
      return;
    }

    this.posting.set(true);
    this.error.set(null);

    this.postService
      .create(payload.communityId, { title: payload.title, body: payload.body || null }, payload.media)
      .subscribe({
        next: (created) => {
          const community = this.joinedCommunities().find(
            (c) => c.communityId === payload.communityId,
          );
          this.authors.resolveUsername(created.authorId).subscribe((authorUsername) => {
            const feedPost: FeedPost = {
              ...created,
              communitySlug: community?.slug ?? null,
              communityName: community?.name ?? null,
              authorUsername,
              myVote: 0,
            };
            this.posts.update((list) => [feedPost, ...list]);
            this.composer().resetForm();
            this.posting.set(false);
          });
        },
        error: () => {
          this.error.set('Não foi possível publicar o post.');
          this.posting.set(false);
        },
      });
  }

  onVote(event: { post: FeedPost; value: VoteValue }): void {
    const value: VoteValue = event.post.myVote === event.value ? 0 : event.value;

    this.voteService.votePost(event.post.postId, value).subscribe({
      next: (res) => {
        this.posts.update((list) =>
          list.map((item) =>
            item.postId === event.post.postId
              ? { ...item, score: res.score, myVote: value }
              : item,
          ),
        );
      },
    });
  }
}
