import { HttpErrorResponse } from '@angular/common/http';

export function httpErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  switch (error.status) {
    case 400:
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    case 401:
    case 422:
      return 'Usuário ou senha inválidos.';
    case 409:
      return 'Nome de usuário ou e-mail já estão em uso.';
    case 429:
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    case 0:
      return 'Não foi possível conectar à API.';
    default:
      if (error.status >= 500) {
        return 'O servidor encontrou um problema. Tente novamente em instantes.';
      }
      return fallback;
  }
}
