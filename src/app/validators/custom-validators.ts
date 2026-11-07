import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

export const STUDENT_ID_PATTERN = /^EST-\d{3,6}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_PATTERN = /^\d{4}-?\d{4}$/;
export const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;
export const DPI_PATTERN = /^\d{13}$/;

export class CustomValidators {
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (typeof value === 'string' && value.length > 0 && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  static birthDate(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const date = new Date(control.value + 'T00:00:00');
      if (isNaN(date.getTime())) {
        return { invalidDate: true };
      }
      const today = new Date();
      if (date > today) {
        return { futureDate: true };
      }
      let age = today.getFullYear() - date.getFullYear();
      const birthdayNotYet =
        today.getMonth() < date.getMonth() ||
        (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
      if (birthdayNotYet) {
        age--;
      }
      if (age < minAge) {
        return { minAge: { required: minAge, actual: age } };
      }
      if (age > maxAge) {
        return { maxAge: { required: maxAge, actual: age } };
      }
      return null;
    };
  }

  static uniqueStudentId(exists: (id: string) => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').trim();
      return value && exists(value) ? { duplicateId: true } : null;
    };
  }

  static minItems(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const length = control instanceof FormArray ? control.length : (control.value ?? []).length;
      return length < min ? { minItems: { required: min, actual: length } } : null;
    };
  }

  static maxItems(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const length = control instanceof FormArray ? control.length : (control.value ?? []).length;
      return length > max ? { maxItems: { required: max, actual: length } } : null;
    };
  }

  static atLeastOneActive(control: AbstractControl): ValidationErrors | null {
    const contacts = (control.value ?? []) as { activo: boolean }[];
    return contacts.length > 0 && !contacts.some((c) => c.activo)
      ? { noActiveContact: true }
      : null;
  }

  static noDuplicateNumbers(control: AbstractControl): ValidationErrors | null {
    const numbers = ((control.value ?? []) as { numero: string }[])
      .map((c) => (c.numero ?? '').replace('-', '').trim())
      .filter((n) => n.length > 0);
    return new Set(numbers).size !== numbers.length ? { duplicateNumber: true } : null;
  }
}
