import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TaskService, FocusSession } from '../planner/task.service';
import { Task } from '../planner/task.model';
import { StudyHoursCalculator } from '../planner/hours.calculator';

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

  activeTab = 'stats';

  tasks: Task[] = [];
  focusSessions: FocusSession[] = [];

  todayMinutes = 0;
  todayTarget = 240;
  todayProgress = 0;

  completedTasks = 0;
  totalTasks = 0;

  weekStats: DayStat[] = [];

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

  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate([`/${page}`]);
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks.map(t => ({
        ...t,
        completedAt: t.completedAt ? new Date(t.completedAt) : null
      }));

      this.totalTasks = this.tasks.length;
      this.completedTasks = this.tasks.filter(t => t.completed).length;

      this.calculateTodayProgress();
      this.calculateWeekStats();
    });
  }

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

  calculateTodayProgress() {
    const today = new Date().toDateString();

    this.todayMinutes = this.tasks
      .filter(t => t.completed && t.completedAt)
      .filter(t => t.completedAt!.toDateString() === today)
      .reduce((sum, t) => sum + StudyHoursCalculator.calculateTaskMinutes(t), 0);

    this.todayProgress = Math.min(this.todayMinutes / this.todayTarget, 1);
  }

  calculateWeekStats() {
    const labels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const today = new Date();

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

    const maxMinutes = Math.max(...minutesPerDay, 1);

    this.weekStats = minutesPerDay.map((min, i) => ({
      label: labels[i],
      hours: +(min / 60).toFixed(1),
      percentage: (min / maxMinutes) * 100
    }));
  }
}
