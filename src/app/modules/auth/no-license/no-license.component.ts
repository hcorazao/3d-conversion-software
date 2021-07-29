import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Logout } from '@app/store/actions/auth.actions';

@Component({
  selector: 'app-no-license',
  templateUrl: './no-license.component.html',
  styleUrls: ['./no-license.component.scss'],
})
export class NoLicenseComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {}

  logout() {
    this.store.dispatch(new Logout());
  }
}
