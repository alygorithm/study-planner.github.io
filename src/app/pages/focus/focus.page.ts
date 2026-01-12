import { Component, OnDestroy } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-focus',
  templateUrl: './focus.page.html',
  styleUrls: ['./focus.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FocusPage implements OnDestroy {

  timerMinutes: number = 25;
  timerSeconds: number = 0;
  isRunning: boolean = false;
  private intervalId: any;

  private timerCompleted: boolean = false; // indica se il timer è arrivato a 0

  constructor(private router: Router, private alertCtrl: AlertController) {}

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerCompleted = false; // reset

    this.intervalId = setInterval(() => {
      if (this.timerSeconds === 0) {
        if (this.timerMinutes === 0) {
          this.stopTimer(true); // il timer è finito
          return;
        }
        this.timerMinutes--;
        this.timerSeconds = 59;
      } else {
        this.timerSeconds--;
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.intervalId);
  }

  resetTimer() {
    this.pauseTimer();
    this.timerMinutes = 25;
    this.timerSeconds = 0;
    this.timerCompleted = false;
  }

  stopTimer(completed: boolean = false) {
    this.isRunning = false;
    clearInterval(this.intervalId);

    if (completed) {
      this.timerCompleted = true;
      this.showTimeFinishedAlert();
    }
  }

  // alert "tempo finito"
  async showTimeFinishedAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Tempo finito!',
      message: 'Hai completato il focus. Prenditi una pausa!',
      buttons: ['OK']
    });
    await alert.present();
  }

  // alert di conferma uscita
  async closeFocus() {
    if (this.isRunning) {
      const confirm = await this.alertCtrl.create({
        header: 'Timer attivo',
        message: 'Il timer è ancora attivo. Vuoi davvero uscire?',
        buttons: [
          { text: 'Annulla', role: 'cancel' },
          { 
            text: 'Esci', 
            role: 'destructive',
            handler: () => {
              this.pauseTimer();       // ferma il timer
              this.router.navigate(['/planner']); // torna al planner
            }
          }
        ]
      });
      await confirm.present();
    } else {
      this.router.navigate(['/planner']);
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
