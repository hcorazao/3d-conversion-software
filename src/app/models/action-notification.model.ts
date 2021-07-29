import { ActionNotificationType } from './enums/action-notification-type.enum';

export class ActionNotification {
  public id: number;
  public type: ActionNotificationType;
  public titleTranslationKey: string;
  public descriptionTranslationKey: string;
  public actionButtonTitleTranslationKey: string;

  static builder() {
    return new ActionNotificationBuilder();
  }
}

export class ActionNotificationBuilder {
  actionNotification: ActionNotification;

  constructor() {
    this.actionNotification = new ActionNotification();
  }

  withId(id: number): ActionNotificationBuilder {
    this.actionNotification.id = id;
    return this;
  }
  withType(type: ActionNotificationType): ActionNotificationBuilder {
    this.actionNotification.type = type;
    return this;
  }
  withTitleTranslationKey(titleTranslationKey: string): ActionNotificationBuilder {
    this.actionNotification.titleTranslationKey = titleTranslationKey;
    return this;
  }
  withDescriptionTranslationKey(descriptionTranslationKey: string): ActionNotificationBuilder {
    this.actionNotification.descriptionTranslationKey = descriptionTranslationKey;
    return this;
  }
  withActionButtonTitleTranslationKey(actionButtonTitleTranslationKey: string): ActionNotificationBuilder {
    this.actionNotification.actionButtonTitleTranslationKey = actionButtonTitleTranslationKey;
    return this;
  }

  build(): ActionNotification {
    return this.actionNotification;
  }
}
