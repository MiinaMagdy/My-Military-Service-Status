import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MilitaryServiceState = 'on-duty' | 'time-off';

@Component({
  selector: 'app-service-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-status.component.html',
  styleUrls: ['./service-status.component.scss'],
})
export class ServiceStatusComponent {
  @Input() currentStatus: MilitaryServiceState = 'on-duty';
  @Input() endDate?: Date;
  @Input() timeOffDays: number = 0;
  @Input() onDutyDays: number = 0;

  getStatusText(): string {
    switch (this.currentStatus) {
      case 'on-duty':
        return 'On Duty';
      case 'time-off':
        return 'Time Off';
      default:
        return 'Unknown';
    }
  }
}
