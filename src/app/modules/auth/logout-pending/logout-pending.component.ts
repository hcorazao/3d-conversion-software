import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoggedOut } from '@app/store/actions/auth.actions';

@Component({
  selector: 'app-logout-pending',
  templateUrl: './logout-pending.component.html',
  styleUrls: ['./logout-pending.component.scss'],
})
export class LogoutPendingComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new LoggedOut());
  }
}
