import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss']
})

export class StatsPage {
    activeTab: string = 'stats';

    constructor(private router: Router) {}

    navigate(page: string) {
        this.activeTab = page;
        this.router.navigate(['/' + page]);
    }
}