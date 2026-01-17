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

  private static MAX_MINUTES_PER_DAY = 240;
  private static MIN_MINUTES_PER_DAY = 30;

  private static toLocalDate(dateStr: string): Date {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static distributeLoad(
    tasks: Task[],
    days: Date[]
  ): { loadMap: { [key: string]: DailyStudyLoad }; overflow: { task: Task; missingMinutes: number }[] } {

    const loadMap: { [key: string]: DailyStudyLoad } = {};
    const overflow: { task: Task; missingMinutes: number }[] = [];

    days.forEach(day => {
      const d = new Date(day);
      d.setHours(0,0,0,0);
      loadMap[d.toDateString()] = {
        date: d,
        hours: 0,
        minutes: 0,
        tasks: [],
        assignedMinutes: 0
      };
    });

    const sortedTasks = [...tasks].sort(
      (a, b) => this.toLocalDate(a.day).getTime() - this.toLocalDate(b.day).getTime()
    );

    const today = new Date();
    today.setHours(0,0,0,0);

    for (const task of sortedTasks) {
      const totalMinutes = StudyHoursCalculator.calculateTaskMinutes(task);

      const taskDay = this.toLocalDate(task.day);

      const endDay = taskDay < today ? today : taskDay;

      const relevantDays = days
        .map(d => {
          const dd = new Date(d);
          dd.setHours(0,0,0,0);
          return dd;
        })
        .filter(d => d.getTime() <= endDay.getTime());

      if (relevantDays.length === 0) {
        overflow.push({ task, missingMinutes: totalMinutes });
        continue;
      }

      const baseMinutes = Math.floor(totalMinutes / relevantDays.length);
      const remainder = totalMinutes % relevantDays.length;

      let remaining = totalMinutes;

      const sortedRelevant = [...relevantDays].sort((a,b) => b.getTime() - a.getTime());

      for (let i = 0; i < sortedRelevant.length; i++) {
        const day = sortedRelevant[i];
        const key = day.toDateString();
        const load = loadMap[key];

        const currentMinutes = load.assignedMinutes;
        if (currentMinutes >= this.MAX_MINUTES_PER_DAY) continue;

        let assign = baseMinutes + (i < remainder ? 1 : 0);
        if (assign < this.MIN_MINUTES_PER_DAY) assign = this.MIN_MINUTES_PER_DAY;

        const available = this.MAX_MINUTES_PER_DAY - currentMinutes;
        const finalAssign = Math.min(available, assign);

        if (finalAssign <= 0) continue;

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
