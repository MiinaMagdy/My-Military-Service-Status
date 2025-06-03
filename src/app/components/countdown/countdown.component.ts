import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
  daysRemaining: number = 0;

  ngOnInit() {
    this.calculateDaysRemaining();
    setInterval(() => this.calculateDaysRemaining(), 86400000); // Update daily
  }

  private calculateDaysRemaining(): void {
    const target = new Date('2026-06-01');
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    this.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
