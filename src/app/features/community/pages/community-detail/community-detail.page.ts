import { Component, DestroyRef, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { formatCompactCount, formatRelativeTime } from '../../../../shared';
import { FeedPost } from '../../../post/models/post.model';
import { PostService } from '../../../post/services/post.service';
import { AuthorLookupService } from '../../../user/services/author-lookup.service';
import { VoteValue } from '../../../vote/models/vote.model';
import { VoteService } from '../../../vote/services/vote.service';
import { CommunityHeader } from '../../components/community-header/community-header';
import { PostSort, PostSortTabs } from '../../components/post-sort-tabs/post-sort-tabs';
import { Community } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { communityHttpError } from '../../utils/community-http-error';

@Component({
  selector: 'app-community-detail-page',
  imports: [ReactiveFormsModule, RouterLink, CommunityHeader, PostSortTabs],
  templateUrl: './community-detail.page.html',
  styleUrl: './community-detail.page.scss',
})
export class CommunityDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly communities = inject(CommunityService);
  private readonly postsApi = inject(PostService);
  private readonly authors = inject(AuthorLookupService);
  private readonly voteService = inject(VoteService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly composerSection = viewChild<ElementRef<HTMLElement>>('composerSection');

  readonly loading = signal(true);
  readonly postsLoading = signal(false);
  readonly membershipBusy = signal(false);
  readonly posting = signal(false);
  readonly composerOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly postsError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly community = signal<Community | null>(null);
  readonly posts = signal<FeedPost[]>([]);
  readonly sort = signal<PostSort>('new');
  readonly mediaFile = signal<File | null>(null);

  readonly composer = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(300)]],
    body: ['', Validators.maxLength(40000)],
  });

  readonly formatRelativeTime = formatRelativeTime;
  readonly formatCompactCount = formatCompactCount;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.actionError.set(null);
          this.postsError.set(null);
          this.community.set(null);
          this.posts.set([]);
          this.sort.set('new');
          this.composerOpen.set(false);
          this.composer.reset({ title: '', body: '' });
          this.mediaFile.set(null);
        }),
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          return this.communities.getBySlug(slug).pipe(
            catchError((err: unknown) => {
              this.error.set(
                communityHttpError(err, 'Não foi possível carregar a comunidade.'),
              );
              this.loading.set(false);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((community) => {
        if (!community) {
          return;
        }
        this.community.set(community);
        this.loading.set(false);
        this.loadPosts(community.communityId, this.sort());
      });
  }

  onSortChange(next: PostSort): void {
    if (this.sort() === next) {
      return;
    }
    this.sort.set(next);
    const community = this.community();
    if (community) {
      this.loadPosts(community.communityId, next);
    }
  }

  onJoin(): void {
    const community = this.community();
    if (!community || this.membershipBusy()) {
      return;
    }

    this.actionError.set(null);
    this.membershipBusy.set(true);

    this.communities
      .join(community.communityId)
      .pipe(finalize(() => this.membershipBusy.set(false)))
      .subscribe({
        next: () => {
          this.community.update((current) =>
            current
              ? {
                  ...current,
                  isMember: true,
                  memberCount: current.memberCount + 1,
                }
              : current,
          );
        },
        error: (err: unknown) => {
          this.actionError.set(
            communityHttpError(err, 'Não foi possível entrar na comunidade.'),
          );
        },
      });
  }

  onLeave(): void {
    const community = this.community();
    if (!community || this.membershipBusy()) {
      return;
    }

    this.actionError.set(null);
    this.membershipBusy.set(true);

    this.communities
      .leave(community.communityId)
      .pipe(finalize(() => this.membershipBusy.set(false)))
      .subscribe({
        next: () => {
          this.community.update((current) =>
            current
              ? {
                  ...current,
                  isMember: false,
                  memberCount: Math.max(0, current.memberCount - 1),
                }
              : current,
          );
          this.composerOpen.set(false);
        },
        error: (err: unknown) => {
          this.actionError.set(
            communityHttpError(err, 'Não foi possível sair da comunidade.'),
          );
        },
      });
  }

  openComposer(): void {
    if (!this.community()?.isMember) {
      return;
    }
    this.composerOpen.set(true);
    setTimeout(() => {
      this.composerSection()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const community = this.community();
    if (!community?.isMember || this.composer.invalid || this.posting()) {
      this.composer.markAllAsTouched();
      return;
    }

    const { title, body } = this.composer.getRawValue();
    this.posting.set(true);
    this.actionError.set(null);

    this.postsApi
      .create(community.communityId, { title, body: body || null }, this.mediaFile())
      .pipe(finalize(() => this.posting.set(false)))
      .subscribe({
        next: (created) => {
          this.authors.resolveUsername(created.authorId).subscribe((authorUsername) => {
            const feedPost: FeedPost = {
              ...created,
              communitySlug: community.slug,
              communityName: community.name,
              authorUsername,
              myVote: 0,
            };
            this.posts.update((list) => [feedPost, ...list]);
            this.composer.reset({ title: '', body: '' });
            this.mediaFile.set(null);
            this.sort.set('new');
          });
        },
        error: (err: unknown) => {
          this.actionError.set(communityHttpError(err, 'Não foi possível publicar o post.'));
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

  private loadPosts(communityId: string, sort: PostSort): void {
    this.postsLoading.set(true);
    this.postsError.set(null);

    this.postsApi
      .listByCommunity(communityId, {
        sort,
        period: sort === 'top' ? 'all' : undefined,
        page: 0,
        size: 20,
      })
      .pipe(
        switchMap((page) => {
          const community = this.community();
          return this.authors.enrichFeedPosts(page.content, (post, authorUsername) => ({
            ...post,
            communitySlug: community?.slug ?? null,
            communityName: community?.name ?? null,
            authorUsername,
            myVote: 0 as const,
          }));
        }),
        finalize(() => this.postsLoading.set(false)),
      )
      .subscribe({
        next: (feedPosts) => {
          this.posts.set(feedPosts);
        },
        error: (err: unknown) => {
          this.postsError.set(communityHttpError(err, 'Não foi possível carregar os posts.'));
          this.posts.set([]);
        },
      });
  }
}
