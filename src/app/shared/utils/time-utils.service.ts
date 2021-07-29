import { Injectable } from '@angular/core';

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
const MONTH_IN_SECONDS = 30.5 * DAY_IN_SECONDS;
const YEAR_IN_SECONDS = 365 * DAY_IN_SECONDS;

const SECONDS_AGO_TRANSLATION_KEY = 'shared.time.secondsAgo';
const MINUTE_AGO_TRANSLATION_KEY = 'shared.time.minuteAgo';
const MINUTES_AGO_TRANSLATION_KEY = 'shared.time.minutesAgo';
const HOUR_AGO_TRANSLATION_KEY = 'shared.time.hourAgo';
const HOURS_AGO_TRANSLATION_KEY = 'shared.time.hoursAgo';
const DAY_AGO_TRANSLATION_KEY = 'shared.time.dayAgo';
const DAYS_AGO_TRANSLATION_KEY = 'shared.time.daysAgo';
const MONTH_AGO_TRANSLATION_KEY = 'shared.time.monthAgo';
const MONTHS_AGO_TRANSLATION_KEY = 'shared.time.monthsAgo';
const YEAR_AGO_TRANSLATION_KEY = 'shared.time.yearAgo';
const YEARS_AGO_TRANSLATION_KEY = 'shared.time.yearsAgo';

export class ElapsedTimeModel {
  constructor(public prefixNumber: string, public textSuffixTranslationKey: string) {}
}

@Injectable({
  providedIn: 'root',
})
export class TimeUtilsService {
  constructor() {}

  formatElapsedTime(date: Date): ElapsedTimeModel {
    if (!date) {
      return null;
    }
    const now = new Date();
    const difference = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (difference > 2 * YEAR_IN_SECONDS) {
      return new ElapsedTimeModel(`${Math.floor(difference / YEAR_IN_SECONDS)}`, YEARS_AGO_TRANSLATION_KEY);
    } else if (difference > YEAR_IN_SECONDS) {
      return new ElapsedTimeModel(`1`, YEAR_AGO_TRANSLATION_KEY);
    } else if (difference > 2 * MONTH_IN_SECONDS) {
      return new ElapsedTimeModel(`${Math.min(11, Math.floor(difference / MONTH_IN_SECONDS))}`, MONTHS_AGO_TRANSLATION_KEY);
    } else if (difference > MONTH_IN_SECONDS) {
      return new ElapsedTimeModel(`1`, MONTH_AGO_TRANSLATION_KEY);
    } else if (difference > 2 * DAY_IN_SECONDS) {
      return new ElapsedTimeModel(`${Math.floor(difference / DAY_IN_SECONDS)}`, DAYS_AGO_TRANSLATION_KEY);
    } else if (difference > DAY_IN_SECONDS) {
      return new ElapsedTimeModel(`1`, DAY_AGO_TRANSLATION_KEY);
    } else if (difference > 2 * HOUR_IN_SECONDS) {
      return new ElapsedTimeModel(`${Math.floor(difference / HOUR_IN_SECONDS)}`, HOURS_AGO_TRANSLATION_KEY);
    } else if (difference > HOUR_IN_SECONDS) {
      return new ElapsedTimeModel(`1`, HOUR_AGO_TRANSLATION_KEY);
    } else if (difference > 2 * MINUTE_IN_SECONDS) {
      return new ElapsedTimeModel(`${Math.floor(difference / MINUTE_IN_SECONDS)}`, MINUTES_AGO_TRANSLATION_KEY);
    } else if (difference > MINUTE_IN_SECONDS) {
      return new ElapsedTimeModel(`1`, MINUTE_AGO_TRANSLATION_KEY);
    } else {
      return new ElapsedTimeModel(`${difference}`, SECONDS_AGO_TRANSLATION_KEY);
    }
  }

  formatDate(date) {
    if (!date) {
      return '---';
    }
    const dayOfMonth = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
    const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
    const year = date.getFullYear();
    const formattedDate = `${dayOfMonth}/${month}/${year}`;
    const hours = date.getHours() % 12 === 0 ? '12' : `${date.getHours() % 12}`;
    const minutes = `${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
    const period = date.getHours() < 12 ? 'am' : 'pm';
    const formattedTime = `${hours}:${minutes}${period}`;
    return `${formattedDate} ${formattedTime}`;
  }
}
