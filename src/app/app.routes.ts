import { Routes } from '@angular/router';
import { StudentForm } from './pages/student-form/student-form';
import {EnrollmentForm} from './pages/enrollment-form/enrollment-form';

export const routes: Routes = [
  { path: 'estudiantes/nuevo', component: StudentForm, title: 'Nuevo estudiante' },
  { path: 'estudiantes/:id/editar', component: StudentForm, title: 'Editar estudiante' },
  {path: 'inscripciones/nueva', component: EnrollmentForm, title: 'Nueva inscripción'},
  {path: 'inscripciones/:id/editar', component: EnrollmentForm, title: 'Editar inscripción'}
];

