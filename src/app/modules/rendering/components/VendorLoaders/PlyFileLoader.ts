import {
  SceneLoader,
  AssetContainer,
  Skeleton,
  ParticleSystem,
  AbstractMesh,
  Scene,
  Mesh,
  VertexData,
  ISceneLoaderPlugin,
  ISceneLoaderPluginExtensions,
} from '@babylonjs/core';

enum FileFormatType {
  UNDEFINED = 0,
  BINARY_LITTLE = 1,
  BINARY_BIG = 2,
  ASCII = 3,
}

/**
 * PlyFileLoader is able to load a PLY file
 * For now only binary format is implemented. In case requirements, ASCII will be implement.
 */
export class PlyFileLoader implements ISceneLoaderPlugin {
  public name = 'PLY';
  public extensions: ISceneLoaderPluginExtensions = {
    '.ply': { isBinary: true },
  };

  /**
   * Implements method of interface ISceneLoaderPlugin.
   */
  public load(scene: Scene, data: any, rootUrl: string): boolean {
    return true;
  }

  /**
   * Gets data from header about format and size of content of PLY-file.
   * @param header Header content to parse
   * @returns Data format type, vertices count, faces count, start offset of data start
   */
  private ParseHeaderData(header: string): [FileFormatType, number, number, number] {
    const lines = header.split('\n');
    let dataFormat: FileFormatType = FileFormatType.UNDEFINED;
    let verticesCount = 0;
    let facesCount = 0;
    let dataPos = 0;
    for (const oneLine of lines) {
      if (oneLine.length === 0) {
        continue;
      }

      const words = oneLine.split(' ');
      if (words.length === 0) {
        continue;
      }

      if (words[0] === 'comment') {
        continue;
      }

      if (words[0] === 'format') {
        if (words.length !== 3) {
          continue;
        }

        if (words[1] === 'ascii') {
          dataFormat = FileFormatType.ASCII;
        } else if (words[1] === 'binary_little_endian') {
          dataFormat = FileFormatType.BINARY_LITTLE;
        } else if (words[1] === 'binary_big_endian') {
          dataFormat = FileFormatType.BINARY_BIG;
        }

        continue;
      }

      if (words[0] === 'element') {
        if (words.length !== 3) {
          continue;
        }

        if (words[1] === 'vertex') {
          verticesCount = +words[2];
        } else if (words[1] === 'face') {
          facesCount = +words[2];
        }

        continue;
      }

      if (words[0] === 'DataPos') {
        if (words.length !== 2) {
          continue;
        }

        dataPos = +words[1];
        continue;
      }
    }

    return [dataFormat, verticesCount, facesCount, dataPos];
  }

