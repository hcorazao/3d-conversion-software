import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DaySlotType } from '@app/models/enums/day-slot-type.enum';
import { interval, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { UserManagerService } from '../../../services/user-manager.service';

@Component({
  selector: 'app-user-greeting',
  templateUrl: './user-greeting.component.html',
  styleUrls: ['./user-greeting.component.scss'],
})
export class UserGreetingComponent implements OnInit, OnDestroy {
  @Input()
  firstName: string;

  daySlot: DaySlotType;

  get DaySlotType() {
    return DaySlotType;
  }

  private readonly intervalDelay: number = 60 * 1000;
  private readonly destroy$ = new Subject();

  constructor(private readonly userManagerService: UserManagerService) {}

  ngOnInit(): void {
    interval(this.intervalDelay)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.daySlot = this.userManagerService.getDaySlotTypeByDatetime(new Date());
      });
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
