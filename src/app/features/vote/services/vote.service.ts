import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { VoteRequest, VoteResponse, VoteValue } from '../models/vote.model';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly http = inject(HttpClient);

  votePost(postId: string, value: VoteValue): Observable<VoteResponse> {
    const body: VoteRequest = { value };
    return this.http.put<VoteResponse>(`${environment.apiUrl}/posts/${postId}/vote`, body);
  }

  voteComment(commentId: string, value: VoteValue): Observable<VoteResponse> {
    const body: VoteRequest = { value };
    return this.http.put<VoteResponse>(`${environment.apiUrl}/comments/${commentId}/vote`, body);
  }
}