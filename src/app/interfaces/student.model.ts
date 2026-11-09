export interface ContactNumber {
  numero: string;
  tipo: string;
  activo: boolean;
}

export interface Student {
  id: string;
  nombres: string;
  apellidos: string;
  dpi: string;
  fechaNacimiento: string;
  genero: string;
  correo: string;
  direccion: string;
  carreraId: string;
  jornadaId: string;
  semestre: number;
  contactos: ContactNumber[];
  fechaRegistro: string;
}
