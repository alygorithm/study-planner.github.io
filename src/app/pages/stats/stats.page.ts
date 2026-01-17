import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService, FocusSession } from '../planner/task.service';
import { Task } from '../planner/task.model';

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

  activeTab: string = 'stats';

  focusSessions: FocusSession[] = [];
  tasks: Task[] = [];

  totalMinutes = 0;
  todayMinutes = 0;
  todayTarget = 50;
  todayProgress = 0;

  completedTasks = 0;
  totalTasks = 0;
  completionPercent = 0;

  completedMinutesTotal = 0;
  completedMinutesToday = 0;

  weekStats: DayStat[] = [];

  constructor(
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.loadFocusSessions();
    this.loadTasks();
  }

  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate(['/' + page]);
  }

  loadFocusSessions() {
    this.taskService.getFocusSessions().subscribe({
      next: sessions => {
        this.focusSessions = sessions;

        this.totalMinutes = sessions.reduce(
          (sum, s) => sum + s.minutes,
          0
        );

        const today = new Date().toDateString();
        this.todayMinutes = sessions
          .filter(s => new Date(s.day || '').toDateString() === today)
          .reduce((sum, s) => sum + s.minutes, 0);

        this.todayProgress = Math.min(
          this.todayMinutes / this.todayTarget,
          1
        );

        this.calculateWeekStats();
      },
      error: err => console.error('Errore statistiche:', err)
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: tasks => {
        this.tasks = tasks.map(t => ({
          ...t,
          completedAt: t.completedAt ? new Date(t.completedAt) : null
        }));

        this.totalTasks = this.tasks.length;
        this.completedTasks = this.tasks.filter(t => t.completed).length;
        this.completionPercent = this.totalTasks
          ? Math.round((this.completedTasks / this.totalTasks) * 100)
          : 0;

        const today = new Date().toDateString();

        this.completedMinutesTotal = this.tasks
          .filter(t => t.completed && t.completedAt)
          .reduce((sum, t) => sum + (t.duration || 0), 0);

        this.completedMinutesToday = this.tasks
          .filter(t => t.completed && t.completedAt)
          .filter(t => t.completedAt && t.completedAt.toDateString() === today)
          .reduce((sum, t) => sum + (t.duration || 0), 0);

        this.calculateWeekStats();
      },
      error: err => console.error('Errore caricamento tasks:', err)
    });
  }


  private calculateWeekStats() {
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    this.weekStats = weekDays.map((label, index) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + index);

      const minutes = this.tasks
        .filter(t => t.completed && t.completedAt)
        .filter(t => t.completedAt && t.completedAt.toDateString() === day.toDateString())
        .reduce((sum, t) => sum + (t.duration || 0), 0);

      return {
        label,
        hours: +(minutes / 60).toFixed(1),
        percentage: Math.min((minutes / 60) / 3 * 100, 100)
      };
    });
  }
}
