import { Task } from "./planner.page";

/**
 * Calcola le ore di una singola task in base alla priorità
 */
export class StudyHoursCalculator {

  // Mappa priorità → ore di studio previste
  private static PRIORITY_HOURS: { [key: string]: number } = {
    alta: 2,
    media: 1.5,
    bassa: 1
  };

  /**
   * Calcola le ore di una task
   * @param task Task
   * @returns ore previste
   */
  static calculateTaskHours(task: Task): number {
    if (!task.priority) return 1; // default se non specificata
    const priority = task.priority.toLowerCase();
    return this.PRIORITY_HOURS[priority] || 1;
  }

  /**
   * Somma le ore di tutte le task di un giorno
   */
  static calculateDayHours(tasks: Task[]): number {
    return tasks.reduce((sum, t) => sum + this.calculateTaskHours(t), 0);
  }
}