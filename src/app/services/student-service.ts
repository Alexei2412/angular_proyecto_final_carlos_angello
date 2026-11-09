import { inject, Injectable, signal } from '@angular/core';
import { Student } from '../interfaces/student.model';
import { StorageService } from './storage-service';
import { StorageKeys } from '../enums/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private storage = inject(StorageService);

  private studentsSignal = signal<Student[]>(
    this.storage.read<Student[]>(StorageKeys.STUDENTS, []),
  );

  readonly students = this.studentsSignal.asReadonly();

  getById(id: string): Student | undefined {
    return this.studentsSignal().find((s) => s.id === id);
  }

  exists(id: string): boolean {
    const normalized = id.trim().toUpperCase();
    return this.studentsSignal().some((s) => s.id.toUpperCase() === normalized);
  }

  add(student: Student): void {
    if (this.exists(student.id)) {
      throw new Error(`Ya existe un estudiante registrado con el código ${student.id}`);
    }
    this.studentsSignal.update((list) => [...list, student]);
    this.save();
  }

  update(student: Student): void {
    this.studentsSignal.update((list) => list.map((s) => (s.id === student.id ? student : s)));
    this.save();
  }

  delete(id: string): void {
    this.studentsSignal.update((list) => list.filter((s) => s.id !== id));
    this.save();
  }

  replaceAll(students: Student[]): void {
    this.studentsSignal.set(students);
    this.save();
  }

  fullName(id: string): string {
    const student = this.getById(id);
    return student ? `${student.nombres} ${student.apellidos}` : 'Estudiante no encontrado';
  }

  private save(): void {
    this.storage.write(StorageKeys.STUDENTS, this.studentsSignal());
  }
}
