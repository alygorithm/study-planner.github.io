// Interfaccia Task
export interface Task {
  _id?: string;           // ID generato dal backend
  title: string;
  description?: string;
  time?: string;
  subject?: string;
  priority?: string;
  duration?: number;
  day: Date;
  completed?: boolean;
}