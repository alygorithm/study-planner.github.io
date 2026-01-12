import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../planner.page';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `

    <ion-header>
      <ion-toolbar>
        <ion-title><b>Aggiungi Task</b></ion-title>
        <ion-buttons slot="end">
          <ion-button class="close-btn" (click)="close()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding add-task-modal">

      <!-- Campo Data -->
      <ion-item>
        <ion-label position="stacked">Data</ion-label>
        <ion-datetime display-format="DD/MM/YYYY" picker-format="DD/MM/YYYY" [(ngModel)]="taskDate"></ion-datetime>
      </ion-item>

      <!-- Titolo -->
      <ion-item>
        <ion-label position="stacked">Titolo</ion-label>
        <ion-input [(ngModel)]="taskTitle"></ion-input>
      </ion-item>

      <!-- Descrizione -->
      <ion-item>
        <ion-label position="stacked">Descrizione</ion-label>
        <ion-textarea [(ngModel)]="taskDescription"></ion-textarea>
      </ion-item>

      <!-- Materia -->
      <ion-item>
        <ion-label position="stacked">Materia</ion-label>
        <ion-input [(ngModel)]="taskSubject"></ion-input>
      </ion-item>

      <!-- Priorità -->
      <ion-item>
        <ion-label position="stacked">Priorità</ion-label>
        <ion-select [(ngModel)]="taskPriority">
          <ion-select-option value="alta">Alta</ion-select-option>
          <ion-select-option value="media">Media</ion-select-option>
          <ion-select-option value="bassa">Bassa</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Durata stimata -->
      <ion-item>
        <ion-label position="stacked">Durata stimata (min)</ion-label>
        <ion-input type="number" [(ngModel)]="taskDuration"></ion-input>
      </ion-item>

      <!-- Pulsante Salva -->
      <ion-button expand="full" class="save-btn" (click)="saveTask()">Salva</ion-button>
    </ion-content>
  `,
  styleUrls: ['./add-task.modal.scss']
})
export class AddTaskModal {

  @Input() day!: Date;  // giorno selezionato nel planner

  taskDate: string = '';       // data scelta dall’utente
  taskTitle = '';
  taskDescription = '';
  taskTime = '';
  taskSubject = '';
  taskPriority = 'media';
  taskDuration?: number;

  constructor(private modalCtrl: ModalController) {}

  saveTask() {
    if (!this.taskTitle.trim()) return;

    // Salva la task usando la data scelta, altrimenti usa il giorno passato dal planner
    const newTask: Task & { day: Date } = {
      title: this.taskTitle.trim(),
      description: this.taskDescription.trim(),
      time: this.taskTime,
      subject: this.taskSubject.trim(),
      priority: this.taskPriority,
      duration: this.taskDuration,
      day: this.taskDate ? new Date(this.taskDate) : this.day
    };

    this.modalCtrl.dismiss(newTask);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}