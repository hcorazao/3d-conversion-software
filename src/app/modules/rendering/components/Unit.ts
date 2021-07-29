/**
 * Different camera vendors have different specifications of their models. One unit in the mesh
 * might be 25µm in real world or maybe 1000µm (1mm).
 *
 * This static class should be used by every other classes dealing with real world lengths or
 * measurements.
 */
export default class Unit {
  /**
   * The factor defined by the vendor of the model.
   */
  private static factor: number;

  /**
   * The factor will be multiplied by the other static functions.
   *
   * **Should be set once after loading the models.**
   * @param factor The factor from the vendor of the model
   */
  static SetFactor(factor: number): void {
    this.factor = factor;
  }

  /**
   * Convert millimeter to model units by dividing 1000 and multiplying the factor.
   * @param mm Input in millimeter, e.g. `const l = CRUnit.FromMillimeter(10);`
   * @returns Conversion to model unit
   */
  static FromMillimeter(mm: number): number {
    return (mm / 1000) * this.factor;
  }

  /**
   * Convert micrometer to model units by dividing 1000000 and multiplying the factor.
   * @param um Input in micrometer, e.g. `const l = CRUnit.FromMillimeter(1500);`
   * @returns Conversion to model unit
   */
  static FromMicrometer(um: number): number {
    return (um / 1000000) * this.factor;
  }
}
