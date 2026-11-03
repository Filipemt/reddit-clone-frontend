import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatCompactCount } from '../../../../shared';
import { Community } from '../../models/community.model';
import { topicLabel } from '../../models/community-references';

export type CommunityRowMode = 'discover' | 'joined';

@Component({
  selector: 'app-community-row',
  imports: [RouterLink],
  templateUrl: './community-row.html',
  styleUrl: './community-row.scss',
})
export class CommunityRow {
  readonly community = input.required<Community>();
  readonly mode = input<CommunityRowMode>('discover');
  readonly busy = input(false);

  readonly join = output<Community>();
  readonly leave = output<Community>();

  readonly formatCompactCount = formatCompactCount;
  readonly topicLabel = topicLabel;

  protected metaLine(): string {
    const item = this.community();
    if (this.mode() === 'joined') {
      return `r/${item.slug} · Joined`;
    }

    const parts = [`r/${item.slug}`];
    const topic = this.topicLabel(item.topicName);
    if (topic) {
      parts.push(topic);
    }
    parts.push(`${this.formatCompactCount(item.memberCount)} members`);
    return parts.join(' · ');
  }

  protected showJoin(): boolean {
    return this.mode() === 'discover' && !this.community().isMember;
  }

  protected onJoin(): void {
    this.join.emit(this.community());
  }

  protected onLeave(): void {
    this.leave.emit(this.community());
  }
}
