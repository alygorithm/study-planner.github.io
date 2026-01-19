import { Task } from "./task.model";

export class StudyHoursCalculator {

  private static PRIORITY_MINUTES: { [key: string]: number } = {
    alta: 120,
    media: 90,
    bassa: 60
  };

  static calculateTaskMinutes(task: Task): number {
    const priority = (task.priority || 'media').toLowerCase();
    return this.PRIORITY_MINUTES[priority] ?? 90;
  }
}