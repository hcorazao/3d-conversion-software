import { ToastNotificationType } from './enums/toast-notification-type.enum';

export class ToastNotification {
  public id: number;
  public type: ToastNotificationType;
  public messageTranslationKey: string;

  static builder() {
    return new ToastNotificationBuilder();
  }
}
export class ToastNotificationBuilder {
  toastNotification: ToastNotification;

  constructor() {
    this.toastNotification = new ToastNotification();
  }

  withId(id: number): ToastNotificationBuilder {
    this.toastNotification.id = id;
    return this;
  }
  withType(type: ToastNotificationType): ToastNotificationBuilder {
    this.toastNotification.type = type;
    return this;
  }
  withMessageTranslationKey(messageTranslationKey: string): ToastNotificationBuilder {
    this.toastNotification.messageTranslationKey = messageTranslationKey;
    return this;
  }

  build(): ToastNotification {
    if (!this.toastNotification.type) {
      this.toastNotification.type = ToastNotificationType.OTHER;
    }
    return this.toastNotification;
  }
}
