import { Component, inject, signal } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackupService, BACKUP_FILE_NAME } from '../../services/backup-service';
import { StudentService } from '../../services/student-service';
import { EnrollmentService } from '../../services/enrollment-service';
import { ConfirmDialog, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-data-backup',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
  ],
  templateUrl: './data-backup.html',
  styleUrl: './data-backup.css',
})
export class DataBackup {
  private backupService = inject(BackupService);
  readonly studentService = inject(StudentService);
  readonly enrollmentService = inject(EnrollmentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  readonly fileName = BACKUP_FILE_NAME;

  importErrors = signal<string[]>([]);
  selectedFile = signal('');

  exportData(): void {
    this.backupService.exportData();
    this.snackBar.open(`Se descargó ${BACKUP_FILE_NAME}`, 'Cerrar', { duration: 3000 });
  }
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.importErrors.set([]);

    if (!file) {
      return;
    }
    this.selectedFile.set(file.name);
    let text: string;
    try {
      text = await file.text();
    } catch {
      this.showError(['No se pudo leer el archivo seleccionado.']);
      return;
    }
    const result = this.backupService.validate(text);
    if (!result.valid || !result.data) {
      this.showError(result.errors);
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Reemplazar datos',
      message:
        `El archivo contiene ${result.data.estudiantes.length} estudiante(s) y ` +
        `${result.data.inscripciones.length} inscripción(es).\n\n` +
        `Se REEMPLAZARÁN los ${this.studentService.students().length} estudiante(s) y ` +
        `${this.enrollmentService.enrollments().length} inscripción(es) actuales.\n\n¿Desea continuar?`,
      confirmText: 'Importar y reemplazar',
      danger: true,
    };
    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed && result.data) {
          this.backupService.applyImport(result.data);
          this.snackBar.open('Datos importados correctamente', 'Cerrar', { duration: 4000 });
        } else {
          this.snackBar.open('Importación cancelada. No se modificó ningún dato.', 'Cerrar', {
            duration: 3000,
          });
        }
      });
  }
  private showError(errors: string[]): void {
    this.importErrors.set(errors);
    this.snackBar.open('El archivo no es válido. No se modificaron los datos.', 'Cerrar', {
      duration: 5000,
    });
  }
}
