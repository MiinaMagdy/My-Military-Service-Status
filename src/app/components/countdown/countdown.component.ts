import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
  daysRemaining: number = 0;
  @Input() endDate!: Date;

  ngOnInit() {
    this.calculateDaysRemaining(this.endDate);
    setInterval(() => {
      return this.calculateDaysRemaining(this.endDate);
    }, 1000 * 60 * 60); // Update daily
  }

  private calculateDaysRemaining(endTime: Date): void {
    const diffTime = endTime.getTime() - Date.now();
    this.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