  /**
   * Compares two arrays of Uint8Array. For some reason standard compare doesn't work.
   * @param v1 first array
   * @param v2 second array
   * @returns true if they are equal
   */
  private Compare(v1: Uint8Array, v2: Uint8Array): boolean {
    if (v1.length !== v2.length) {
      return false;
    }

    for (let index = 0; index < v1.length; index++) {
      if (v1[index] !== v2[index]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks for marker of PLY format.
   * @param fileContent content of file
   * @returns true if file is marked as PLY
   */
  private IsFormatMarked(fileContent: Uint8Array): boolean {
    const plyMarker = Uint8Array.from([0x70, 0x6c, 0x79]);
    const subArr = fileContent.subarray(0, 3);
    if (!this.Compare(plyMarker, subArr)) {
      return false;
    }

    return true;
  }

  /**
   * Reads header data of PLY-file. End of header is marked by special string 'end_header'.
   * @param fileContent content of file
   * @returns content of header as string
   */
  private ReadHeaderData(fileContent: Uint8Array): string {
    const endHeaderMarker = Uint8Array.from([0x65, 0x6e, 0x64, 0x5f, 0x68, 0x65, 0x61, 0x64, 0x65, 0x72]);
    let endHeaderPos = 0;
    for (let index = 0; index < fileContent.length; index++) {
      const subArr = fileContent.subarray(index, index + endHeaderMarker.length);
      if (this.Compare(subArr, endHeaderMarker)) {
        endHeaderPos = index;
        break;
      }
    }

    if (endHeaderPos === 0) {
      return;
    }

    let strHeaderData = String.fromCharCode.apply(null, fileContent.subarray(3, endHeaderPos - 1));
    if (strHeaderData.length === 0) {
      return;
    }

    const dataStartPos = endHeaderPos + endHeaderMarker.length + 1;
    strHeaderData += '\n';
    strHeaderData += 'DataPos ';
    strHeaderData += dataStartPos;
    strHeaderData += '\n';
    return strHeaderData;
  }

  /**
   * Reads vertices coordiantes from binary sequence. Also colors for vertices are read.
   * @param dataView view of data from file to read
   * @param count vertices count to read
   * @param dataStartPos offset of data to read
   * @param isLittleEndian is data encoded in little endian format
   * @returns positions of vertices, colors of vertices
   */
  private ReadVertices(
    dataView: DataView,
    count: number,
    dataStartPos: number,
    isLittleEndian: boolean,
    positions: Float32Array,
    colors: Float32Array
  ): number {
    const vertexDataSize = 15;
    for (let index = 0; index < count; index++) {
      // position
      let pos = dataStartPos + index * vertexDataSize;
      const x = dataView.getFloat32(pos, isLittleEndian);
      const posIndex = index * 3;
      positions[posIndex] = x;
      pos += 4;
      const y = dataView.getFloat32(pos, isLittleEndian);
      positions[posIndex + 1] = y;
      pos += 4;
      const z = dataView.getFloat32(pos, isLittleEndian);
      positions[posIndex + 2] = z;
      // color
      pos += 4;
      const colIndex = index * 4;
      const r = dataView.getUint8(pos);
      colors[colIndex] = r / 255;
      pos += 1;
      const g = dataView.getUint8(pos);
      colors[colIndex + 1] = g / 255;
      pos += 1;
      const b = dataView.getUint8(pos);
      colors[colIndex + 2] = b / 255;
      colors[colIndex + 3] = 1.0;
    }

    const nextDataPos = dataStartPos + vertexDataSize * count;
    return nextDataPos;
  }

  /**
   * Reads faces of mesh in format (i1,i2,i3). Every three indices in sequence define one face.
   * @param dataView view of data from file to read
   * @param count faces count to read
   * @param dataStartPos offset of data to read
   * @param isLittleEndian is data encoded in little endian format
   * @returns array of indices for triangles
   */
  private ReadFaces(dataView: DataView, count: number, dataStartPos: number, isLittleEndian: boolean, indices: Int32Array) {
    let indPos = 0;
    for (let index = 0; index < count; index++) {
      const indicesCount = dataView.getUint8(dataStartPos);
      dataStartPos++;
      if (indicesCount !== 3) {
        console.log('PLY: wrong number of vertices of polygon, should be equal to 3.');
        dataStartPos += indicesCount * 4;
        continue;
      }

      const ind1 = dataView.getInt32(dataStartPos, isLittleEndian);
      dataStartPos += 4;
      const ind2 = dataView.getInt32(dataStartPos, isLittleEndian);
      dataStartPos += 4;
      const ind3 = dataView.getInt32(dataStartPos, isLittleEndian);
      dataStartPos += 4;

      // TODO: here it is bind to little endian format, bot it is not clear why orientation of tringles is inverted by default.
      // check big endian format in future.
      indices[indPos++] = isLittleEndian ? ind3 : ind1;
      indices[indPos++] = ind2;
      indices[indPos++] = isLittleEndian ? ind1 : ind3;
    }
  }

  /**
   * Implements method of interface ISceneLoaderPlugin.
   */
  public importMesh(
    meshesNames: any,
    scene: Scene,
    data: any,
    rootUrl: string,
    meshes: AbstractMesh[],
    particleSystems: ParticleSystem[],
    skeletons: Skeleton[]
  ): boolean {
    const startTime = performance.now();

    const dataArray = new Uint8Array(data);
    if (!this.IsFormatMarked(dataArray)) {
      console.log('PLY: doesnt contain format marker.');
      return false;
    }

    const strHeaderData = this.ReadHeaderData(dataArray);
    if (strHeaderData.length === 0) {
      console.log('PLY: unable to read header data.');
      return false;
    }

    const headerData = this.ParseHeaderData(strHeaderData);
    if (headerData[0] === FileFormatType.UNDEFINED || headerData[1] < 1 || headerData[2] < 1 || headerData[3] < 1) {
      console.log('PLY: file has invalid header data.');
      return false;
    }

    if (headerData[0] === FileFormatType.ASCII) {
      console.log('PLY: ascii import is not implemented.');
      return false;
    }

    const isLittleEndian = headerData[0] === FileFormatType.BINARY_LITTLE;
    const verticesCount = headerData[1];
    const dataStartPos = headerData[3];
    const dataView = new DataView(data);
    const positions = new Float32Array(3 * verticesCount);
    const colors = new Float32Array(4 * verticesCount);
    const faceDataPos = this.ReadVertices(dataView, verticesCount, dataStartPos, isLittleEndian, positions, colors);
    if (faceDataPos < 1) {
      console.log('PLY: unable to read vertices.');
      return false;
    }

    const facesCount = headerData[2];
    const indices = new Int32Array(3 * facesCount);
    this.ReadFaces(dataView, facesCount, faceDataPos, isLittleEndian, indices);
    const customMesh = new Mesh('custom', scene);
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.colors = colors;
    vertexData.indices = indices;
    vertexData.applyToMesh(customMesh);
    meshes.push(customMesh);
    const endTime = performance.now();
    console.log('Call to importMesh() took ' + (endTime - startTime) + ' milliseconds.');
    return true;
  }

  /**
   * Implements method of interface ISceneLoaderPlugin.
   */
  public loadAssetContainer(
    scene: Scene,
    data: any,
    rootUrl: string,
    onError?: (message: string, exception?: any) => void
  ): AssetContainer {
    return;
  }
}
