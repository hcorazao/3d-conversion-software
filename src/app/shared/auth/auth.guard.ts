import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequired } from '@app/store/actions/auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.pipe(
      select(fromSelectors.isUserLoggedInWithLicense),
      map((loggedInWithLicense) => {
        console.log(loggedInWithLicense)
        if (!loggedInWithLicense) {
          this.store.dispatch(new LoginRequired({ returnUrl: state.url }));
          return false;
        }
        return true;
      })
    );
  }
}
