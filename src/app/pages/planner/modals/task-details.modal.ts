import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Task } from '../task.model';

@Component({
  selector: 'app-task-details-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dettagli Task</ion-title>

        <ion-buttons slot="end">
          <ion-button class="close-btn" (click)="close()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="task-details-card"
           [ngClass]="{ completed: isCompleting, deleting: isDeleting }">
        <h2>{{ task.title }}</h2>

        <p *ngIf="task.description">
          <b>Descrizione: </b><br>
          {{ task.description }}
        </p>

        <p *ngIf="task.subject || task.time">
          <b>Materia: </b><span class="task-meta">
            {{ task.subject }}
            <span *ngIf="task.time">- ore {{ task.time }}</span>
          </span>
        </p>

        <p *ngIf="task.priority">
          <b>Priorità: </b> {{ task.priority | titlecase }}
        </p>

        <div class="task-buttons">
          <ion-button expand="block" class="complete-btn"
                      (click)="completeTask()"
                      [disabled]="isCompleting || isDeleting">
            Completa Task
          </ion-button>

          <ion-button expand="block" class="delete-btn"
                      (click)="deleteTask()"
                      [disabled]="isCompleting || isDeleting">
            Elimina Task
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./task-details.modal.scss']
})
export class TaskDetailsModal {
  @Input() task!: Task;

  isCompleting = false;
  isDeleting = false;

  constructor(private modalCtrl: ModalController){}

  completeTask() {
    if (this.isCompleting || this.isDeleting) return;
    this.isCompleting = true;

    const card = document.querySelector('.task-details-card');
    if (card) card.classList.add('completed');

    setTimeout(() => {
      this.modalCtrl.dismiss({ action: 'complete', task: this.task });
    }, 250);
  }

  deleteTask() {
    if (this.isDeleting || this.isCompleting) return;
    this.isDeleting = true;

    setTimeout(() => {
      this.modalCtrl.dismiss({ action: 'delete', task: this.task });
    }, 400);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
