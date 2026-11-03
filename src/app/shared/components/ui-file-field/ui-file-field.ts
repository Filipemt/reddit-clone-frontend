import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-ui-file-field',
  templateUrl: './ui-file-field.html',
  styleUrl: './ui-file-field.scss',
})
export class UiFileField {
  readonly label = input.required<string>();
  readonly accept = input('image/*');
  readonly buttonLabel = input('Upload');
  readonly disabled = input(false);

  readonly fileChange = output<File | null>();

  protected readonly fileName = signal<string | null>(null);

  protected onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    this.fileName.set(file?.name ?? null);
    this.fileChange.emit(file);
  }

  protected clear(inputEl: HTMLInputElement): void {
    inputEl.value = '';
    this.fileName.set(null);
    this.fileChange.emit(null);
  }
}
