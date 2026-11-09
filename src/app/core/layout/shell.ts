import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Community } from '../../features/community/models/community.model';
import { CommunityService } from '../../features/community/services/community.service';
import { UserProfile } from '../../features/user/models/user.model';
import { UserService } from '../../features/user/services/user.service';
import { formatCompactCount } from '../../shared/utils/format-count';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly communityService = inject(CommunityService);
  private readonly fb = inject(FormBuilder);

  readonly currentUser = signal<UserProfile | null>(null);
  readonly suggestedCommunities = signal<Community[]>([]);
  readonly searchForm = this.fb.nonNullable.group({
    q: [''],
  });

  readonly formatCompactCount = formatCompactCount;

  ngOnInit(): void {
    const userId = this.auth.currentUserId();
    if (userId) {
      this.userService.getById(userId).subscribe({
        next: (user) => this.currentUser.set(user),
      });
    }

    this.communityService.list(0, 5).subscribe({
      next: (page) => this.suggestedCommunities.set(page.content),
    });
  }

  submitSearch(): void {
    const q = this.searchForm.controls.q.value.trim();
    if (!q) {
      return;
    }

    void this.router.navigate(['/search'], { queryParams: { q } });
  }
}
