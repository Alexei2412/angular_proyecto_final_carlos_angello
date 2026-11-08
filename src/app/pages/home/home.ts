import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { StudentService } from '../../services/student-service';
import { EnrollmentService } from '../../services/enrollment-service';
import { CatalogService } from '../../services/catalog-service';
import { EnrollmentStatus } from '../../enums/enrollment-status';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCard, MatCardContent, MatCardActions, MatButton, MatIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  private catalogs = inject(CatalogService);

  stats = computed(() => {
    const enrollments = this.enrollmentService.enrollments();
    return [
      { icon: 'groups', label: 'Estudiantes', value: this.studentService.students().length },
      { icon: 'assignment', label: 'Inscripciones', value: enrollments.length },
      {
        icon: 'check_circle',
        label: 'Aprobadas',
        value: enrollments.filter((e) => e.estado === EnrollmentStatus.APROBADA).length,
      },
      {
        icon: 'menu_book',
        label: 'Cursos en catálogo',
        value: this.catalogs.cursos.value().length,
      },
    ];
  });
}
