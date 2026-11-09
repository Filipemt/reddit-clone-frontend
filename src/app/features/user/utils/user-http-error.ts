import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../../../shared/models/api-error.model';

export function userHttpError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const apiMessage = (error.error as ApiError | null)?.message;

  switch (error.status) {
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Usuário não encontrado.';
    case 429:
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    case 0:
      return 'Não foi possível conectar à API.';
    default:
      if (error.status >= 500) {
        return 'O servidor encontrou um problema. Tente novamente em instantes.';
      }
      return apiMessage || fallback;
  }
}
