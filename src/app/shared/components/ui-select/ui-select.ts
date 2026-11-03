import {
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface UiSelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-ui-select',
  templateUrl: './ui-select.html',
  styleUrl: './ui-select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelect),
      multi: true,
    },
  ],
})
export class UiSelect implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input.required<readonly UiSelectOption[]>();
  readonly placeholder = input('Selecione');
  readonly error = input<string | null>(null);
  readonly inputId = input(`ui-select-${crypto.randomUUID()}`);

  protected readonly value = signal<string>('');
  protected readonly disabled = signal(false);

  private onChange: (value: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | number | null): void {
    this.value.set(value == null || value === '' ? '' : String(value));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onSelect(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.value.set(raw);

    if (raw === '') {
      this.onChange(null);
      return;
    }

    const matched = this.options().find((option) => String(option.value) === raw);
    this.onChange(matched?.value ?? raw);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
