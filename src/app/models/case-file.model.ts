import { FileType } from './enums/file-type.enum';

export class CaseFile {
  constructor(public id: number, public file: File, public type: FileType) {}
}
