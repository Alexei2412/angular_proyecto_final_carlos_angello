import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { StudentList } from './pages/student-list/student-list';
import { StudentForm } from './pages/student-form/student-form';
import { StudentDetail } from './pages/student-detail/student-detail';
import { EnrollmentList } from './pages/enrollment-list/enrollment-list';
import { EnrollmentForm } from './pages/enrollment-form/enrollment-form';
import { EnrollmentDetail } from './pages/enrollment-detail/enrollment-detail';
import { DataBackup } from './pages/data-backup/data-backup';

export const routes: Routes = [
  { path: '', component: Home, title: 'Inicio' },
  { path: 'estudiantes', component: StudentList, title: 'Estudiantes' },
  { path: 'estudiantes/nuevo', component: StudentForm, title: 'Nuevo estudiante' },
  { path: 'estudiantes/:id', component: StudentDetail, title: 'Detalle de estudiante' },
  { path: 'estudiantes/:id/editar', component: StudentForm, title: 'Editar estudiante' },
  { path: 'inscripciones', component: EnrollmentList, title: 'Inscripciones' },
  { path: 'inscripciones/nueva', component: EnrollmentForm, title: 'Nueva inscripción' },
  { path: 'inscripciones/:id', component: EnrollmentDetail, title: 'Detalle de inscripción' },
  { path: 'inscripciones/:id/editar', component: EnrollmentForm, title: 'Editar inscripción' },
  { path: 'respaldo', component: DataBackup, title: 'Importar / Exportar' },
  { path: '**', redirectTo: '' },
];
