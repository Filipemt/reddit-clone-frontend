import { Component, input, output } from '@angular/core';

import { UiAvatar, formatCompactCount } from '../../../../shared';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-profile-header',
  imports: [UiAvatar],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.scss',
})
export class ProfileHeader {
  readonly profile = input.required<UserProfile>();
  readonly isOwnProfile = input(false);
  readonly busy = input(false);

  readonly logout = output<void>();
  readonly deleteAccount = output<void>();

  readonly formatCompactCount = formatCompactCount;
}
