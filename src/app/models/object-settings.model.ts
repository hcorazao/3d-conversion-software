export class ObjectSettings {
  opacity: number;
  available: boolean;

  static createByUpdating(base: ObjectSettings, update: ObjectSettings): ObjectSettings {
    const result = new ObjectSettings();
    result.opacity = update === undefined || update.opacity === undefined ? base?.opacity || undefined : update.opacity;
    result.available = update === undefined || update.available === undefined ? base?.available || undefined : update.available;
    return result;
  }
}
