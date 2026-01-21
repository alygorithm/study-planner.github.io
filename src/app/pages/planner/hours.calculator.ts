import { Task } from "./task.model";

export class StudyHoursCalculator {

<<<<<<< HEAD
  // Mappa priorità → minuti suggeriti per la task
  private static PRIORITY_MINUTES: { [key: string]: number } = {
    alta: 120,
    media: 90,
    bassa: 60
  };

  // Calcola i minuti da assegnare a una task in base alla priorità
  static calculateTaskMinutes(task: Task): number {
    const priority = (task.priority || 'media').toLowerCase();
    return this.PRIORITY_MINUTES[priority] ?? 90;
=======
  private static PRIORITY_HOURS: { [key: string]: number } = {
    alta: 2,
    media: 1.5,
    bassa: 1
  };

  static calculateTaskHours(task: Task): number {
    if (task.duration && task.duration > 0) {
      return task.duration;
    }

    if (!task.priority) return 1;

    const priority = task.priority.toLowerCase();
    return this.PRIORITY_HOURS[priority] ?? 1;
  }

  static calculateTaskMinutes(task: Task): number {
    return Math.round(this.calculateTaskHours(task) * 60);
  }

  static formatHours(decimal: number): { hours: number; minutes: number } {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return { hours, minutes };
>>>>>>> 87382aa (fixed study load distribution and update stats calculations)
  }
}
