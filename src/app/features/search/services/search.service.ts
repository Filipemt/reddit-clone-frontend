import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SearchResponse } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);

  search(q: string, page = 0, size = 20): Observable<SearchResponse> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<SearchResponse>(`${environment.apiUrl}/search`, { params });
  }
}
