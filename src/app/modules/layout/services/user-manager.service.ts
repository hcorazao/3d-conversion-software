import { Injectable } from '@angular/core';
import moment from 'moment';
import { DaySlotType } from '@app/models/enums/day-slot-type.enum';

@Injectable({
  providedIn: 'root',
})
export class UserManagerService {
  getDaySlotTypeByDatetime(datetime: Date) {
    if (!datetime) {
      return DaySlotType.UNKNOWN;
    }

    const currentHour = moment(datetime).hours();

    if (currentHour >= 17) {
      return DaySlotType.EVENING;
    }
    if (currentHour < 12) {
      return DaySlotType.MORNING;
    }

    return DaySlotType.AFTERNOON;
  }
}
