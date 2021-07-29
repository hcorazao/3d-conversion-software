export enum FileType {
  OBJ = 'obj',
  STL = 'stl',
  PLY = 'ply',
  UNKNOWN = 'unknown',
}
export const getFileTypeByFileName = (fileName: string) => {
  const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
  switch (extension) {
    case 'obj':
      return FileType.OBJ;
    case 'stl':
      return FileType.STL;
    case 'ply':
      return FileType.PLY;
    default:
      return FileType.UNKNOWN;
  }
};
