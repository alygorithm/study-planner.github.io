import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage {
  activeTab: string = 'profile';

  constructor(private router: Router) {}

  navigate(page: string) {
    this.activeTab = page;
    this.router.navigate(['/' + page]);
  }

  user = {
    name: 'Alina Rosi',
    email: 'alina@example.com'
  };

  stats = {
    completedTasks: 42,
    studyHours: 120,
    completionPercent: 85
  };
}