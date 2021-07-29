import { Mesh, StandardMaterial, VertexData } from '@babylonjs/core';
import IAlgorithm from './IAlgorithm';
import SceneManager from '../SceneManager';
import HalfEdgeMesh from '@app/modules/geometry-processing-js/core/halfedgemesh';

/**
 * Mesh create new mesh algorithm
 */
export default class MeshCreateNewMeshAlgorithm implements IAlgorithm {
  constructor(name: string, triangleList: number[], mesh: HalfEdgeMesh, visibility = 0, createNormals = true) {
    this.name = name;
    this.triangleList = triangleList;
    this.mesh = mesh;
    this.visibility = visibility;
    this.createNormals = createNormals;
  }

  private name: string;
  private triangleList: number[];
  private mesh: HalfEdgeMesh;
  private visibility: number;
  private createNormals: boolean;

  private vertexIndexMap: Map<number, number>;

  getVertexIndexMap(): Map<number, number> {
    return this.vertexIndexMap;
  }

  compute(): any {
    // check the performance
    const t0 = performance.now();

    this.vertexIndexMap = new Map<number, number>();

    const customMesh = new Mesh(this.name, SceneManager.getInstance().current);
    const positions = [];
    const indices = [];
    const colors = [];
    let newVertexIdx = 0;
    let newTriangleIdx = 0;

    for (const t of this.triangleList) {
      const vertices = [
        this.mesh.faces[t].halfedge.vertex,
        this.mesh.faces[t].halfedge.next.vertex,
        this.mesh.faces[t].halfedge.next.next.vertex,
      ];

      // reindexing the vertices
      for (let i = 0; i < 3; i++) {
        if (!this.vertexIndexMap.has(vertices[i].index)) {
          positions[newVertexIdx * 3] = vertices[i].x;
          positions[newVertexIdx * 3 + 1] = vertices[i].y;
          positions[newVertexIdx * 3 + 2] = vertices[i].z;
          this.vertexIndexMap.set(vertices[i].index, newVertexIdx++);
        }

        indices[newTriangleIdx * 3 + i] = this.vertexIndexMap.get(vertices[i].index);
      }
      newTriangleIdx++;
    }

    // set color
    for (let i = 0; i < positions.length / 3; i++) {
      colors[i * 4 + 0] = 255 / 255;
      colors[i * 4 + 1] = 255 / 256;
      colors[i * 4 + 2] = 246 / 256;
      colors[i * 4 + 3] = 1;
    }

    const vertexData = new VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.colors = colors;

    vertexData.applyToMesh(customMesh);

    if (this.createNormals) {
      customMesh.createNormals(true);
    }

    customMesh.visibility = this.visibility;
    /*
    const pointsMaterial = new StandardMaterial('Material', SceneManager.getInstance().current);
    pointsMaterial.wireframe = true;
    customMesh.material = pointsMaterial;
*/
    const t1 = performance.now();
    console.log('Call to CRMeshCreateNewMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return customMesh;
  }
}
