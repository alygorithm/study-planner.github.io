import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Task } from '../planner.page';

@Component({
  selector: 'app-task-details-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dettagli Task</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Chiudi</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>{{ task.title }}</h2>

      <p *ngIf="task.description">
        <b>Descrizione:</b><br>
        {{ task.description }}
      </p>

      <p *ngIf="task.time">
        <b>Orario:</b> {{ task.time }}
      </p>

      <ion-button expand="full" color="success" (click)="completeTask()">
        Completa task
      </ion-button>

      <ion-button expand="full" color="danger" class="ion-margin-top" (click)="deleteTask()">
        Elimina task
      </ion-button>
    </ion-content>
  `
})
export class TaskDetailsModal {

  @Input() task!: Task;

  constructor(private modalCtrl: ModalController){}

  completeTask() {
    this.modalCtrl.dismiss({ action: 'complete', task: this.task });
  }

  deleteTask() {
    this.modalCtrl.dismiss({ action: 'delete', task: this.task });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
