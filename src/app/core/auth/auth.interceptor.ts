import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from './token-storage.service';

const PUBLIC_AUTH_PATHS = [
  '/authentication/login',
  '/authentication/refresh',
  '/users/register',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  const token = inject(TokenStorageService).getAccessToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
