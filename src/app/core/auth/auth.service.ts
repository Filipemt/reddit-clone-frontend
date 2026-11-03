import { Injectable, computed, inject, signal } from '@angular/core';

import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authenticated = signal(!!this.tokenStorage.getAccessToken());

  readonly isAuthenticated = computed(() => this.authenticated());

  markAuthenticated(accessToken: string, refreshToken: string): void {
    this.tokenStorage.setTokens(accessToken, refreshToken);
    this.authenticated.set(true);
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.authenticated.set(false);
  }
}
