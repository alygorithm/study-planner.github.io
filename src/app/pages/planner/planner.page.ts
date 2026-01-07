import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddTaskModal } from './modals/add-task.modal';
import { TaskDetailsModal } from './modals/task-details.modal';

export interface Task {
  title: string;
  description?: string;
  time?: string;
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

  constructor(private router: Router, private modalController: ModalController) {}

  ngOnInit() {
    this.generateDays();
  }

  // Genera 30 giorni a partire da oggi
  generateDays() {
    const today = new Date();
    const totalDays = 30;
    for (let i = 0; i < totalDays; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      this.days.push({ date, isToday: date.toDateString() === today.toDateString() });
    }

    // Seleziona giorno corrente di default
    this.selectedDay = this.days.find(d => d.isToday) || this.days[0];
  }

  // Seleziona giorno
  selectDay(day: { date: Date, isToday: boolean }) {
    this.selectedDay = day;
  }

  // Navigazione barra in basso
  navigate(page: string) {
    this.activeTab = page;
    if (page === 'planner') this.router.navigate(['/planner']);
    // altre pagine possono essere aggiunte qui
  }

  // --- APRI MODALE PER NUOVA TASK ---
  async openAddTaskModal() {
    if (!this.selectedDay) return;

    const modal = await this.modalController.create({
      component: AddTaskModal,
      cssClass: 'add-task-modal',
      componentProps: { day: this.selectedDay.date }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        const dayKey = this.selectedDay!.date.toDateString();
        if (!this.tasks[dayKey]) this.tasks[dayKey] = [];
        this.tasks[dayKey].push(result.data);
      }
    });

    await modal.present();
  }

  // --- APRI MODALE DETTAGLI TASK ---
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

      if (result.data.action === 'delete') {
        this.tasks[dayKey] = this.tasks[dayKey].filter(t => t !== task);
      }

      if (result.data.action === 'complete') {
        this.tasks[dayKey] = this.tasks[dayKey].filter(t => t !== task);
        console.log('Task completata:', task);
      }
    });

    await modal.present();
  }
}
