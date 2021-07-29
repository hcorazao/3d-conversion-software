import { FloatArray, Vector3 } from '@babylonjs/core';
import IAlgorithm from './IAlgorithm';
import TriangleFloodFillAlgorithm from './TriangleFloodFillAlgorithm';
import TriangleInsidePolylineCondition from './TriangleInsidePolylineCondition';
import MeshCreateNewMeshAlgorithm from './MeshCreateNewMeshAlgorithm';
import TriangulationPolyline from './TriangulationPolyline';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';

export default class CutOutMeshRegionAlgorithm implements IAlgorithm {
  constructor(
    name: string,
    startFaceId: number,
    mesh: CRHalfEdgeMesh,
    polyline: TriangulationPolyline,
    up: Vector3,
    visibility = 0,
    colors?: FloatArray
  ) {
    this.name = name;
    this.startFaceId = startFaceId;
    this.mesh = mesh;
    this.polyline = polyline;
    this.up = up;
    this.visibility = visibility;
    this.colors = colors;
  }

  private name: string;
  private startFaceId: number;
  private mesh: CRHalfEdgeMesh;
  private polyline: TriangulationPolyline;
  private up: Vector3;
  private visibility: number;
  private colors: FloatArray;

  private vertexIndexMap: Map<number, number>;

  getVertexIndexMap(): Map<number, number> {
    return this.vertexIndexMap;
  }

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const distanceMap = new Map<number, number>();

    const floodFill = new TriangleFloodFillAlgorithm(
      this.startFaceId,
      this.mesh,
      new TriangleInsidePolylineCondition(this.polyline, this.up, distanceMap)
    );
    let triangleList = floodFill.compute();
    triangleList = floodFill.fillRest(500);

    const createMesh = new MeshCreateNewMeshAlgorithm(this.name, triangleList, this.mesh, this.visibility);
    const customMesh = createMesh.compute();
    this.vertexIndexMap = createMesh.getVertexIndexMap();

    const t1 = performance.now();
    console.log('Call to CRCutOutMeshRegionAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return customMesh;
  }
}
