import { User } from '@app/models/user.model';
import { UserPermissions } from '@app/models/user-permissions.model';

export interface AuthState {
  user: User;
  loginPending: boolean;
  loggedIn: boolean;
  userPermissions: UserPermissions;
}
