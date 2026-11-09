import { booleanAttribute, Component, HostListener, input, output } from '@angular/core';

import { UiButton } from '../ui-button/ui-button';

@Component({
  selector: 'app-ui-confirm-dialog',
  imports: [UiButton],
  templateUrl: './ui-confirm-dialog.html',
  styleUrl: './ui-confirm-dialog.scss',
})
export class UiConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly confirmVariant = input<'primary' | 'danger'>('primary');
  readonly busy = input(false, { transform: booleanAttribute });

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }

  onBackdropClick(): void {
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
