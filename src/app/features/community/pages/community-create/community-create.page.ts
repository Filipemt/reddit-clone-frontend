import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  PageHeader,
  UiButton,
  UiFileField,
  UiSelect,
  UiSelectOption,
  UiTextarea,
  UiTextField,
} from '../../../../shared';
import {
  COMMUNITY_ACTIVE_STATUS_ID,
  COMMUNITY_TOPICS,
  COMMUNITY_TYPES,
} from '../../models/community-references';
import { CommunityService } from '../../services/community.service';
import { communityHttpError } from '../../utils/community-http-error';

function slugValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? null : { slugFormat: true };
}

@Component({
  selector: 'app-community-create-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHeader,
    UiButton,
    UiFileField,
    UiSelect,
    UiTextarea,
    UiTextField,
  ],
  templateUrl: './community-create.page.html',
  styleUrl: './community-create.page.scss',
})
export class CommunityCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly communities = inject(CommunityService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly iconFile = signal<File | null>(null);
  readonly bannerFile = signal<File | null>(null);

  readonly topicOptions: UiSelectOption[] = COMMUNITY_TOPICS.map((topic) => ({
    value: topic.id,
    label: topic.label,
  }));

  readonly typeOptions: UiSelectOption[] = COMMUNITY_TYPES.map((type) => ({
    value: type.id,
    label: type.label,
  }));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    slug: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100), slugValidator],
    ],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    topicId: this.fb.control<number | null>(null, Validators.required),
    typeId: this.fb.control<number | null>(null, Validators.required),
  });

  nameError(): string | null {
    const control = this.form.controls.name;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Informe o nome da comunidade.';
    }
    if (control.errors['minlength'] || control.errors['maxlength']) {
      return 'O nome deve ter entre 3 e 100 caracteres.';
    }
    return null;
  }

  slugError(): string | null {
    const control = this.form.controls.slug;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Informe o slug.';
    }
    if (control.errors['slugFormat']) {
      return 'Use apenas letras minúsculas, números e hífens.';
    }
    if (control.errors['minlength'] || control.errors['maxlength']) {
      return 'O slug deve ter entre 3 e 100 caracteres.';
    }
    return null;
  }

  descriptionError(): string | null {
    const control = this.form.controls.description;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Informe a descrição.';
    }
    if (control.errors['maxlength']) {
      return 'A descrição pode ter no máximo 255 caracteres.';
    }
    return null;
  }

  topicError(): string | null {
    const control = this.form.controls.topicId;
    if (!control.touched || !control.errors) {
      return null;
    }
    return control.errors['required'] ? 'Selecione um tópico.' : null;
  }

  typeError(): string | null {
    const control = this.form.controls.typeId;
    if (!control.touched || !control.errors) {
      return null;
    }
    return control.errors['required'] ? 'Selecione um tipo.' : null;
  }

  onIconChange(file: File | null): void {
    this.iconFile.set(file);
  }

  onBannerChange(file: File | null): void {
    this.bannerFile.set(file);
  }

  submit(): void {
    this.formError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    const { name, slug, description, topicId, typeId } = this.form.getRawValue();
    if (topicId == null || typeId == null) {
      return;
    }

    this.submitting.set(true);
    this.communities
      .create(
        {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          topicId,
          typeId,
          statusId: COMMUNITY_ACTIVE_STATUS_ID,
        },
        {
          icon: this.iconFile(),
          banner: this.bannerFile(),
        },
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (community) => {
          void this.router.navigate(['/communities', community.slug]);
        },
        error: (error: unknown) => {
          this.formError.set(
            communityHttpError(error, 'Não foi possível criar a comunidade.'),
          );
        },
      });
  }
}
