import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequired, CheckLoggedIn } from '@app/store/actions/auth.actions';
import { AuthService } from './auth.service';
import { LoggedInOnAuthPage } from '@app/store/actions/auth.actions';

@Injectable({ providedIn: 'root' })
export class UnauthGuard implements CanActivate {
  constructor(private store: Store, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.store.dispatch(new CheckLoggedIn());
    return this.store.pipe(
      select(fromSelectors.isUserLoggedIn),
      map((loggedIn) => {
        if (loggedIn) {
          this.store.dispatch(new LoggedInOnAuthPage());
          return false;
        }
        return true;
      })
    );
  }
}
