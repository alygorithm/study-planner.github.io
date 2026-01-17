// Interfaccia Task
export interface Task {
  _id?: string;
  title: string;
  description?: string;
  time?: string;
  subject?: string;
  priority?: string;
  duration?: number;
  day: string; // deve essere string per compatibilità DB
  completed?: boolean;
  completedAt?: Date | null;
}
