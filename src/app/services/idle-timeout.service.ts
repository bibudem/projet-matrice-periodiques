import { Injectable, NgZone } from '@angular/core';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 heure
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {
  private timer: any;
  private onTimeoutCallback: (() => void) | null = null;
  private boundReset = () => this.resetTimer();

  constructor(private ngZone: NgZone) {}

  // Démarre la surveillance d'inactivité ; onTimeout est appelé après 1h sans activité.
  start(onTimeout: () => void): void {
    this.onTimeoutCallback = onTimeout;
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach(evt => document.addEventListener(evt, this.boundReset, { passive: true }));
    });
    this.resetTimer();
  }

  stop(): void {
    this.onTimeoutCallback = null;
    clearTimeout(this.timer);
    ACTIVITY_EVENTS.forEach(evt => document.removeEventListener(evt, this.boundReset));
  }

  private resetTimer(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.ngZone.run(() => this.onTimeoutCallback?.());
    }, INACTIVITY_LIMIT_MS);
  }
}
