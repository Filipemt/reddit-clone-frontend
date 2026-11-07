import { Component, input, output } from '@angular/core';

import { VoteValue } from '../../../vote/models/vote.model';
import { FeedPost } from '../../models/post.model';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-post-feed',
  imports: [PostCard],
  templateUrl: './post-feed.html',
  styleUrl: './post-feed.scss',
})
export class PostFeed {
  readonly posts = input.required<FeedPost[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input('Nenhum post por enquanto.');
  readonly loadingMessage = input('Carregando posts…');

  readonly vote = output<{ post: FeedPost; value: VoteValue }>();
}
