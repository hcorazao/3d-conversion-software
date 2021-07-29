export enum Jaw {
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  UNKNOWN = 'UNKNOWN',
}
export enum DentalNotation {
  ISO_3950 = 'ISO_3950',
  PALMER = 'PALMER',
  UNS = 'UNS',
}
// prettier-ignore
const ISO_3950 = {
  UPPER_RIGHT: ['18', '17', '16', '15', '14', '13', '12', '11', '55', '54', '53', '52', '51'],
  UPPER_LEFT: ['21', '22', '23', '24', '25', '26', '27', '28', '61', '62', '63', '64', '65'],
  LOWER_RIGHT: ['48', '47', '46', '45', '44', '43', '42', '41', '85', '84', '83', '82', '81'],
  LOWER_LEFT: ['31', '32', '33', '34', '35', '36', '37', '38', '71', '72', '73', '74', '75']
};

// prettier-ignore
const PALMER = {
  UPPER_RIGHT: ['UR8', 'UR7', 'UR6', 'UR5', 'UR4', 'UR3', 'UR2', 'UR1', 'URE', 'URD', 'URC', 'URB', 'URA'],
  UPPER_LEFT: ['UL1', 'UL2', 'UL3', 'UL4', 'UL5', 'UL6', 'UL7', 'UL8', 'ULA', 'ULB', 'ULC', 'ULD', 'ULE'],
  LOWER_RIGHT: ['LR8', 'LR7', 'LR6', 'LR5', 'LR4', 'LR3', 'LR2', 'LR1', 'LRE', 'LRD', 'LRC', 'LRB', 'LRA'],
  LOWER_LEFT: ['LL1', 'LL2', 'LL3', 'LL4', 'LL5', 'LL6', 'LL7', 'LL8', 'LLA', 'LLB', 'LLC', 'LLD', 'LLE']
};

// prettier-ignore
const UNS = {
  UPPER_RIGHT: ['1', '2', '3', '4', '5', '6', '7', '8', 'A', '1d', 'B', '2d', 'C', '3d', 'D', '4d', 'E', '5d'],
  UPPER_LEFT: ['9', '10', '11', '12', '13', '14', '15', '16', 'F', '6d', 'G', '7d', 'H', '8d', 'I', '9d', 'J', '10d'],
  LOWER_RIGHT: ['32', '31', '30', '29', '28', '27', '26', '25', 'T', '20d', 'S', '19d', 'R', '18d', 'Q', '17d', 'P', '16d'],
  LOWER_LEFT: ['24', '23', '22', '21', '20', '19', '18', '17', 'O', '15d', 'N', '14d', 'M', '13d', 'L', '12d', 'K', '11d']
};

export const getJawByToothNumber = (tooth: string, dentalNotation: DentalNotation = DentalNotation.ISO_3950) => {
  switch (dentalNotation) {
    case DentalNotation.ISO_3950:
      return getJawForISO3950(tooth);
    case DentalNotation.PALMER:
      return getJawForPalmer(tooth);
    case DentalNotation.UNS:
      return getJawForUns(tooth);
    default:
      return Jaw.UNKNOWN;
  }
};

const getJawForISO3950 = (tooth: string) => {
  if ([...ISO_3950.UPPER_LEFT, ...ISO_3950.UPPER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.UPPER;
  } else if ([...ISO_3950.LOWER_LEFT, ...ISO_3950.LOWER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.LOWER;
  } else {
    return Jaw.UNKNOWN;
  }
};

const getJawForPalmer = (tooth: string) => {
  if ([...PALMER.UPPER_LEFT, ...PALMER.UPPER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.UPPER;
  } else if ([...PALMER.LOWER_LEFT, ...PALMER.LOWER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.LOWER;
  } else {
    return Jaw.UNKNOWN;
  }
};

const getJawForUns = (tooth: string) => {
  if ([...UNS.UPPER_LEFT, ...UNS.UPPER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.UPPER;
  } else if ([...UNS.LOWER_LEFT, ...UNS.LOWER_RIGHT].indexOf(tooth) !== -1) {
    return Jaw.LOWER;
  } else {
    return Jaw.UNKNOWN;
  }
};
