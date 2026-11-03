import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Community } from '../../community/models/community.model';
import { FeedPost } from '../../post/models/post.model';
import { PostService } from '../../post/services/post.service';
import { VoteService } from '../../vote/services/vote.service';
import { VoteValue } from '../../vote/models/vote.model';
import { formatCompactCount } from '../../../shared/utils/format-count';
import { formatRelativeTime } from '../../../shared/utils/relative-time';
import { HomeFeedService } from '../services/home-feed.service';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly feedService = inject(HomeFeedService);
  private readonly postService = inject(PostService);
  private readonly voteService = inject(VoteService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly posting = signal(false);
  readonly error = signal<string | null>(null);
  readonly posts = signal<FeedPost[]>([]);
  readonly joinedCommunities = signal<Community[]>([]);
  readonly mediaFile = signal<File | null>(null);

  readonly composer = this.fb.nonNullable.group({
    communityId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(300)]],
    body: ['', Validators.maxLength(40000)],
  });

  readonly formatRelativeTime = formatRelativeTime;
  readonly formatCompactCount = formatCompactCount;

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
        if (joined.length > 0 && !this.composer.controls.communityId.value) {
          this.composer.controls.communityId.setValue(joined[0].communityId);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o feed.');
        this.loading.set(false);
      },
    });
  }

  onMediaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mediaFile.set(input.files?.[0] ?? null);
  }

  clearMedia(input: HTMLInputElement): void {
    this.mediaFile.set(null);
    input.value = '';
  }

  submitPost(): void {
    if (this.composer.invalid || this.posting()) {
      this.composer.markAllAsTouched();
      return;
    }

    const { communityId, title, body } = this.composer.getRawValue();
    this.posting.set(true);

    this.postService.create(communityId, { title, body: body || null }, this.mediaFile()).subscribe({
      next: (created) => {
        const community = this.joinedCommunities().find((c) => c.communityId === communityId);
        const feedPost: FeedPost = {
          ...created,
          communitySlug: community?.slug ?? null,
          communityName: community?.name ?? null,
          myVote: 0,
        };
        this.posts.update((list) => [feedPost, ...list]);
        this.composer.patchValue({ title: '', body: '' });
        this.mediaFile.set(null);
        this.posting.set(false);
      },
      error: () => {
        this.error.set('Não foi possível publicar o post.');
        this.posting.set(false);
      },
    });
  }

  vote(post: FeedPost, next: VoteValue): void {
    const value: VoteValue = post.myVote === next ? 0 : next;

    this.voteService.votePost(post.postId, value).subscribe({
      next: (res) => {
        this.posts.update((list) =>
          list.map((item) =>
            item.postId === post.postId
              ? { ...item, score: res.score, myVote: value }
              : item,
          ),
        );
      },
    });
  }
}
