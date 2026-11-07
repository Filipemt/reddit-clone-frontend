import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PageHeader } from '../../../../shared';
import { CommunityRow } from '../../components/community-row/community-row';
import { Community } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { communityHttpError } from '../../utils/community-http-error';

export type CommunityListTab = 'discover' | 'joined';

@Component({
  selector: 'app-community-list-page',
  imports: [RouterLink, CommunityRow, PageHeader],
  templateUrl: './community-list.page.html',
  styleUrl: './community-list.page.scss',
})
export class CommunityListPage implements OnInit {
  private readonly communities = inject(CommunityService);

  readonly tab = signal<CommunityListTab>('discover');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly busyId = signal<string | null>(null);

  readonly discover = signal<Community[]>([]);
  readonly joined = signal<Community[]>([]);

  readonly visibleCommunities = computed(() =>
    this.tab() === 'discover' ? this.discover() : this.joined(),
  );

  readonly title = computed(() =>
    this.tab() === 'discover' ? 'Communities' : 'My communities',
  );

  readonly subtitle = computed(() =>
    this.tab() === 'discover'
      ? 'Explore e entre em comunidades'
      : 'Comunidades que você segue',
  );

  ngOnInit(): void {
    this.loadTab('discover');
  }

  selectTab(next: CommunityListTab): void {
    if (this.tab() === next) {
      return;
    }
    this.tab.set(next);
    this.actionError.set(null);
    this.loadTab(next);
  }

  onJoin(community: Community): void {
    if (this.busyId()) {
      return;
    }

    this.actionError.set(null);
    this.busyId.set(community.communityId);

    this.communities
      .join(community.communityId)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.patchMembership(community.communityId, true);
        },
        error: (err: unknown) => {
          this.actionError.set(
            communityHttpError(err, 'Não foi possível entrar na comunidade.'),
          );
        },
      });
  }

  onLeave(community: Community): void {
    if (this.busyId()) {
      return;
    }

    this.actionError.set(null);
    this.busyId.set(community.communityId);

    this.communities
      .leave(community.communityId)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.patchMembership(community.communityId, false);
        },
        error: (err: unknown) => {
          this.actionError.set(
            communityHttpError(err, 'Não foi possível sair da comunidade.'),
          );
        },
      });
  }

  private loadTab(tab: CommunityListTab): void {
    this.loading.set(true);
    this.error.set(null);

    const request =
      tab === 'discover' ? this.communities.list(0, 50) : this.communities.listJoined(0, 50);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (page) => {
        if (tab === 'discover') {
          this.discover.set(page.content);
        } else {
          this.joined.set(page.content);
        }
      },
      error: (err: unknown) => {
        this.error.set(communityHttpError(err, 'Não foi possível carregar as comunidades.'));
      },
    });
  }

  private patchMembership(communityId: string, isMember: boolean): void {
    this.discover.update((list) =>
      list.map((item) => {
        if (item.communityId !== communityId) {
          return item;
        }
        const delta = isMember ? 1 : -1;
        return {
          ...item,
          isMember,
          memberCount: Math.max(0, item.memberCount + delta),
        };
      }),
    );

    if (isMember) {
      const fromDiscover = this.discover().find((item) => item.communityId === communityId);
      if (fromDiscover) {
        this.joined.update((list) => {
          if (list.some((item) => item.communityId === communityId)) {
            return list.map((item) =>
              item.communityId === communityId ? { ...item, isMember: true } : item,
            );
          }
          return [{ ...fromDiscover, isMember: true }, ...list];
        });
      }
      return;
    }

    this.joined.update((list) => list.filter((item) => item.communityId !== communityId));
  }
}
