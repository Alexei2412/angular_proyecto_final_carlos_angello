export interface Enrollment {
  id: string;
  estudianteId: string;
  periodoId: string;
  cursoIds: string[];
  modalidadId: string;
  estado: string;
  observaciones: string;
  fechaInscripcion: string;
}
