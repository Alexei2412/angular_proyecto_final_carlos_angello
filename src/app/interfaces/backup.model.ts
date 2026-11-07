import { Student } from './student.model';
import { Enrollment } from './enrollment.model';

export interface BackupData {
  app: string;
  version: string;
  fechaExportacion: string;
  estudiantes: Student[];
  inscripciones: Enrollment[];
}

export interface BackupValidationResult {
  valid: boolean;
  errors: string[];
  data?: BackupData;
}
