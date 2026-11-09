import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { PageHeader, UiConfirmDialog } from '../../../../shared';
import { ProfileHeader } from '../../components/profile-header/profile-header';
import { ProfilePostsEmpty } from '../../components/profile-posts-empty/profile-posts-empty';
import { UserProfile } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { userHttpError } from '../../utils/user-http-error';

@Component({
  selector: 'app-profile-page',
  imports: [PageHeader, ProfileHeader, ProfilePostsEmpty, UiConfirmDialog],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly deleting = signal(false);
  readonly confirmOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly viewedUserId = signal<string | null>(null);

  readonly isOwnProfile = computed(() => {
    const viewed = this.viewedUserId();
    const current = this.auth.currentUserId();
    return !!viewed && !!current && viewed === current;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.actionError.set(null);
          this.confirmOpen.set(false);
          this.profile.set(null);
        }),
        switchMap((params) => {
          const fromRoute = params.get('userId');
          const userId = fromRoute || this.auth.currentUserId();

          if (!userId) {
            this.error.set('Não foi possível identificar o usuário.');
            this.loading.set(false);
            this.viewedUserId.set(null);
            return of(null);
          }

          this.viewedUserId.set(userId);

          return this.users.getById(userId).pipe(
            catchError((err: unknown) => {
              this.error.set(userHttpError(err, 'Não foi possível carregar o perfil.'));
              this.loading.set(false);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((profile) => {
        if (!profile) {
          return;
        }
        this.profile.set(profile);
        this.loading.set(false);
      });
  }

  onLogout(): void {
    this.auth.clearSession();
    void this.router.navigateByUrl('/auth/login');
  }

  onDeleteRequest(): void {
    this.actionError.set(null);
    this.confirmOpen.set(true);
  }

  onDeleteCancel(): void {
    if (this.deleting()) {
      return;
    }
    this.confirmOpen.set(false);
  }

  onDeleteConfirm(): void {
    if (this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.actionError.set(null);

    this.users
      .deleteMe()
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.confirmOpen.set(false);
          this.auth.clearSession();
          void this.router.navigateByUrl('/auth/login');
        },
        error: (err: unknown) => {
          this.actionError.set(userHttpError(err, 'Não foi possível excluir a conta.'));
          this.confirmOpen.set(false);
        },
      });
  }
}
