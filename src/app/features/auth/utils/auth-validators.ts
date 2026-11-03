import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const usernameValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(3),
  Validators.maxLength(20),
];

export const loginUsernameValidators: ValidatorFn[] = [Validators.required];

export const passwordValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(8),
  Validators.maxLength(72),
];

export const emailValidators: ValidatorFn[] = [Validators.required, Validators.email];

export function fieldErrorMessage(
  control: AbstractControl | null,
  field: 'username' | 'password' | 'email',
): string | null {
  if (!control || !control.touched || !control.errors) {
    return null;
  }

  const errors: ValidationErrors = control.errors;

  if (errors['required']) {
    const labels = {
      username: 'Nome de usuário é obrigatório.',
      password: 'Senha é obrigatória.',
      email: 'E-mail é obrigatório.',
    };
    return labels[field];
  }

  if (errors['email']) {
    return 'Informe um e-mail válido.';
  }

  if (errors['minlength']) {
    if (field === 'username') {
      return 'Nome de usuário deve ter entre 3 e 20 caracteres.';
    }
    if (field === 'password') {
      return 'Senha deve ter entre 8 e 72 caracteres.';
    }
  }

  if (errors['maxlength']) {
    if (field === 'username') {
      return 'Nome de usuário deve ter entre 3 e 20 caracteres.';
    }
    if (field === 'password') {
      return 'Senha deve ter entre 8 e 72 caracteres.';
    }
  }

  return 'Campo inválido.';
}
