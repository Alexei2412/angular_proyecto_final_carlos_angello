import { inject, Injectable } from '@angular/core';
import { StudentService } from './student-service';
import { EnrollmentService } from './enrollment-service';
import { CatalogService } from './catalog-service';
import { BackupData, BackupValidationResult } from '../interfaces/backup.model';
import { Student } from '../interfaces/student.model';
import { Enrollment } from '../interfaces/enrollment.model';
import {
  DPI_PATTERN,
  EMAIL_PATTERN,
  PHONE_PATTERN,
  STUDENT_ID_PATTERN,
} from '../validators/custom-validators';
import { MAX_COURSES, MAX_CREDITS } from './enrollment-service';

export const BACKUP_APP = 'UMES-Inscripciones';
export const BACKUP_VERSION = '1.0';
export const BACKUP_FILE_NAME = 'uniregistro_respaldo.json';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  private catalogService = inject(CatalogService);

  buildBackup(): BackupData {
    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      fechaExportacion: new Date().toISOString(),
      estudiantes: this.studentService.students(),
      inscripciones: this.enrollmentService.enrollments(),
    };
  }

  exportData(): void {
    const json = JSON.stringify(this.buildBackup(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = BACKUP_FILE_NAME;
    link.click();

    URL.revokeObjectURL(url);
  }

  validate(fileText: string): BackupValidationResult {
    const errors: string[] = [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(fileText);
    } catch {
      return { valid: false, errors: ['El archivo no contiene JSON válido (error de sintaxis).'] };
    }

    if (!this.isObject(parsed)) {
      return { valid: false, errors: ['El archivo debe contener un objeto JSON.'] };
    }
    if (parsed['version'] !== BACKUP_VERSION) {
      errors.push(`Versión de formato no soportada: se esperaba "${BACKUP_VERSION}".`);
    }
    if (!Array.isArray(parsed['estudiantes'])) {
      errors.push('Falta la colección "estudiantes" o no es un arreglo.');
    }
    if (!Array.isArray(parsed['inscripciones'])) {
      errors.push('Falta la colección "inscripciones" o no es un arreglo.');
    }
    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const estudiantes = parsed['estudiantes'] as unknown[];
    const inscripciones = parsed['inscripciones'] as unknown[];
    const studentIds = new Set<string>();
    estudiantes.forEach((item, index) => {
      const prefix = `Estudiante #${index + 1}`;
      errors.push(...this.validateStudent(item, prefix));
      if (this.isObject(item) && typeof item['id'] === 'string') {
        if (studentIds.has(item['id'])) {
          errors.push(`${prefix}: el código ${item['id']} está duplicado.`);
        }
        studentIds.add(item['id']);
      }
    });

    const enrollmentIds = new Set<string>();
    inscripciones.forEach((item, index) => {
      const prefix = `Inscripción #${index + 1}`;
      errors.push(...this.validateEnrollment(item, prefix, studentIds));
      if (this.isObject(item) && typeof item['id'] === 'string') {
        if (enrollmentIds.has(item['id'])) {
          errors.push(`${prefix}: el id ${item['id']} está duplicado.`);
        }
        enrollmentIds.add(item['id']);
      }
    });

    if (errors.length > 0) {
      return { valid: false, errors };
    }
    return { valid: true, errors: [], data: parsed as unknown as BackupData };
  }

  applyImport(data: BackupData): void {
    this.studentService.replaceAll(data.estudiantes);
    this.enrollmentService.replaceAll(data.inscripciones);
  }

  private validateStudent(item: unknown, prefix: string): string[] {
    const errors: string[] = [];
    if (!this.isObject(item)) {
      return [`${prefix}: no es un objeto.`];
    }
    const s = item as Partial<Record<keyof Student, unknown>>;
    const requiredText: (keyof Student)[] = [
      'id',
      'nombres',
      'apellidos',
      'dpi',
      'fechaNacimiento',
      'genero',
      'correo',
      'direccion',
      'carreraId',
      'jornadaId',
    ];
    for (const field of requiredText) {
      if (!this.isNonEmptyString(s[field])) {
        errors.push(`${prefix}: el campo "${field}" es obligatorio y debe ser texto.`);
      }
    }
    if (typeof s.id === 'string' && !STUDENT_ID_PATTERN.test(s.id)) {
      errors.push(`${prefix}: el código "${s.id}" no tiene el formato EST-000.`);
    }
    if (typeof s.dpi === 'string' && !DPI_PATTERN.test(s.dpi)) {
      errors.push(`${prefix}: el DPI "${s.dpi}" debe tener exactamente 13 dígitos.`);
    }
    if (typeof s.correo === 'string' && !EMAIL_PATTERN.test(s.correo)) {
      errors.push(`${prefix}: el correo "${s.correo}" no es válido.`);
    }
    if (typeof s.fechaNacimiento === 'string' && isNaN(new Date(s.fechaNacimiento).getTime())) {
      errors.push(`${prefix}: la fecha de nacimiento no es válida.`);
    }
    if (typeof s.semestre !== 'number' || s.semestre < 1 || s.semestre > 10) {
      errors.push(`${prefix}: "semestre" debe ser un número entre 1 y 10.`);
    }
    if (
      typeof s.genero === 'string' &&
      !this.inCatalog(this.catalogService.generos.value(), s.genero)
    ) {
      errors.push(`${prefix}: el género "${s.genero}" no existe en el catálogo.`);
    }
    if (
      typeof s.carreraId === 'string' &&
      !this.inCatalog(this.catalogService.carreras.value(), s.carreraId)
    ) {
      errors.push(`${prefix}: la carrera "${s.carreraId}" no existe en el catálogo.`);
    }
    if (
      typeof s.jornadaId === 'string' &&
      !this.inCatalog(this.catalogService.jornadas.value(), s.jornadaId)
    ) {
      errors.push(`${prefix}: la jornada "${s.jornadaId}" no existe en el catálogo.`);
    }

    if (!Array.isArray(s.contactos) || s.contactos.length === 0) {
      errors.push(`${prefix}: "contactos" debe ser un arreglo con al menos un número.`);
    } else {
      s.contactos.forEach((c: unknown, i: number) => {
        if (
          !this.isObject(c) ||
          typeof c['numero'] !== 'string' ||
          !PHONE_PATTERN.test(c['numero']) ||
          typeof c['tipo'] !== 'string' ||
          !this.inCatalog(this.catalogService.tiposContacto.value(), c['tipo']) ||
          typeof c['activo'] !== 'boolean'
        ) {
          errors.push(
            `${prefix}: el contacto #${i + 1} debe tener numero (8 dígitos), tipo válido y activo (true/false).`,
          );
        }
      });
    }
    return errors;
  }

  private validateEnrollment(item: unknown, prefix: string, studentIds: Set<string>): string[] {
    const errors: string[] = [];
    if (!this.isObject(item)) {
      return [`${prefix}: no es un objeto.`];
    }
    const e = item as Partial<Record<keyof Enrollment, unknown>>;

    for (const field of [
      'id',
      'estudianteId',
      'periodoId',
      'modalidadId',
      'estado',
    ] as (keyof Enrollment)[]) {
      if (!this.isNonEmptyString(e[field])) {
        errors.push(`${prefix}: el campo "${field}" es obligatorio y debe ser texto.`);
      }
    }
    if (typeof e.estudianteId === 'string' && !studentIds.has(e.estudianteId)) {
      errors.push(
        `${prefix}: hace referencia al estudiante ${e.estudianteId}, que no existe en el archivo.`,
      );
    }
    if (
      typeof e.periodoId === 'string' &&
      !this.inCatalog(this.catalogService.periodos.value(), e.periodoId)
    ) {
      errors.push(`${prefix}: el período "${e.periodoId}" no existe.`);
    }
    if (
      typeof e.modalidadId === 'string' &&
      !this.inCatalog(this.catalogService.modalidades.value(), e.modalidadId)
    ) {
      errors.push(`${prefix}: la modalidad "${e.modalidadId}" no existe.`);
    }
    if (
      typeof e.estado === 'string' &&
      !this.inCatalog(this.catalogService.estados.value(), e.estado)
    ) {
      errors.push(`${prefix}: el estado "${e.estado}" no existe.`);
    }

    if (!Array.isArray(e.cursoIds) || e.cursoIds.length === 0) {
      errors.push(`${prefix}: "cursoIds" debe ser un arreglo con al menos un curso.`);
    } else {
      for (const cursoId of e.cursoIds) {
        if (typeof cursoId !== 'string' || !this.catalogService.getCourse(cursoId)) {
          errors.push(`${prefix}: el curso "${cursoId}" no existe en el catálogo.`);
        }
      }
      if (e.cursoIds.length > MAX_COURSES) {
        errors.push(`${prefix}: tiene ${e.cursoIds.length} cursos; el máximo es ${MAX_COURSES}.`);
      }
      const credits = this.catalogService.totalCredits(e.cursoIds as string[]);
      if (credits > MAX_CREDITS) {
        errors.push(`${prefix}: suma ${credits} créditos; el máximo es ${MAX_CREDITS}.`);
      }
    }
    return errors;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isNonEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private inCatalog(items: { id: string }[], id: string): boolean {
    return items.some((i) => i.id === id);
  }
}
