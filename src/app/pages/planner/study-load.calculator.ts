import { Task } from "./task.model";
import { StudyHoursCalculator } from "./hours.calculator";

export interface DailyStudyLoad {
  date: Date;
  hours: number;
  minutes: number;
  tasks: Task[];
  assignedMinutes: number;
}

export class StudyLoadCalculator {

  private static MAX_MINUTES_PER_DAY = 240; // 4 ore
  private static MIN_MINUTES_PER_DAY = 30;  // minimo realistico per giorno

  static distributeLoad(
    tasks: Task[],
    days: Date[]
  ): { loadMap: { [key: string]: DailyStudyLoad }; overflow: { task: Task; missingMinutes: number }[] } {

    const loadMap: { [key: string]: DailyStudyLoad } = {};
    const overflow: { task: Task; missingMinutes: number }[] = [];

    days.forEach(day => {
      loadMap[day.toDateString()] = {
        date: day,
        hours: 0,
        minutes: 0,
        tasks: [],
        assignedMinutes: 0
      };
    });

    // ordina per scadenza più vicina
    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    );

    for (const task of sortedTasks) {
      const totalMinutes = StudyHoursCalculator.calculateTaskMinutes(task);

      const taskDeadline = new Date(task.day);
      const today = new Date();
      today.setHours(0,0,0,0);

      const deadline = new Date(taskDeadline);
      deadline.setHours(0,0,0,0);

      // giorni disponibili fino alla scadenza
      const daysAvailable = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000*60*60*24)) + 1);

      // se la scadenza è fuori dal range dei giorni, usa solo i giorni disponibili nel calendario
      const relevantDays = days.filter(d => d.getTime() <= deadline.getTime());

      if (relevantDays.length === 0) {
        overflow.push({ task, missingMinutes: totalMinutes });
        continue;
      }

      // Distribuzione base: minuti per giorno
      const baseMinutes = Math.floor(totalMinutes / relevantDays.length);
      const remainder = totalMinutes % relevantDays.length;

      let remaining = totalMinutes;

      // assegna prima ai giorni più vicini alla scadenza (reverse)
      const sortedRelevant = [...relevantDays].sort((a,b) => b.getTime() - a.getTime());

      for (let i = 0; i < sortedRelevant.length; i++) {
        const day = sortedRelevant[i];
        const key = day.toDateString();
        const load = loadMap[key];

        const currentMinutes = load.assignedMinutes;
        if (currentMinutes >= this.MAX_MINUTES_PER_DAY) continue;

        let assign = baseMinutes + (i < remainder ? 1 : 0);

        // evita assegnazioni ridicole
        if (assign < this.MIN_MINUTES_PER_DAY) assign = this.MIN_MINUTES_PER_DAY;

        const available = this.MAX_MINUTES_PER_DAY - currentMinutes;
        const finalAssign = Math.min(available, assign);

        load.assignedMinutes += finalAssign;
        load.hours = Math.floor(load.assignedMinutes / 60);
        load.minutes = load.assignedMinutes % 60;

        load.tasks.push(task);

        remaining -= finalAssign;
        if (remaining <= 0) break;
      }

      if (remaining > 0) {
        overflow.push({ task, missingMinutes: remaining });
      }
    }

    return { loadMap, overflow };
  }
}