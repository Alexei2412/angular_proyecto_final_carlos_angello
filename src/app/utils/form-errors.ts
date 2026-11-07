import { AbstractControl } from '@angular/forms';

export function getErrorMessage(
  control: AbstractControl | null,
  patternMessage = 'Formato inválido',
): string {
  if (!control || !control.errors) {
    return '';
  }
  const errors = control.errors;

  if (errors['required']) {
    return 'Este campo es obligatorio';
  }
  if (errors['whitespace']) {
    return 'No puede contener únicamente espacios en blanco';
  }
  if (errors['minlength']) {
    return `Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
  }
  if (errors['maxlength']) {
    return `Debe tener como máximo ${errors['maxlength'].requiredLength} caracteres`;
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
    return 'Fecha inválida';
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
  return 'Valor inválido';
}
