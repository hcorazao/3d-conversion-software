import { Component, OnInit, Optional, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import * as fromSelectors from './store/selectors';
import { TranslateService } from '@ngx-translate/core';
import { LoadSettings } from './store/actions/settings.actions';
import { Language } from './models/enums/language.enum';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '@environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-starter';
  version = 'Angular version 10.0.8';
  param = { value: 'world' };

  private destroy$ = new Subject();
  loggedIn$: Observable<boolean>;

  constructor(private store: Store, translate: TranslateService, @Optional() private swUpdate: SwUpdate, private router: Router) {
    translate.addLangs(Object.keys(Language).map((language) => Language[language as any]));
    translate.setDefaultLang(Language.en_US);
    this.store.dispatch(new LoadSettings());
  }

  ngOnInit(): void {
    this.loggedIn$ = this.store.pipe(select(fromSelectors.isUserLoggedIn), takeUntil(this.destroy$));
    if (this.swUpdate && environment.production) {
      this.swUpdate.available.subscribe(() => {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      });
      this.swUpdate.checkForUpdate();
    }
    this.setupIntercom();
  }

  setupIntercom() {
    const intercom = (window as any).Intercom;
    intercom('boot', {
      app_id: 'ivoestiz',
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        intercom('update');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
