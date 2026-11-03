import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PagedResponse } from '../../../shared/models/paged-response.model';
import { CreatePostRequest, Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);

  listByCommunity(
    communityId: string,
    options: { sort?: 'new' | 'hot' | 'top'; page?: number; size?: number } = {},
  ): Observable<PagedResponse<Post>> {
    const params = new HttpParams()
      .set('sort', options.sort ?? 'new')
      .set('page', options.page ?? 0)
      .set('size', options.size ?? 20);

    return this.http.get<PagedResponse<Post>>(
      `${environment.apiUrl}/communities/${communityId}/posts`,
      { params },
    );
  }

  create(communityId: string, data: CreatePostRequest, media?: File | null): Observable<Post> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify({ title: data.title, body: data.body ?? null })], {
        type: 'application/json',
      }),
    );

    if (media) {
      formData.append('media', media);
    }

    return this.http.post<Post>(
      `${environment.apiUrl}/communities/${communityId}/posts`,
      formData,
    );
  }
}
