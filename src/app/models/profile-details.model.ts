export class ProfileDetails {
  firstName?: string;
  lastName?: string;
  practiceName?: string;
  email?: string;
  profileImage?: string;

  static createByUpdating(base: ProfileDetails, update: ProfileDetails): ProfileDetails {
    const result = new ProfileDetails();
    result.firstName = update === undefined || update.firstName === undefined ? base?.firstName : update.firstName;
    result.lastName = update === undefined || update.lastName === undefined ? base?.lastName : update.lastName;
    result.practiceName = update === undefined || update.practiceName === undefined ? base?.practiceName : update.practiceName;
    result.email = update === undefined || update.email === undefined ? base?.email : update.email;
    result.profileImage = update === undefined || update.profileImage === undefined ? base?.profileImage : update.profileImage;
    return result;
  }
}
