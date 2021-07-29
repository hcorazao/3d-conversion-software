import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { first, mergeMap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.pipe(
      select(fromSelectors.getToken),
      first(),
      mergeMap((token) => {
        const authReq = !!token
          ? request.clone({
              setHeaders: { Authorization: 'Bearer ' + token },
            })
          : request;
        return next.handle(authReq);
      })
    );
  }
}
