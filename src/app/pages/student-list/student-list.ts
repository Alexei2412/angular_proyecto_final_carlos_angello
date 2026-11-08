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
import { StudentService } from '../../services/student-service';
import { EnrollmentService } from '../../services/enrollment-service';
import { CatalogService } from '../../services/catalog-service';
import { Student } from '../../interfaces/student.model';
import { ConfirmDialog, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-student-list',
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
  templateUrl: './student-list.html',
})
export class StudentList {
  readonly studentService = inject(StudentService);
  private enrollmentService = inject(EnrollmentService);
  readonly catalogs = inject(CatalogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder).nonNullable;

  displayedColumns = ['id', 'nombre', 'correo', 'carrera', 'contacto', 'acciones'];
  filterForm = this.fb.group({
    texto: [''],
    carreraId: [''],
    genero: [''],
  });

  private filters = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });
  filteredStudents = computed(() => {
    const { texto = '', carreraId = '', genero = '' } = this.filters();
    const search = texto.trim().toLowerCase();

    return this.studentService
      .students()
      .filter(
        (s) =>
          (!search ||
            s.id.toLowerCase().includes(search) ||
            `${s.nombres} ${s.apellidos}`.toLowerCase().includes(search) ||
            s.correo.toLowerCase().includes(search)) &&
          (!carreraId || s.carreraId === carreraId) &&
          (!genero || s.genero === genero),
      );
  });
  clearFilters(): void {
    this.filterForm.reset();
  }

  mainContact(student: Student): string {
    return student.contactos.find((c) => c.activo)?.numero ?? '—';
  }

  confirmDelete(student: Student): void {
    const total = this.enrollmentService.getByStudent(student.id).length;
    const data: ConfirmDialogData = {
      title: 'Eliminar estudiante',
      message:
        `¿Desea eliminar a ${student.nombres} ${student.apellidos} (${student.id})?` +
        (total > 0 ? `\n\nTambién se eliminarán sus ${total} inscripción(es).` : '') +
        '\n\nEsta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      danger: true,
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.enrollmentService.deleteByStudent(student.id);
          this.studentService.delete(student.id);
          this.snackBar.open('Estudiante eliminado', 'Cerrar', { duration: 3000 });
        }
      });
  }
}
