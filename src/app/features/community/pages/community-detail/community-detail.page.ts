import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';

import { formatCompactCount } from '../../../../shared';
import { Community } from '../../models/community.model';
import { topicLabel } from '../../models/community-references';
import { CommunityService } from '../../services/community.service';
import { communityHttpError } from '../../utils/community-http-error';

@Component({
  selector: 'app-community-detail-page',
  imports: [RouterLink],
  templateUrl: './community-detail.page.html',
  styleUrl: './community-detail.page.scss',
})
export class CommunityDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly communities = inject(CommunityService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly community = signal<Community | null>(null);

  readonly formatCompactCount = formatCompactCount;
  readonly topicLabel = topicLabel;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.community.set(null);
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
        if (community) {
          this.community.set(community);
          this.loading.set(false);
        }
      });
  }
}
