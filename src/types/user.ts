export type UserType = 
  | 'administrador-general'
  | 'jefe-departamento' 
  | 'docente'
  | 'tutor'
  | 'coordinador-tutorias'
  | 'control-escolar'
  | 'subdireccion-academica';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  permissions: string[];
  institution?: string;
}

export const USER_TYPES = {
  'administrador-general': 'Administrador General',
  'jefe-departamento': 'Jefe de Departamento',
  'docente': 'Docente',
  'tutor': 'Tutor',
  'coordinador-tutorias': 'Coordinador de Tutorías',
  'control-escolar': 'Control Escolar',
  'subdireccion-academica': 'Subdirección Académica'
};