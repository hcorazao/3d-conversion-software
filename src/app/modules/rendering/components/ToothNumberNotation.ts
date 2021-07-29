/**
 * Handles the 3 different tooth number notations, and convert back and forth between them.
 *
 * {@link https://en.wikipedia.org/wiki/Dental_notation| Article}
 * @todo Palmer notation
 */
export default class ToothNumberNotation {
  /**
   * Conversion array from ADA to FDI
   */
  // tslint:disable-next-line: whitespace
  private static adaToFdi = [
    18,
    17,
    16,
    15,
    14,
    13,
    12,
    11,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    38,
    37,
    36,
    35,
    34,
    33,
    32,
    31,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
  ];

  /**
   * Converts from ADA to FDI toth number notation.
   * @param ada The tooth number in ADA notation
   * @returns The tooth number in FDI notation
   */
  static ADAToFDI(ada: number): number {
    return this.adaToFdi[ada - 1];
  }

  /**
   * Converts from FDI to ADA toth number notation.
   * @param fdi The tooth number in FDI notation
   * @returns The tooth number in ADA notation
   */
  static FDIToADA(fdi: number): number {
    return this.adaToFdi.indexOf(fdi) + 1;
  }
}
