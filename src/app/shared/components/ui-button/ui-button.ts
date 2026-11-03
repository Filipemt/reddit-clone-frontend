import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.scss',
})
export class UiButton {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly variant = input<'primary' | 'link'>('primary');
}
