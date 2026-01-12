import { Task } from "./planner.page";
import { StudyHoursCalculator } from "./hours.calculator";

export interface DailyStudyLoad {
  hours: number;
  tasks: Task[];
}

export class StudyLoadCalculator {

  /**
   * Calcola il carico di studio per un giorno specifico.
   * Distribuisce le ore delle task dei giorni futuri tra i giorni precedenti.
   */
  static calculateLoadForDay(
    allTasks: { [key: string]: Task[] },
    targetDay: Date
  ): DailyStudyLoad {

    let totalHours = 0;
    const contributingTasks: Task[] = [];

    const today = new Date();
    today.setHours(0,0,0,0);
    targetDay.setHours(0,0,0,0);

    for (const dayKey in allTasks) {
      const dayTasks = allTasks[dayKey];
      for (const task of dayTasks) {
        const taskDay = new Date(task.day);
        taskDay.setHours(0,0,0,0);

        // Ignora task già passate
        if (taskDay < targetDay) continue;

        const weightedHours = StudyHoursCalculator.calculateTaskHours(task);

        // Numero di giorni disponibili: da oggi al giorno della task
        const daysUntilTask = Math.ceil((taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const distributionDays = Math.max(daysUntilTask, 1); // almeno 1 giorno

        const dailyShare = weightedHours / distributionDays;

        // Controlla se targetDay rientra nella distribuzione
        const dayIndexFromToday = Math.ceil((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndexFromToday <= distributionDays) {
          totalHours += dailyShare;
          contributingTasks.push(task);
        }
      }
    }

    return {
      hours: Math.round(totalHours * 10) / 10, // arrotondato a 1 decimale
      tasks: contributingTasks
    };
  }
}