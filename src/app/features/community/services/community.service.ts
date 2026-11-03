import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PagedResponse } from '../../../shared/models/paged-response.model';
import { Community, CreateCommunityRequest } from '../models/community.model';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/communities`;

  list(page = 0, size = 20): Observable<PagedResponse<Community>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Community>>(this.baseUrl, { params });
  }

  listJoined(page = 0, size = 20): Observable<PagedResponse<Community>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Community>>(`${this.baseUrl}/me`, { params });
  }

  getBySlug(slug: string): Observable<Community> {
    return this.http.get<Community>(`${this.baseUrl}/slug/${slug}`);
  }

  create(
    data: CreateCommunityRequest,
    files: { icon?: File | null; banner?: File | null } = {},
  ): Observable<Community> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(data)], {
        type: 'application/json',
      }),
    );

    if (files.icon) {
      formData.append('icon', files.icon);
    }

    if (files.banner) {
      formData.append('banner', files.banner);
    }

    return this.http.post<Community>(this.baseUrl, formData);
  }

  join(communityId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${communityId}/membership`, null);
  }

  leave(communityId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${communityId}/membership`);
  }
}
