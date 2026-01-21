import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TaskService, FocusSession } from '../planner/task.service';
import { Task } from '../planner/task.model';
import { StudyHoursCalculator } from '../planner/hours.calculator';

// Interfaccia per le statistiche settimanali
interface DayStat {
  label: string;
  hours: number;
  percentage: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss']
})
export class StatsPage implements OnInit {

  // Tab attiva nella navigazione
  activeTab = 'stats';

  tasks: Task[] = [];
  focusSessions: FocusSession[] = [];

  totalMinutes = 0;          // totale settimana
  todayMinutes = 0;
  todayTarget = 240;         // 4h
  todayProgress = 0;

  // Statistiche task
  completedTasks = 0;
  totalTasks = 0;
  completionPercent = 0;

  // Statistiche settimanali
  weekStats: DayStat[] = [];

  // Statistiche focus
  focusTotalSessions = 0;
  focusTotalMinutes = 0;
  focusAvgMinutes = 0;
  focusLastSessions: FocusSession[] = [];

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadFocusSessions();
  }

  // Navigazione tra le sezioni dell'app
  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate([`/${page}`]);
  }

  // Recupera le task e calcola le statistiche correlate
  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks.map(t => ({
        ...t,
        completedAt: t.completedAt ? new Date(t.completedAt) : null
      }));

      this.totalTasks = this.tasks.length;
      this.completedTasks = this.tasks.filter(t => t.completed).length;
      this.completionPercent = this.totalTasks
        ? Math.round((this.completedTasks / this.totalTasks) * 100)
        : 0;

      this.calculateWeeklyTotal();
      this.calculateTodayProgress();
      this.calculateWeekStats();
    });
  }

  // Recupera le sessioni di studio (focus)
  loadFocusSessions() {
    this.taskService.getFocusSessions().subscribe(sessions => {
      this.focusSessions = sessions;

      this.focusTotalSessions = sessions.length;
      this.focusTotalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
      this.focusAvgMinutes = sessions.length ? Math.round(this.focusTotalMinutes / sessions.length) : 0;

      this.focusLastSessions = [...sessions]
        .sort((a, b) => new Date(b.day!).getTime() - new Date(a.day!).getTime())
        .slice(0, 3);
    });
  }

  // Calcola il totale della settimana (task completate)
  calculateWeeklyTotal() {
    const today = new Date();

    // Inizio settimana = lunedì
    const start = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = lunedì
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    this.totalMinutes = this.tasks
      .filter(t => t.completed && t.completedAt)
      .filter(t => {
        const d = new Date(t.completedAt!);
        return d >= start && d <= end;
      })
      .reduce((sum, t) => sum + StudyHoursCalculator.calculateTaskMinutes(t), 0);
  }

  // Calcola il progresso di studio della giornata corrente
  calculateTodayProgress() {
    const today = new Date().toDateString();

    this.todayMinutes = this.tasks
      .filter(t => t.completed && t.completedAt)
      .filter(t => t.completedAt!.toDateString() === today)
      .reduce((sum, t) => sum + StudyHoursCalculator.calculateTaskMinutes(t), 0);

    this.todayProgress = Math.min(this.todayMinutes / this.todayTarget, 1);
  }

  // Calcola le statistiche settimanali di studio
  calculateWeekStats() {
    const labels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const today = new Date();

    // Inizio settimana = lunedì
    const start = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7;
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const minutesPerDay = labels.map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      return this.tasks
        .filter(t => t.completed && t.completedAt)
        .filter(t => t.completedAt!.toDateString() === d.toDateString())
        .reduce((sum, t) => sum + StudyHoursCalculator.calculateTaskMinutes(t), 0);
    });

    const maxMinutes = Math.max(...minutesPerDay, 120); // minimo 2h per grafico visibile

    this.weekStats = minutesPerDay.map((min, i) => ({
      label: labels[i],
      hours: +(min / 60).toFixed(1),
      percentage: (min / maxMinutes) * 100
    }));
  }
}
