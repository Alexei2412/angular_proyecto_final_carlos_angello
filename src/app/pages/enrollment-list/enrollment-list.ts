import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatFormField, MatInput, MatLabel, MatPrefix } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnrollmentService } from '../../services/enrollment-service';
import { StudentService } from '../../services/student-service';
import { CatalogService } from '../../services/catalog-service';
import { Enrollment } from '../../interfaces/enrollment.model';
import { EnrollmentStatus } from '../../enums/enrollment-status';
import { ConfirmDialog, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-enrollment-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatCard,
    MatCardContent,
  ],
  templateUrl: './enrollment-list.html',
})
export class EnrollmentList {
  readonly enrollmentService = inject(EnrollmentService);
  readonly studentService = inject(StudentService);
  readonly catalogs = inject(CatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder).nonNullable;

  readonly CANCELADA = EnrollmentStatus.CANCELADA;
  displayedColumns = ['id', 'estudiante', 'periodo', 'cursos', 'creditos', 'estado', 'acciones'];

  filterForm = this.fb.group({
    estudiante: [''],
    periodoId: [''],
    estado: [''],
  });

  private filters = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });

  filteredEnrollments = computed(() => {
    const { estudiante = '', periodoId = '', estado = '' } = this.filters();
    const search = estudiante.trim().toLowerCase();

    return this.enrollmentService
      .enrollments()
      .filter(
        (e) =>
          (!search ||
            e.id.toLowerCase().includes(search) ||
            e.estudianteId.toLowerCase().includes(search) ||
            this.studentService.fullName(e.estudianteId).toLowerCase().includes(search)) &&
          (!periodoId || e.periodoId === periodoId) &&
          (!estado || e.estado === estado),
      );
  });

  clearFilters(): void {
    this.filterForm.reset();
  }

  confirmCancel(enrollment: Enrollment): void {
    const data: ConfirmDialogData = {
      title: 'Cancelar inscripción',
      message:
        `¿Desea cancelar la inscripción ${enrollment.id} de ` +
        `${this.studentService.fullName(enrollment.estudianteId)} (${enrollment.periodoId})?`,
      confirmText: 'Cancelar inscripción',
      danger: true,
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.enrollmentService.cancel(enrollment.id);
          this.snackBar.open('La inscripción fue cancelada correctamente', 'Cerrar', { duration: 3000 });
        }
      });
  }
}
