import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddTaskModal } from './modals/add-task.modal';
import { TaskDetailsModal } from './modals/task-details.modal';
import { StudyHoursCalculator } from './hours.calculator';
import { StudyLoadCalculator, DailyStudyLoad } from './study-load.calculator';
import { TaskService } from './task.service';
import { Task } from './task.model';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule] // <-- niente HttpClientModule qui
})

export class PlannerPage implements OnInit {
  days: { date: Date, isToday: boolean }[] = [];
  selectedDay: { date: Date, isToday: boolean } | null = null;
  activeTab: string = 'planner';
  tasks: { [key: string]: Task[] } = {};
  studyLoadMap: { [key: string]: number } = {};

  constructor(
    private router: Router,
    private modalController: ModalController,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.generateDays();
    this.fetchTasksFromBackend();
    this.updateStudyLoadMap();
  }

  generateDays() {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      this.days.push({ date, isToday: date.toDateString() === today.toDateString() });
    }
    this.selectedDay = this.days.find(d => d.isToday) || this.days[0];
  }

  selectDay(day: { date: Date, isToday: boolean }) {
    this.selectedDay = day;
  }

  navigate(page: string) {
    this.activeTab = page;
    switch(page) {
      case 'planner': this.router.navigate(['/planner']); break;
      case 'focus': this.router.navigate(['/focus']); break;
      case 'profile': this.router.navigate(['/profile']); break;
      case 'stats': this.router.navigate(['/stats']); break;
    }
  }

  async openAddTaskModal() {
    if (!this.selectedDay) return;
    const modal = await this.modalController.create({
      component: AddTaskModal,
      cssClass: 'add-task-modal',
      componentProps: { day: this.selectedDay.date }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) this.addTaskToBackend(result.data);
    });

    await modal.present();
  }

  async openTaskDetails(task: Task) {
    if (!this.selectedDay) return;
    const modal = await this.modalController.create({
      component: TaskDetailsModal,
      cssClass: 'add-task-modal',
      componentProps: { task }
    });

    modal.onDidDismiss().then(result => {
      if (!result.data) return;
      const dayKey = this.selectedDay!.date.toDateString();
      if (result.data.action === 'delete') this.deleteTaskFromBackend(task);
      if (result.data.action === 'complete') {
        task.completed = true;
        this.updateTaskOnBackend(task);
      }
    });

    await modal.present();
  }

  getStudyHoursForSelectedDay(): number {
    if(!this.selectedDay) return 0;
    const dayKey = this.selectedDay.date.toDateString();
    return StudyHoursCalculator.calculateDayHours(this.tasks[dayKey] || []);
  }

  getTodayStudyLoad(): DailyStudyLoad | null {
    if(!this.selectedDay) return null;
    return StudyLoadCalculator.calculateLoadForDay(this.tasks, this.selectedDay.date);
  }

  updateStudyLoadMap() {
    this.studyLoadMap = {};
    for (const day of this.days) {
      const dayKey = day.date.toDateString();
      const load = StudyLoadCalculator.calculateLoadForDay(this.tasks, day.date);
      this.studyLoadMap[dayKey] = load.hours;
    }
  }

  // ------------------ Backend ------------------

  fetchTasksFromBackend() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = {};
      tasks.forEach(task => {
        const dayKey = new Date(task.day).toDateString();
        if (!this.tasks[dayKey]) this.tasks[dayKey] = [];
        this.tasks[dayKey].push(task);
      });
      this.updateStudyLoadMap();
    });
  }

  addTaskToBackend(task: Task) {
    console.log('Invio task al backend:', task); // PASSO 3a: log
    this.taskService.addTask(task).subscribe(newTask => {
      console.log('Task salvata dal backend:', newTask); // PASSO 3b: log ritorno
      const dayKey = new Date(newTask.day).toDateString();
      if (!this.tasks[dayKey]) this.tasks[dayKey] = [];
        this.tasks[dayKey].push(newTask);
        this.updateStudyLoadMap();
    });
}


  deleteTaskFromBackend(task: Task) {
    if (!task._id) return;
    this.taskService.deleteTask(task._id).subscribe(() => {
      const dayKey = new Date(task.day).toDateString();
      this.tasks[dayKey] = this.tasks[dayKey].filter(t => t._id !== task._id);
      this.updateStudyLoadMap();
    });
  }

  updateTaskOnBackend(task: Task) {
    if (!task._id) return;
    this.taskService.updateTask(task).subscribe(updated => {
      const dayKey = new Date(updated.day).toDateString();
      this.tasks[dayKey] = this.tasks[dayKey].map(t => t._id === updated._id ? updated : t);
      this.updateStudyLoadMap();
    });
  }
}