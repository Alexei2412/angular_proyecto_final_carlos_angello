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
    this.snackBar.open(`Copia de seguridad descargada con éxito`, 'Cerrar', { duration: 3000 });
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
      title: 'Reemplazar información',
      message:
        `El archivo contiene ${result.data.estudiantes.length} estudiantes y ` +
        `${result.data.inscripciones.length} inscripciones.\n\n` +
        `Al confirmar, se reemplazarán los estudiantes y las inscripciones registradas actualmente.\n\n¿Desea continuar?`,
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
          this.snackBar.open('Importación cancelada', 'Cerrar', { duration: 3000 });
        }
      });
  }
  private showError(errors: string[]): void {
    this.importErrors.set(errors);
    this.snackBar.open(
      'El archivo contiene inconsistencias. Revise el detalle de errores.',
      'Cerrar',
      {
        duration: 5000,
      },
    );
  }
}
