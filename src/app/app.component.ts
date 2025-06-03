import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CountdownComponent } from './components/countdown/countdown.component';
import {
  TimelineComponent,
  TimelineItem,
} from './components/timeline/timeline.component';
import {
  ServiceStatusComponent,
  MilitaryServiceState,
} from './components/service-status/service-status.component';

interface Status {
  state: MilitaryServiceState;
  to?: Date;
  onDutyDays: number;
  timeOffDays: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CountdownComponent,
    TimelineComponent,
    ServiceStatusComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  startDate: Date = new Date('2025-04-08');
  endDate: Date = new Date('2026-06-01');

  currentStatus: Status = { state: 'on-duty', onDutyDays: 0, timeOffDays: 0 };

  historyTimeline: TimelineItem[] = [];
  onDutyEntries: TimelineItem[] = [];
  timeOffEntries: TimelineItem[] = [
    {
      from: new Date('2025-05-31'),
      to: new Date('2025-06-07'),
      text: 'Time Off',
      state: 'time-off',
      color: '#059669',
    },
  ];

  ngOnInit(): void {
    this.buildTimeLine();
    this.currentStatus = this.getCurrentStatus();
  }

  private buildTimeLine(): void {
    const firstTo = new Date(this.timeOffEntries[0].from);
    firstTo.setDate(firstTo.getDate() - 1);

    // Add the initial on-duty period before the first time-off entry
    this.onDutyEntries.push({
      from: new Date(this.startDate),
      to: firstTo,
      text: 'Initial training period',
      state: 'on-duty',
      color: '#1D4ED8', // Special color for the initial army training period
    });

    for (let i = 1; i < this.timeOffEntries.length; i++) {
      const itemA = this.timeOffEntries[i];
      const itemB = this.timeOffEntries[i - 1];
      if (!itemB.to) {
        break;
      }
      const newFrom = new Date(itemB.to);
      newFrom.setDate(newFrom.getDate() + 1);
      const newTo = new Date(itemA.from);
      newTo.setDate(newTo.getDate() - 1);

      if (newFrom <= newTo) {
        this.onDutyEntries.push({
          from: newFrom,
          to: newTo,
          text: 'On Duty',
          state: 'on-duty',
          color: '#DC2626',
        });
      }
    }
    if (this.onDutyEntries.length > 0) {
      this.historyTimeline = [...this.timeOffEntries, ...this.onDutyEntries];
      this.historyTimeline.sort((a, b) => a.from.getTime() - b.from.getTime());
    }

    const present = new Date();
    const lastFrom = new Date(
      this.historyTimeline[this.historyTimeline.length - 1].to ?? present
    );
    if (
      lastFrom.getDate() < present.getDate() ||
      lastFrom.getMonth() < present.getMonth() ||
      lastFrom.getFullYear() < present.getFullYear()
    ) {
      lastFrom.setDate(lastFrom.getDate() + 1);
      this.historyTimeline.push({
        from: lastFrom,
        text: 'On Duty',
        state: 'on-duty',
        color: '#DC2626',
      });
    }
  }

  getCurrentStatus(): Status {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(today);

    const currentTimeLine = this.historyTimeline.find(
      (item) => item.from <= today && (!item.to || item.to >= today)
    );

    const { onDutyDays, timeOffDays } = this.historyTimeline.reduce(
      ({ onDutyDays, timeOffDays }, item) => {
        if (item.state === 'on-duty') {
          onDutyDays += this.numberOfDays(item.from, item.to);
        } else {
          timeOffDays += this.numberOfDays(item.from, item.to);
        }
        return { onDutyDays, timeOffDays };
      },
      { onDutyDays: 0, timeOffDays: 0 }
    );

    return {
      state: currentTimeLine?.state ?? 'on-duty',
      to: currentTimeLine?.to,
      onDutyDays,
      timeOffDays,
    };
  }

  numberOfDays(from: Date, to = new Date()) {
    const diffInMs = to.getTime() - from.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    return diffInDays;
  }
}
