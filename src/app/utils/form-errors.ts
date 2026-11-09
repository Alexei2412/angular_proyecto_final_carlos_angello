import { AbstractControl } from '@angular/forms';

export function getErrorMessage(
  control: AbstractControl | null,
  patternMessage = 'El formato ingresado no es válido',
): string {
  if (!control || !control.errors) {
    return '';
  }
  const errors = control.errors;

  if (errors['required']) {
    return 'Este campo es obligatorio';
  }
  if (errors['whitespace']) {
    return 'Ingrese un texto válido sin usar solo espacios';
  }
  if (errors['minlength']) {
    return `Ingrese al menos ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `No debe exceder los ${errors['maxlength'].requiredLength} caracteres`;
  }
  if (errors['min']) {
    return `El valor mínimo es ${errors['min'].min}`;
  }
  if (errors['max']) {
    return `El valor máximo es ${errors['max'].max}`;
  }
  if (errors['pattern']) {
    return patternMessage;
  }
  if (errors['duplicateId']) {
    return 'Ya existe un estudiante con este código';
  }
  if (errors['invalidDate']) {
    return 'Ingrese una fecha válida';
  }
  if (errors['futureDate']) {
    return 'La fecha no puede ser futura';
  }
  if (errors['minAge']) {
    return `La edad mínima es ${errors['minAge'].required} años`;
  }
  if (errors['maxAge']) {
    return `La edad máxima es ${errors['maxAge'].required} años`;
  }
  return 'El valor ingresado no es válido';
}
