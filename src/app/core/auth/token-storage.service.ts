import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = 'rc.accessToken';
const REFRESH_TOKEN_KEY = 'rc.refreshToken';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessToken = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  private readonly refreshToken = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));

  readonly accessTokenValue = this.accessToken.asReadonly();

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        this.accessToken.set(localStorage.getItem(ACCESS_TOKEN_KEY));
      }

      if (event.key === REFRESH_TOKEN_KEY || event.key === null) {
        this.refreshToken.set(localStorage.getItem(REFRESH_TOKEN_KEY));
      }
    });
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.accessToken.set(accessToken);
    this.refreshToken.set(refreshToken);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
    this.refreshToken.set(null);
  }
}
