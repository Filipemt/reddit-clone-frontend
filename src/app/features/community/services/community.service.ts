import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PagedResponse } from '../../../shared/models/paged-response.model';
import { Community } from '../models/community.model';

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
}
