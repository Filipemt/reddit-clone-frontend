import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { readUserIdFromAccessToken } from './jwt.util';
import { LoginRequest, RegisterRequest, TokenData } from './models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly isAuthenticated = computed(() => !!this.tokenStorage.accessTokenValue());
  readonly currentUserId = computed(() =>
    readUserIdFromAccessToken(this.tokenStorage.accessTokenValue()),
  );

  login(credentials: LoginRequest): Observable<TokenData> {
    return this.http
      .post<TokenData>(`${environment.apiUrl}/authentication/login`, credentials)
      .pipe(tap((tokens) => this.markAuthenticated(tokens.accessToken, tokens.refreshToken)));
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/users/register`, payload);
  }

  registerAndLogin(payload: RegisterRequest): Observable<TokenData> {
    return this.register(payload).pipe(
      switchMap(() =>
        this.login({
          username: payload.username,
          password: payload.password,
        }),
      ),
    );
  }

  markAuthenticated(accessToken: string, refreshToken: string): void {
    this.tokenStorage.setTokens(accessToken, refreshToken);
  }

  clearSession(): void {
    this.tokenStorage.clear();
  }
}
