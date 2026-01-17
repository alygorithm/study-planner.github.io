import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AddTaskModal } from './modals/add-task.modal';
import { TaskDetailsModal } from './modals/task-details.modal';

import { TaskService } from './task.service';
import { Task } from './task.model';

import { StudyLoadCalculator, DailyStudyLoad } from './study-load.calculator';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PlannerPage implements OnInit {

  days: { date: Date; isToday: boolean }[] = [];
  selectedDay!: { date: Date; isToday: boolean };

  tasks: { [key: string]: Task[] } = {};
  studyLoadMap: { [key: string]: DailyStudyLoad } = {};

  activeTab: string = 'planner';

  constructor(
    private router: Router,
    private modalController: ModalController,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.generateDays();
    this.fetchTasksFromBackend();
  }

  // ------------------ Giorni ------------------

  generateDays() {
    const today = new Date();
    this.days = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      this.days.push({
        date,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    this.selectedDay = this.days.find(d => d.isToday) || this.days[0];
  }

  selectDay(day: { date: Date; isToday: boolean }) {
    this.selectedDay = day;
  }

  // ------------------ Studio / Carico ------------------

  updateStudyLoad() {
    const allTasks: Task[] = [];
    Object.values(this.tasks).forEach(dayTasks => {
      dayTasks.forEach(task => {
        if (!task.completed) allTasks.push(task); // <-- FILTRO QUI
      });
    });

    const dates = this.days.map(d => d.date);
    this.studyLoadMap = StudyLoadCalculator.distributeLoad(allTasks, dates);
  }


  getSelectedDayStudyLoad(): DailyStudyLoad | null {
    if (!this.selectedDay) return null;
    return this.studyLoadMap[this.selectedDay.date.toDateString()] || null;
  }

  getSelectedDayStudyMessage(): string {
    const load = this.getSelectedDayStudyLoad();

    if (!load || (load.hours === 0 && load.minutes === 0)) {
      return 'Non sono previste ore di studio per questo giorno';
    }

    if (load.minutes === 0) {
      return `Sono previste ${load.hours} ore di studio`;
    }

    if (load.hours === 0) {
      return `Sono previsti ${load.minutes} minuti di studio`;
    }

    return `Sono previste ${load.hours} ore e ${load.minutes} minuti di studio`;
  }

  // ------------------ Task completate in fondo ------------------

  getTasksForSelectedDay(): Task[] {
    if (!this.selectedDay) return [];

    const dayKey = this.selectedDay.date.toDateString();
    const dayTasks = this.tasks[dayKey] || [];

    return [
      ...dayTasks.filter(t => !t.completed),
      ...dayTasks.filter(t => t.completed)
    ];
  }

  // ------------------ Modali ------------------

  async openAddTaskModal() {
    if (!this.selectedDay) return;

    const modal = await this.modalController.create({
      component: AddTaskModal,
      cssClass: 'add-task-modal',
      componentProps: {
        day: this.selectedDay.date
      }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.addTaskToBackend(result.data);
    });

    await modal.present();
  }

  async openTaskDetails(task: Task) {
    const modal = await this.modalController.create({
      component: TaskDetailsModal,
      cssClass: 'add-task-modal',
      componentProps: { task }
    });

    modal.onDidDismiss().then(result => {
      if (!result.data) return;

      if (result.data.action === 'delete') this.deleteTaskFromBackend(task);
      if (result.data.action === 'complete') {
        task.completed = true;
        task.completedAt = new Date();
        this.updateTaskOnBackend(task);
      }
    });

    await modal.present();
  }

  // ------------------ Backend ------------------

  fetchTasksFromBackend() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = {};

      tasks.forEach(task => {
        const key = new Date(task.day).toDateString();
        if (!this.tasks[key]) this.tasks[key] = [];
        this.tasks[key].push(task);
      });

      this.updateStudyLoad();
    });
  }

  addTaskToBackend(task: Task) {
    this.taskService.addTask(task).subscribe(newTask => {
      const key = new Date(newTask.day).toDateString();
      if (!this.tasks[key]) this.tasks[key] = [];
      this.tasks[key].push(newTask);
      this.updateStudyLoad();
    });
  }

  deleteTaskFromBackend(task: Task) {
    if (!task._id) return;

    this.taskService.deleteTask(task._id).subscribe(() => {
      const key = new Date(task.day).toDateString();
      this.tasks[key] = this.tasks[key].filter(t => t._id !== task._id);
      this.updateStudyLoad();
    });
  }

  updateTaskOnBackend(task: Task) {
    if (!task._id) return;

    this.taskService.updateTask(task).subscribe(updated => {
      const key = new Date(updated.day).toDateString();

      // 1) aggiorno la lista locale
      if (this.tasks[key]) {
        this.tasks[key] = this.tasks[key].map(t =>
          t._id === updated._id ? updated : t
        );
      }

      // 2) ricalcolo il carico
      this.updateStudyLoad();
    });
  }


  // ------------------ Navigazione ------------------

  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate([`/${page}`]);
  }
}
