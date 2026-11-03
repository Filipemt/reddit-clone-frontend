import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../../../shared/models/api-error.model';

export function communityHttpError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const apiMessage = (error.error as ApiError | null)?.message;

  switch (error.status) {
    case 400:
      return apiMessage || 'Dados inválidos. Verifique os campos e tente novamente.';
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Comunidade não encontrada.';
    case 409:
      return 'Já existe uma comunidade com este nome ou slug.';
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
