import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemIcon,
  MatListItemLine,
  MatListItemTitle,
} from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { StudentService } from '../../services/student-service';
import { EnrollmentService } from '../../services/enrollment-service';
import { CatalogService } from '../../services/catalog-service';

@Component({
  selector: 'app-student-detail',
  imports: [
    RouterLink,
    DatePipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIcon,
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatListItemLine,
    MatTableModule,
  ],
  templateUrl: './student-detail.html',
})
export class StudentDetail {
  id = input.required<string>();
  private studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  readonly catalogs = inject(CatalogService);

  student = computed(() => this.studentService.getById(this.id()));
  enrollments = computed(() => this.enrollmentService.getByStudent(this.id()));

  enrollmentColumns = ['id', 'periodo', 'cursos', 'estado'];
}
