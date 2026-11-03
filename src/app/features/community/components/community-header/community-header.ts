import { Component, input, output } from '@angular/core';

import { formatCompactCount } from '../../../../shared';
import { Community } from '../../models/community.model';

@Component({
  selector: 'app-community-header',
  templateUrl: './community-header.html',
  styleUrl: './community-header.scss',
})
export class CommunityHeader {
  readonly community = input.required<Community>();
  readonly busy = input(false);

  readonly join = output<void>();
  readonly leave = output<void>();
  readonly newPost = output<void>();

  readonly formatCompactCount = formatCompactCount;

  protected onMembershipClick(): void {
    if (this.community().isMember) {
      this.leave.emit();
      return;
    }
    this.join.emit();
  }
}
