import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AddTaskModal } from './modals/add-task.modal';
import { TaskDetailsModal } from './modals/task-details.modal';

import { TaskService } from './task.service';
import { Task } from './task.model';

import { StudyLoadCalculator, DailyStudyLoad } from './study-load.calculator';
import { StudyHoursCalculator } from './hours.calculator';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss']
})
export class PlannerPage implements OnInit {

  days: { date: Date; isToday: boolean }[] = [];
  selectedDay!: { date: Date; isToday: boolean };

  tasks: { [key: string]: Task[] } = {};
  studyLoadMap: { [key: string]: DailyStudyLoad } = {};

  activeTab = 'planner';

  public StudyHoursCalculator = StudyHoursCalculator;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.generateDays();
    this.fetchTasks();
  }

  generateDays() {
    const today = new Date();
    this.days = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      this.days.push({
        date: d,
        isToday: d.toDateString() === today.toDateString()
      });
    }

    this.selectedDay = this.days.find(d => d.isToday)!;
  }

  selectDay(day: any) {
    this.selectedDay = day;
  }

  studyOverflow: { task: Task; missingMinutes: number }[] = [];

  updateStudyLoad() {
    const pendingTasks: Task[] = [];

    Object.values(this.tasks).forEach(arr => {
      arr.forEach(t => {
        if (!t.completed) pendingTasks.push(t);
      });
    });

    const dates = this.days.map(d => d.date);
    const result = StudyLoadCalculator.distributeLoad(pendingTasks, dates);

    this.studyLoadMap = result.loadMap;
    this.studyOverflow = result.overflow;
  }

  getSelectedDayStudyLoad(): DailyStudyLoad | null {
    if (!this.selectedDay) return null;
    return this.studyLoadMap[this.selectedDay.date.toDateString()] ?? null;
  }

  getSelectedDayStudyMessage(): string {
    const load = this.getSelectedDayStudyLoad();
    if (!load || (load.hours === 0 && load.minutes === 0)) {
      return 'Non sono previste ore di studio per questo giorno';
    }
    if (load.minutes === 0) return `Sono previste ${load.hours} ore di studio`;
    if (load.hours === 0) return `Sono previsti ${load.minutes} minuti di studio`;
    return `Sono previste ${load.hours} ore e ${load.minutes} minuti di studio`;
  }

  getTasksForSelectedDay(): Task[] {
    const key = this.selectedDay.date.toDateString();
    const dayTasks = this.tasks[key] || [];
    return [
      ...dayTasks.filter(t => !t.completed),
      ...dayTasks.filter(t => t.completed)
    ];
  }

  async openAddTaskModal() {
    const modal = await this.modalCtrl.create({
      component: AddTaskModal,
      componentProps: { day: this.selectedDay.date.toISOString() }
    });

    modal.onDidDismiss().then(res => {
      if (res.data) this.addTask(res.data);
    });

    await modal.present();
  }

  async openTaskDetails(task: Task) {
    const modal = await this.modalCtrl.create({
      component: TaskDetailsModal,
      componentProps: { task }
    });

    modal.onDidDismiss().then(res => {
      if (!res.data) return;

      if (res.data.action === 'delete') this.deleteTask(task);
      if (res.data.action === 'complete') {
        task.completed = true;
        task.completedAt = new Date();
        this.updateTask(task);
      }
    });

    await modal.present();
  }

  fetchTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = {};
      tasks.forEach(t => {
        const key = new Date(t.day).toDateString();
        if (!this.tasks[key]) this.tasks[key] = [];
        this.tasks[key].push(t);
      });
      this.updateStudyLoad();
    });
  }

  addTask(task: Task) {
    this.taskService.addTask(task).subscribe(newTask => {
      const key = new Date(newTask.day).toDateString();
      if (!this.tasks[key]) this.tasks[key] = [];
      this.tasks[key].push(newTask);
      this.updateStudyLoad();
    });
  }

  deleteTask(task: Task) {
    if (!task._id) return;
    this.taskService.deleteTask(task._id).subscribe(() => {
      const key = new Date(task.day).toDateString();
      this.tasks[key] = this.tasks[key].filter(t => t._id !== task._id);
      this.updateStudyLoad();
    });
  }

  updateTask(task: Task) {
    if (!task._id) return;
    this.taskService.updateTask(task).subscribe(updated => {
      const key = new Date(updated.day).toDateString();
      this.tasks[key] = this.tasks[key].map(t =>
        t._id === updated._id ? updated : t
      );
      this.updateStudyLoad();
    });
  }

  getTaskMinutes(task: Task): number {
    return StudyHoursCalculator.calculateTaskMinutes(task);
  }

  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate([`/${page}`]);
  }
}
