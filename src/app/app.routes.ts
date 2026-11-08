import { Routes } from '@angular/router';
import { StudentForm } from './pages/student-form/student-form';

export const routes: Routes = [
  { path: 'estudiantes/nuevo', component: StudentForm, title: 'Nuevo estudiante' },
  { path: 'estudiantes/:id/editar', component: StudentForm, title: 'Editar estudiante' },
];
