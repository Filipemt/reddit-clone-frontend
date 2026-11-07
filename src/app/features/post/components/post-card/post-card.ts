import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatCompactCount, formatRelativeTime, UiAvatar } from '../../../../shared';
import { VoteValue } from '../../../vote/models/vote.model';
import { FeedPost } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, UiAvatar],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  readonly post = input.required<FeedPost>();
  readonly vote = output<{ post: FeedPost; value: VoteValue }>();

  readonly formatRelativeTime = formatRelativeTime;
  readonly formatCompactCount = formatCompactCount;

  protected onVote(value: VoteValue): void {
    this.vote.emit({ post: this.post(), value });
  }
}
