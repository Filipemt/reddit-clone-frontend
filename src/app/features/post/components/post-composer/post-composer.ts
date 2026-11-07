import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UiAvatar } from '../../../../shared';
import { Community } from '../../../community/models/community.model';

export interface PostComposerSubmit {
  communityId: string;
  title: string;
  body: string;
  media: File | null;
}

@Component({
  selector: 'app-post-composer',
  imports: [ReactiveFormsModule, RouterLink, UiAvatar],
  templateUrl: './post-composer.html',
  styleUrl: './post-composer.scss',
})
export class PostComposer {
  private readonly fb = inject(FormBuilder);

  readonly mode = input<'home' | 'community'>('home');
  readonly communities = input<Community[]>([]);
  readonly fixedCommunityId = input<string | null>(null);
  readonly fixedCommunitySlug = input<string | null>(null);
  readonly posting = input(false);
  readonly showCancel = input(false);
  readonly emptyHint = input('Entre em uma comunidade para publicar.');

  readonly submitted = output<PostComposerSubmit>();
  readonly cancelled = output<void>();

  readonly mediaFile = signal<File | null>(null);

  readonly form = this.fb.nonNullable.group({
    communityId: ['', Validators.required],
    title: ['', [Validators.required, Validators.maxLength(300)]],
    body: ['', Validators.maxLength(40000)],
  });

  protected titlePlaceholder(): string {
    return this.mode() === 'home'
      ? "What's happening in your communities?"
      : "What's happening in this community?";
  }

  constructor() {
    effect(() => {
      if (this.mode() === 'community') {
        const id = this.fixedCommunityId() ?? '';
        this.form.controls.communityId.setValue(id);
        this.form.controls.communityId.clearValidators();
        this.form.controls.communityId.updateValueAndValidity({ emitEvent: false });
        return;
      }

      this.form.controls.communityId.setValidators(Validators.required);
      this.form.controls.communityId.updateValueAndValidity({ emitEvent: false });

      const list = this.communities();
      if (list.length > 0 && !this.form.controls.communityId.value) {
        this.form.controls.communityId.setValue(list[0].communityId);
      }
    });
  }

  protected onMediaSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.mediaFile.set(inputEl.files?.[0] ?? null);
  }

  protected clearMedia(inputEl: HTMLInputElement): void {
    this.mediaFile.set(null);
    inputEl.value = '';
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.posting()) {
      return;
    }

    const { communityId, title, body } = this.form.getRawValue();
    const resolvedId =
      this.mode() === 'community' ? (this.fixedCommunityId() ?? communityId) : communityId;

    if (!resolvedId) {
      return;
    }

    this.submitted.emit({
      communityId: resolvedId,
      title,
      body,
      media: this.mediaFile(),
    });
  }

  resetForm(): void {
    const communityId =
      this.mode() === 'community'
        ? (this.fixedCommunityId() ?? '')
        : this.form.controls.communityId.value;

    this.form.reset({
      communityId,
      title: '',
      body: '',
    });
    this.mediaFile.set(null);
  }
}
