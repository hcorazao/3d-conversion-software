import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GetOauthToken } from '@app/store/actions/auth.actions';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss'],
})
export class OauthCallbackComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new GetOauthToken());
  }
}
