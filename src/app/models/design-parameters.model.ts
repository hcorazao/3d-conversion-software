import { Strength } from '@app/models/enums/strength.enum';

export class DesignParameters {
  occlusalContactStrength?: Strength;
  proximalContactStrength?: Strength;
  occlusalMinimalThickness?: number;
  radialMinimalThickness?: number;
  spacerStrength?: Strength;

  static createWithDefaultValues(): DesignParameters {
    const designParameters = new DesignParameters();
    designParameters.occlusalContactStrength = Strength.medium;
    designParameters.proximalContactStrength = Strength.medium;
    designParameters.occlusalMinimalThickness = 800;
    designParameters.radialMinimalThickness = 700;
    designParameters.spacerStrength = Strength.medium;
    return designParameters;
  }

  static createByUpdating(base: DesignParameters, update: DesignParameters): DesignParameters {
    const result = new DesignParameters();
    result.occlusalContactStrength =
      update === undefined || update.occlusalContactStrength === undefined ? base?.occlusalContactStrength : update.occlusalContactStrength;
    result.proximalContactStrength =
      update === undefined || update.proximalContactStrength === undefined ? base?.proximalContactStrength : update.proximalContactStrength;
    result.occlusalMinimalThickness =
      update === undefined || update.occlusalMinimalThickness === undefined
        ? base?.occlusalMinimalThickness
        : update.occlusalMinimalThickness;
    result.radialMinimalThickness =
      update === undefined || update.radialMinimalThickness === undefined ? base?.radialMinimalThickness : update.radialMinimalThickness;
    result.spacerStrength = update === undefined || update.spacerStrength === undefined ? base?.spacerStrength : update.spacerStrength;
    return result;
  }
}
