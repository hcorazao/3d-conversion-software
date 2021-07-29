import { Vector3 } from '@babylonjs/core';
import CRFace from './../../../geometry-processing-js/core/CRFace';
import CRVertex from './../../../geometry-processing-js/core/CRVertex';
import ITriangleCondition from './ITriangleCondition';
import CRHalfEdgeMesh from './../../../geometry-processing-js/core/CRHalfEdgeMesh';
import Polyline from './Polyline';

/**
 * TriangleDistanceToMeshCondition the condition that triangle far from mesh
 */
export default class TriangleDistanceToMeshCondition implements ITriangleCondition {
  /**
   * @param  mesh Target mesh to which distance is considered
   * @param  minDistance minimal distance criteria size
   */
  constructor(mesh: CRHalfEdgeMesh, minDistanceToMesh: number, margin: Polyline, minDistanceToMargin: number, insertion: Vector3) {
    this.mesh = mesh;
    this.minDistanceToMesh = minDistanceToMesh;
    this.minDistanceToMargin = minDistanceToMargin;
    this.approachDistance = 1.3 * this.minDistanceToMesh;
    this.marginLine = margin;
    this.insertion = insertion;
    this.distanceMap = new Map<number, number>();
    this.centerOfMargin = this.marginLine.getCenterOfMass();
    this.cylinderRadius = this.calculateCylinderRadius(this.centerOfMargin);
  }

  private marginLine: Polyline;
  private distanceMap: Map<number, number>;
  private mesh: CRHalfEdgeMesh;
  private minDistanceToMesh: number;
  private minDistanceToMargin: number;
  private approachDistance: number;
  private insertion: Vector3;
  private cylinderRadius: number;
  private centerOfMargin: Vector3;

  private calculateCylinderRadius(center: Vector3): number {
    let distance = 0.0;
    this.marginLine.path.forEach((pnt) => {
      const dist = Vector3.Distance(center, pnt);
      if (dist > distance) {
        distance = dist;
      }
    });

    distance *= 1.3;
    return distance;
  }

  private checkFace(f: CRFace, deep: number): boolean {
    if (this.distanceMap.has(f.index)) {
      const storedDist = this.distanceMap.get(f.index);
      if (storedDist > this.approachDistance) {
        return true;
      }
    }

    if (deep > 0) {
      deep -= 1;
      if (this.checkAdjacents(f, deep)) {
        return true;
      }
    }

    return false;
  }

  private checkAdjacents(face: CRFace, deep: number): boolean {
    for (const f of face.adjacentFaces()) {
      if (this.checkFace(f, deep)) {
        return true;
      }
    }

    return false;
  }

  private isDoPass(face: CRFace, deep: number): boolean {
    const resCheck = this.checkAdjacents(face, deep - 1);
    return resCheck;
  }

  /**
   * Checks condition for triangle.
   * @param face Current face
   * @returns true if face position satisfies criteria
   */
  evaluateCondition(face: CRFace): boolean {
    if (this.isDoPass(face, 3)) {
      return true;
    }

    if (!this.evaluateConditionByCylinder(face.halfedge.vertex)) {
      return false;
    }

    if (!this.evaluateConditionToMargin(face.halfedge.vertex)) {
      return false;
    }

    const result = this.evaluateConditionToMesh(face);
    return result;
  }

  evaluateConditionByCylinder(v: CRVertex): boolean {
    const vectorToPoint = v.subtract(this.centerOfMargin);
    const distanceVector = vectorToPoint.cross(this.insertion);
    const distance = distanceVector.length();
    if (distance > this.cylinderRadius) {
      return false;
    }

    return true;
  }

  evaluateConditionToMargin(v: CRVertex): boolean {
    const d = this.marginLine.getMinDistance(v);
    const vv = v.subtract(d.closestPoint);
    const insDistance = Vector3.Dot(vv, this.insertion);
    if (insDistance < this.minDistanceToMargin) {
      return false;
    }

    return true;
  }

  evaluateConditionToMesh(face: CRFace): boolean {
    const v1 = face.halfedge.vertex;
    const index = this.mesh.getClosestVertexIndex(v1);
    const v2 = this.mesh.vertices[index];
    const dist = Vector3.Distance(v1, v2);
    if (dist > this.minDistanceToMesh) {
      this.distanceMap.set(face.index, dist);
      return true;
    }

    return false;
  }
}
