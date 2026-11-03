import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core';
import { UiButton, UiTextField } from '../../../../shared';
import {
  emailValidators,
  fieldErrorMessage,
  passwordValidators,
  usernameValidators,
} from '../../utils/auth-validators';
import { httpErrorMessage } from '../../utils/http-error-message';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiTextField],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    username: ['', usernameValidators],
    email: ['', emailValidators],
    password: ['', passwordValidators],
  });

  usernameError(): string | null {
    return fieldErrorMessage(this.form.controls.username, 'username');
  }

  emailError(): string | null {
    return fieldErrorMessage(this.form.controls.email, 'email');
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
      .registerAndLogin(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/');
        },
        error: (error: unknown) => {
          this.formError.set(
            httpErrorMessage(error, 'Não foi possível criar a conta.'),
          );
        },
      });
  }
}
