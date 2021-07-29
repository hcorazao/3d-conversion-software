import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';

import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../environments/environment';

import * as fromReducers from './reducers';
import * as fromStates from './states';

import { RouterEffects } from './effects/router.effects';
import { AuthEffects } from './effects/auth.effects';
import { BabylonEffects } from './effects/babylon.effects';
import { SettingsEffects } from './effects/settings.effects';
import { NotificationsEffects } from './effects/notifications.effects';

import { RouterStateUrl } from './router';

export interface State {
  auth: fromStates.AuthState;
  router: RouterReducerState<RouterStateUrl>;
  babylon: fromStates.BabylonState;
  settings: fromStates.SettingsState;
  notifications: fromStates.NotificationsState;
}

export const reducers: ActionReducerMap<State> = {
  auth: fromReducers.auth.reducer,
  router: routerReducer,
  babylon: fromReducers.babylon.reducer,
  settings: fromReducers.settings.reducer,
  notifications: fromReducers.notifications.reducer,
};

export const effects = [RouterEffects, AuthEffects, BabylonEffects, SettingsEffects, NotificationsEffects];

export const metaReducers: MetaReducer<State>[] = !environment.production ? [storeFreeze] : [];
