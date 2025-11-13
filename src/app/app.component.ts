import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CountdownComponent } from './components/countdown/countdown.component';
import {
  TimelineComponent,
  TimelineItem,
  TimeOff,
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
  startDate: Date = new Date('2025-04-08 00:00:00');
  endDate: Date = new Date('2026-06-01 00:00:00');

  currentStatus: Status = { state: 'on-duty', onDutyDays: 0, timeOffDays: 0 };

  historyTimeline: TimelineItem[] = [];
  onDutyEntries: TimelineItem[] = [];
  timeOffEntries: TimeOff[] = [
    new TimeOff({
      from: new Date('2025-05-31 00:00:00'),
      to: new Date('2025-06-07 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-07-03 00:00:00'),
      to: new Date('2025-07-09 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-08-03 00:00:00'),
      to: new Date('2025-08-09 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-08-31 00:00:00'),
      to: new Date('2025-09-08 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-09-24 00:00:00'),
      to: new Date('2025-09-30 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-10-19 00:00:00'),
      to: new Date('2025-10-25 00:00:00'),
    }),
    new TimeOff({
      from: new Date('2025-11-13 00:00:00'),
      to: new Date('2025-11-19 00:00:00'),
    }),
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
    present.setHours(0, 0, 0, 0);
    const lastFrom = new Date(
      this.historyTimeline[this.historyTimeline.length - 1].to ?? present
    );
    if (present.getTime() > lastFrom.getTime()) {
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
