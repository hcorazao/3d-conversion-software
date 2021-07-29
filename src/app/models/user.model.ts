import { UserGroupsNames } from '@app/models/enums/user-groups-names.enum';

export interface UserGroups {
  admin: boolean;
  developer: boolean;
  resellerAdmin: boolean;
}

export class User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  expiresAt?: number;
  groups: UserGroups;
  validSubscription?: boolean;

  static builder(): UserBuilder {
    return new UserBuilder();
  }

  static createFromTokenMessage(tokenMessage: any): User | null {
    if (!tokenMessage || !tokenMessage.profile) {
      return null;
    }
    const nameParts = tokenMessage.profile.name ? tokenMessage.profile.name.split(' ') : [];
    const firstName = tokenMessage.profile.given_name ? tokenMessage.profile.given_name : nameParts.length > 0 ? nameParts[0] : '';
    const lastName = tokenMessage.profile.family_name ? tokenMessage.profile.family_name : nameParts.length > 1 ? nameParts[1] : '';
    const email = tokenMessage.profile.email
      ? tokenMessage.profile.email
      : tokenMessage.profile.emails && tokenMessage.profile.emails.length > 0
      ? tokenMessage.profile.emails[tokenMessage.profile.emails.length - 1]
      : '';
    const groups = tokenMessage.profile.userGroups && {
      admin: tokenMessage.profile.userGroups.includes(UserGroupsNames.ADMIN),
      developer: tokenMessage.profile.userGroups.includes(UserGroupsNames.DEVELOPER),
      resellerAdmin: tokenMessage.profile.userGroups.includes(UserGroupsNames.RESELLER_ADMIN),
    };
    return User.builder()
      .withId(tokenMessage.profile.sub)
      .withToken(tokenMessage.access_token)
      .withExpiresAt(tokenMessage.expires_at)
      .withEmail(email)
      .withFirstName(firstName)
      .withLastName(lastName)
      .withGroups(groups)
      .withValidSubscription(tokenMessage.profile.validSubscription)
      .build();
  }
}

export class UserBuilder {
  user: User;

  constructor() {
    this.user = new User();
  }

  withId(id: string): UserBuilder {
    this.user.id = id;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  withFirstName(firstName: string): UserBuilder {
    this.user.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): UserBuilder {
    this.user.lastName = lastName;
    return this;
  }

  withToken(token: string): UserBuilder {
    this.user.token = token;
    return this;
  }

  withExpiresAt(expiresAt: number): UserBuilder {
    this.user.expiresAt = expiresAt;
    return this;
  }

  withGroups(groups) {
    this.user.groups = groups;
    return this;
  }

  withValidSubscription(validSubscription: boolean): UserBuilder {
    this.user.validSubscription = validSubscription;
    return this;
  }

  build(): User {
    return this.user;
  }
}
