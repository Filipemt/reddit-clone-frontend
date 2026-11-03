import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { Community } from '../../community/models/community.model';
import { Post } from '../../post/models/post.model';
import { UserProfile } from '../../user/models/user.model';
import { SearchResponse } from '../models/search.model';
import { SearchService } from '../services/search.service';
import { formatRelativeTime } from '../../../shared/utils/relative-time';

@Component({
  selector: 'app-search-page',
  imports: [RouterLink],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);

  readonly query = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly posts = signal<Post[]>([]);
  readonly communities = signal<Community[]>([]);
  readonly users = signal<UserProfile[]>([]);

  readonly formatRelativeTime = formatRelativeTime;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => (params.get('q') ?? '').trim()),
        distinctUntilChanged(),
        tap((q) => {
          this.query.set(q);
          this.error.set(null);
        }),
        switchMap((q): Observable<SearchResponse | null> => {
          if (!q) {
            this.posts.set([]);
            this.communities.set([]);
            this.users.set([]);
            this.loading.set(false);
            return of(null);
          }

          this.loading.set(true);
          return this.searchService.search(q);
        }),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            return;
          }
          this.posts.set(result.posts.content);
          this.communities.set(result.communities.content);
          this.users.set(result.users.content);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Não foi possível realizar a busca.');
          this.loading.set(false);
        },
      });
  }
}
