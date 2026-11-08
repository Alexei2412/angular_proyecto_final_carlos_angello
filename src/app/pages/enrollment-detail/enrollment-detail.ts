import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EnrollmentService } from '../../services/enrollment-service';
import { StudentService } from '../../services/student-service';
import { CatalogService } from '../../services/catalog-service';
import { EnrollmentStatus } from '../../enums/enrollment-status';

@Component({
  selector: 'app-enrollment-detail',
  imports: [
    RouterLink,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIcon,
    MatTableModule,
  ],
  templateUrl: './enrollment-detail.html',
})
export class EnrollmentDetail {
  id = input.required<string>();

  private enrollmentService = inject(EnrollmentService);
  readonly studentService = inject(StudentService);
  readonly catalogs = inject(CatalogService);

  readonly CANCELADA = EnrollmentStatus.CANCELADA;
  courseColumns = ['codigo', 'nombre', 'semestre', 'creditos'];

  enrollment = computed(() => this.enrollmentService.getById(this.id()));

  courses = computed(() =>
    (this.enrollment()?.cursoIds ?? [])
      .map((id) => this.catalogs.getCourse(id))
      .filter((c) => c !== undefined),
  );

  totalCredits = computed(() => this.catalogs.totalCredits(this.enrollment()?.cursoIds ?? []));
}
