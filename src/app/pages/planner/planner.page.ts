import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddTaskModal } from './modals/add-task.modal';
import { TaskDetailsModal } from './modals/task-details.modal';
import { StudyHoursCalculator } from './hours.calculator';
import { StudyLoadCalculator, DailyStudyLoad } from './study-load.calculator';

export interface Task {
  title: string;
  description?: string;
  time?: string;
  subject?: string;
  priority?: string;
  duration?: number;
  day: Date;
}

@Component({
  selector: 'app-planner',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PlannerPage implements OnInit {

  // Calendario
  days: { date: Date, isToday: boolean }[] = [];
  selectedDay: { date: Date, isToday: boolean } | null = null;

  // Tab attiva della barra di navigazione
  activeTab: string = 'planner';

  // Task dinamiche per giorno
  tasks: { [key: string]: Task[] } = {};

  // Mappa ore studio per giorno
  studyLoadMap: { [key: string]: number } = {};

  constructor(private router: Router, private modalController: ModalController) {}

  ngOnInit() {
    this.generateDays();
    this.updateStudyLoadMap();
  }

  // --- GENERA CALENDARIO ---
  generateDays() {
    const today = new Date();
    const totalDays = 30;
    for (let i = 0; i < totalDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      this.days.push({ date, isToday: date.toDateString() === today.toDateString() });
    }

    this.selectedDay = this.days.find(d => d.isToday) || this.days[0];
  }

  // --- SELEZIONA GIORNO ---
  selectDay(day: { date: Date, isToday: boolean }) {
    this.selectedDay = day;
  }

  // --- NAVIGAZIONE BARRA INFERIORE ---
  navigate(page: string) {
    this.activeTab = page;
    switch(page) {
      case 'planner': this.router.navigate(['/planner']); break;
      case 'focus': this.router.navigate(['/focus']); break;
      case 'profile': this.router.navigate(['/profile']); break;
      case 'stats': this.router.navigate(['/stats']); break;
    }
  }

  // --- MODALE NUOVA TASK ---
  async openAddTaskModal() {
    if (!this.selectedDay) return;

    const modal = await this.modalController.create({
      component: AddTaskModal,
      cssClass: 'add-task-modal',
      componentProps: { day: this.selectedDay.date }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        const dayKey = new Date(result.data.day).toDateString();
        if (!this.tasks[dayKey]) this.tasks[dayKey] = [];
        this.tasks[dayKey].push(result.data);

        // aggiorna ore studio
        this.updateStudyLoadMap();
      }
    });

    await modal.present();
  }

  // --- MODALE DETTAGLI TASK ---
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

      if (result.data.action === 'delete' || result.data.action === 'complete') {
        this.tasks[dayKey] = this.tasks[dayKey].filter(t => t !== task);
        this.updateStudyLoadMap();
      }
    });

    await modal.present();
  }

  // --- CALCOLO ORE TASK DEL GIORNO SELEZIONATO ---
  getStudyHoursForSelectedDay(): number {
    if(!this.selectedDay) return 0;

    const dayKey = this.selectedDay.date.toDateString();
    const dayTasks = this.tasks[dayKey] || [];
    return StudyHoursCalculator.calculateDayHours(dayTasks);
  }

  // --- CARICO STUDIO PER IL GIORNO SELEZIONATO (distribuito) ---
  getTodayStudyLoad(): DailyStudyLoad | null {
    if(!this.selectedDay) return null;

    return StudyLoadCalculator.calculateLoadForDay(
      this.tasks,
      this.selectedDay.date
    );
  }

  // --- AGGIORNA STUDY LOAD MAP ---
  updateStudyLoadMap() {
    this.studyLoadMap = {};
    for (const day of this.days) {
      const dayKey = day.date.toDateString();
      const load = StudyLoadCalculator.calculateLoadForDay(this.tasks, day.date);
      this.studyLoadMap[dayKey] = load.hours;
    }
  }
}