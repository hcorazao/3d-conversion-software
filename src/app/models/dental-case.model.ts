import { Jaw } from '@app/models/enums/jaw.enum';

export class DentalCase {
  preparationToothNumber: string | undefined;
  preparationJaw: Jaw = Jaw.UNKNOWN;
  name: string;
  date: Date;
  indication: string;
  material: string;
  shade: string;
}
