import { Color4, Vector3 } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';
import SceneTriangulationLineObject from '../../components/SceneTriangulationLineObject';
import CRSceneObjectsManager from './../../components/SceneObjectsManager';
import CRHalfEdgeMesh from './../../../geometry-processing-js/core/CRHalfEdgeMesh';
import Debug from '../debug/Debug';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import CRHalfEdge from '@app/modules/geometry-processing-js/core/CRHalfEdge';

export default class CreateMarginThicknessAlgorithm implements IAlgorithm {
  constructor(objectManager: CRSceneObjectsManager, spacer: CRHalfEdgeMesh, up: Vector3) {
    this.objectManager = objectManager;
    this.spacer = spacer; // objectManager.spacers[objectManager.preparationToothNumber].getHalfEdgeMesh();
    this.up = up;
  }

  private objectManager: CRSceneObjectsManager;
  private spacer: CRHalfEdgeMesh;
  private up: Vector3;

  protected copylineObject: SceneTriangulationLineObject;

  protected firstHalfEdge: CRHalfEdge;
  protected lastHalfEdge: CRHalfEdge;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const MARGIN_THICKNESS = 0.1;

    const halfEdges: CRHalfEdge[] = [];
    const newBoundaryhalfEdges: CRHalfEdge[] = [];
    const newVertices: CRVertex[] = [];
    const boundaryVertices: CRVertex[] = [];
    const start = this.spacer.boundaries[0].halfedge;
    let idx = 0;
    let next = start;
    do {
      // create vertex
      const v = next.vertex;
      const d = next.vector().normalize();
      const n = this.up;
      const t = Vector3.Cross(n, d).scale(MARGIN_THICKNESS);
      const point = v.add(t);
      const vertex = this.spacer.createVertex(point, new Color4(1, 1, 1, 1));
      newVertices.push(vertex);
      boundaryVertices.push(v);

      if (newVertices.length > 1) {
        this.createPatch(next, newVertices, boundaryVertices, newBoundaryhalfEdges, idx);
      }

      halfEdges.push(next);
      next = next.next;
      idx++;
    } while (next !== start);

    // create last patch
    this.createPatch(next, newVertices, boundaryVertices, newBoundaryhalfEdges, idx);
    this.spacer.createEdge(this.firstHalfEdge, this.lastHalfEdge);

    // connect new boundary half edges
    const len = newBoundaryhalfEdges.length;
    for (let i = 0; i < len; i++) {
      newBoundaryhalfEdges[i].next = newBoundaryhalfEdges[(i + 1) % len];
      newBoundaryhalfEdges[(i + 1) % len].prev = newBoundaryhalfEdges[i];
    }

    // delete old boundary half edges
    for (const he of halfEdges) {
      he.dispose(this.spacer);
    }

    // add vertex attributes
    const data = new Uint8Array(newVertices.length);
    data.fill(CRHalfEdgeMesh.VA_MARGIN_THICKNESS + CRHalfEdgeMesh.VA_SPACER);
    const newArray = new Uint8Array(this.spacer.vertexAttributes.length + data.length);
    newArray.set(this.spacer.vertexAttributes); // copy old data
    newArray.set(data, this.spacer.vertexAttributes.length); // copy new data after end of old data
    this.spacer.vertexAttributes = newArray;

    const t1 = performance.now();
    console.log('Call to CreateMarginThicknessAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }

  protected createPatch(
    next: CRHalfEdge,
    newVertices: CRVertex[],
    boundaryVertices: CRVertex[],
    newBoundaryhalfEdges: CRHalfEdge[],
    idx: number
  ): void {
    const v0 = boundaryVertices[idx % newVertices.length];
    const v1 = boundaryVertices[idx - 1];
    const v2 = newVertices[idx - 1];
    const v3 = newVertices[idx % newVertices.length];

    // create 2*3 new half edges
    const he0 = this.spacer.createHalfEdge(v0, false);
    const he1 = this.spacer.createHalfEdge(v3, false);
    const he2 = this.spacer.createHalfEdge(v2, false);

    const he3 = this.spacer.createHalfEdge(v1, false);
    const he4 = this.spacer.createHalfEdge(v0, false);
    const he5 = this.spacer.createHalfEdge(v2, false);

    // create 2 new triangles
    this.spacer.createFace(he0, he1, he2);
    this.spacer.createFace(he3, he4, he5);

    // create new edges
    this.spacer.createEdge(he2, he4);
    if (this.lastHalfEdge) {
      this.spacer.createEdge(he5, this.lastHalfEdge);
    }
    this.lastHalfEdge = he0;

    // update former boundary edge
    next.prev.edge.update(next.prev.twin, he3);

    // modify boundary half edge
    const b = this.spacer.createHalfEdge(v2, true);
    b.face = this.spacer.boundaries[0];
    this.spacer.boundaries[0].halfedge = b;
    this.spacer.createEdge(b, he1);
    newBoundaryhalfEdges.push(b);

    // remember very first half edge
    if (!this.firstHalfEdge) {
      this.firstHalfEdge = he5;
    }
  }
}
