import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core';
import { UiButton, UiTextField } from '../../../../shared';
import {
  fieldErrorMessage,
  loginUsernameValidators,
  passwordValidators,
} from '../../utils/auth-validators';
import { httpErrorMessage } from '../../utils/http-error-message';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiTextField],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', loginUsernameValidators],
    password: ['', passwordValidators],
  });

  usernameError(): string | null {
    return fieldErrorMessage(this.form.controls.username, 'username');
  }

  passwordError(): string | null {
    return fieldErrorMessage(this.form.controls.password, 'password');
  }

  submit(): void {
    this.formError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/');
        },
        error: (error: unknown) => {
          this.formError.set(httpErrorMessage(error, 'Não foi possível entrar.'));
        },
      });
  }
}
