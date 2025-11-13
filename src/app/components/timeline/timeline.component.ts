import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MilitaryServiceState } from '../service-status/service-status.component';

export interface TimelineItem {
  from: Date;
  to?: Date;
  text: string;
  state: MilitaryServiceState;
  color?: string;
}

export class TimeOff implements TimelineItem {
  from: Date;
  to?: Date;
  text: string = 'Time Off';
  state: MilitaryServiceState = 'time-off';
  color?: string = '#059669';
  constructor({ from, to }: { from: Date; to?: Date }) {
    this.from = from;
    this.to = to;
  }
}
@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];

  formatToDate(date?: Date): string {
    return new DatePipe('en-US').transform(date) || 'Present';
  }

  numberOfDays(from: Date, to = new Date()) {
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const diffInMs = to.getTime() - from.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
  }
}
