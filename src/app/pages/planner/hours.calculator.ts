import { Task } from "./task.model";

export class StudyHoursCalculator {

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
  }
}
