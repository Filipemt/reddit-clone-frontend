import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-avatar',
  templateUrl: './ui-avatar.html',
  styleUrl: './ui-avatar.scss',
})
export class UiAvatar {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
