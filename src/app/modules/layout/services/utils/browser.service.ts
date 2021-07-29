import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  constructor() {}

  checkIfHardwareApple() {
    const platforms: string[] = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    return platforms.includes(navigator.platform);
  }
}
