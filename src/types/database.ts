// Temporary type definitions until Supabase types are regenerated
export interface Profile {
  id: string;
  name: string;
  email: string;
  user_type: 'professor' | 'aluno';
  created_at?: string;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  period: string;
  schedule: string | null;
  max_absences: number;
  total_classes: number;
  created_at?: string;
  archived: boolean;
}

export interface Enrollment {
  id: string;
  classroom_id: string;
  student_id: string;
  enrolled_at?: string;
}

export interface Attendance {
  id: string;
  classroom_id: string;
  student_id: string;
  date: string;
  status: 'presente' | 'falta' | 'falta_justificada';
  notes: string | null;
  created_at?: string;
}