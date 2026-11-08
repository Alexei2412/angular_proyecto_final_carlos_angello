import { inject, Injectable, signal } from '@angular/core';
import { Enrollment } from '../interfaces/enrollment.model';
import { StorageService } from './storage-service';
import { StorageKeys } from '../enums/storage-keys';
import { StudentService } from './student-service';
import { CatalogService } from './catalog-service';
import { EnrollmentStatus } from '../enums/enrollment-status';

export const MAX_COURSES = 6;
export const MAX_CREDITS = 24;

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private storage = inject(StorageService);
  private studentService = inject(StudentService);
  private catalogService = inject(CatalogService);

  private enrollmentsSignal = signal<Enrollment[]>(
    this.storage.read<Enrollment[]>(StorageKeys.ENROLLMENTS, []),
  );

  readonly enrollments = this.enrollmentsSignal.asReadonly();

  getById(id: string): Enrollment | undefined {
    return this.enrollmentsSignal().find((e) => e.id === id);
  }

  getByStudent(estudianteId: string): Enrollment[] {
    return this.enrollmentsSignal().filter((e) => e.estudianteId === estudianteId);
  }

  nextId(): string {
    const max = this.enrollmentsSignal()
      .map((e) => Number(e.id.replace('INS-', '')))
      .filter((n) => !isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    return `INS-${String(max + 1).padStart(3, '0')}`;
  }

  hasActiveInPeriod(estudianteId: string, periodoId: string, excludeId?: string): boolean {
    return this.enrollmentsSignal().some(
      (e) =>
        e.id !== excludeId &&
        e.estudianteId === estudianteId &&
        e.periodoId === periodoId &&
        e.estado !== EnrollmentStatus.CANCELADA &&
        e.estado !== EnrollmentStatus.RECHAZADA,
    );
  }

  validateReferences(enrollment: Enrollment): string[] {
    const errors: string[] = [];
    if (!this.studentService.exists(enrollment.estudianteId)) {
      errors.push(`El estudiante ${enrollment.estudianteId} no existe`);
    }
    if (enrollment.cursoIds.length === 0) {
      errors.push('Debe seleccionar al menos un curso');
    }
    for (const cursoId of enrollment.cursoIds) {
      if (!this.catalogService.getCourse(cursoId)) {
        errors.push(`El curso ${cursoId} no existe en el catálogo`);
      }
    }
    return errors;
  }

  add(enrollment: Enrollment): void {
    this.throwIfInvalid(enrollment);
    this.enrollmentsSignal.update((list) => [...list, enrollment]);
    this.save();
  }

  update(enrollment: Enrollment): void {
    this.throwIfInvalid(enrollment);
    this.enrollmentsSignal.update((list) =>
      list.map((e) => (e.id === enrollment.id ? enrollment : e)),
    );
    this.save();
  }

  cancel(id: string): void {
    this.enrollmentsSignal.update((list) =>
      list.map((e) => (e.id === id ? { ...e, estado: EnrollmentStatus.CANCELADA } : e)),
    );
    this.save();
  }

  deleteByStudent(estudianteId: string): void {
    this.enrollmentsSignal.update((list) => list.filter((e) => e.estudianteId !== estudianteId));
    this.save();
  }

  replaceAll(enrollments: Enrollment[]): void {
    this.enrollmentsSignal.set(enrollments);
    this.save();
  }

  private throwIfInvalid(enrollment: Enrollment): void {
    const errors = this.validateReferences(enrollment);
    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }
  }

  private save(): void {
    this.storage.write(StorageKeys.ENROLLMENTS, this.enrollmentsSignal());
  }
}
