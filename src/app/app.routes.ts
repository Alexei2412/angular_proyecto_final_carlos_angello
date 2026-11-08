import { Routes } from '@angular/router';
import { StudentList } from './pages/student-list/student-list';
import { StudentForm } from './pages/student-form/student-form';
import { EnrollmentList } from './pages/enrollment-list/enrollment-list';
import { EnrollmentForm } from './pages/enrollment-form/enrollment-form';

export const routes: Routes = [
  { path: 'estudiantes', component: StudentList, title: 'Estudiantes' },
  { path: 'estudiantes/nuevo', component: StudentForm, title: 'Nuevo estudiante' },
  { path: 'estudiantes/:id/editar', component: StudentForm, title: 'Editar estudiante' },
  { path: 'inscripciones', component: EnrollmentList, title: 'Inscripciones' },
  { path: 'inscripciones/nueva', component: EnrollmentForm, title: 'Nueva inscripción' },
  { path: 'inscripciones/:id/editar', component: EnrollmentForm, title: 'Editar inscripción' },
];
