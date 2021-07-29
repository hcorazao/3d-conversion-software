import { Color3, Mesh, Vector3 } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';
import Polyline from './Polyline';
import SceneTriangulationLineObject from '../../components/SceneTriangulationLineObject';
import CRSceneObjectsManager from './../../components/SceneObjectsManager';
import CRHalfEdge from '@app/modules/geometry-processing-js/core/CRHalfEdge';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import TriangleFloodFillAlgorithm from './TriangleFloodFillAlgorithm';
import TriangleDistanceToMeshCondition from './TriangleDistanceToMeshCondition';
import MeshCreateNewMeshAlgorithm from './MeshCreateNewMeshAlgorithm';
import Debug from '../debug/Debug';
import TriangulationPolyline from './TriangulationPolyline';

export default class CreateCopylineAlgorithm implements IAlgorithm {
  constructor(
    objectManager: CRSceneObjectsManager,
    preopMesh: CRHalfEdgeMesh,
    prepMesh: CRHalfEdgeMesh,
    prepMarginPolyline: Polyline,
    up: Vector3
  ) {
    this.objectManager = objectManager;
    this.preopMesh = preopMesh;
    this.prepMesh = prepMesh;
    this.prepMarginPolyline = prepMarginPolyline;
    this.up = up;

    this.copylineObject = new SceneTriangulationLineObject('Copyline', objectManager);
    this.copylineObject.setPrimaryColorRGB(245, 196, 113); // TODO OEM
    this.copylineObject.setSecondaryColorRGB(138, 139, 143);
    this.copylineObject.setTertiaryColorRGB(245, 196, 113);
    this.copylineObject.setAccentColorRGB(220, 228, 67);
  }

  private objectManager: CRSceneObjectsManager;
  private preopMesh: CRHalfEdgeMesh;
  private prepMesh: CRHalfEdgeMesh;
  private prepMarginPolyline: Polyline;
  private up: Vector3;

  protected copylineObject: SceneTriangulationLineObject;

  compute(): any {
    // check the performance
    const t0 = performance.now();
    const startPoint = this.prepMarginPolyline.getCenterOfMass();
    const result = this.preopMesh.closestPointOnMeshProjected(startPoint, this.up, false, true, 10);
    if (!result.success) {
      console.error('Error in CreateCopylineAlgorithm, unable to define start point');
      return false;
    }

    const cond = new TriangleDistanceToMeshCondition(this.prepMesh, 0.2, this.prepMarginPolyline, 0.5, this.up);
    const floodFill = new TriangleFloodFillAlgorithm(result.index, this.preopMesh, cond);

    let triangleList = floodFill.compute();
    triangleList = floodFill.fillRest(500);
    const createMesh = new MeshCreateNewMeshAlgorithm('CutResult', triangleList, this.preopMesh);
    let customMesh: Mesh = createMesh.compute();
    let customMeshHE = new CRHalfEdgeMesh(customMesh, true, true, false);
    customMeshHE.removeFins();
    // customMeshHE.indexElements();
    const bnds = this.collectBoundaries(customMeshHE);
    // Debug.getInstance().debug_polyline(new Polyline(bnds[0]), true, 1, 0.05, new Color3(1, 0, 0));
    // Debug.getInstance().debug_polyline(new Polyline(bnds[1]), true, 1, 0.05, new Color3(0, 1, 0));

    const copyLine = this.combineCopyLines(bnds, customMeshHE);

    // create polyline on preop mesh
    this.copylineObject.polyline = this.createTriangulationPolyline(copyLine);

    // smooth the polyline
    for (let i = 0; i < 10; i++) {
      this.copylineObject.polyline.smooth(1);
    }

    // create scene object
    this.copylineObject.update('Copyline');
    // Debug.getInstance().debug_polyline(this.copylineObject.polyline);
    this.objectManager.setCopyline(this.objectManager.preparationToothNumber, this.copylineObject);
    this.objectManager.getPickedAsSceneObject().addChild(this.copylineObject);

    // dispose temporary mesh
    customMesh.dispose();
    customMesh = null;
    customMeshHE.dispose();
    customMeshHE = null;

    const t1 = performance.now();
    console.log('Call to CreateCopylineAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }

  getCenterOfMass(vertices: CRVertex[]): Vector3 {
    if (vertices.length === 1) {
      return;
    }

    const center = new Vector3();
    for (const c of vertices) {
      center.addInPlace(c);
    }

    return center.scale(1 / vertices.length);
  }

  findMainCopyLine(copyLines: CRVertex[][]): number {
    let resultIndex = -1;
    let minPosValue = Number.MAX_SAFE_INTEGER;
    for (let index = 0; index < copyLines.length; index++) {
      const element = copyLines[index];
      const centerPos = this.getCenterOfMass(element);
      const posValue = Vector3.Dot(centerPos, this.up);
      if (posValue < minPosValue) {
        resultIndex = index;
        minPosValue = posValue;
      }
    }

    return resultIndex;
  }

  combineCopyLines(copyLines: CRVertex[][], mesh: CRHalfEdgeMesh): CRVertex[] {
    const mainCopyLineIndex = this.findMainCopyLine(copyLines);
    if (mainCopyLineIndex < 0) {
      return;
    }

    let resCopyLine = copyLines[mainCopyLineIndex];
    for (let index = 0; index < copyLines.length; index++) {
      if (index === mainCopyLineIndex) {
        continue;
      }

      const otherLine = copyLines[index];
      const resOfCombine = this.combineTwoCopyLines(resCopyLine, otherLine, mesh);
      if (resOfCombine.length > 0) {
        resCopyLine = resOfCombine;
      }
    }

    return resCopyLine;
  }

  protected createTriangulationPolyline(copyline: CRVertex[]): TriangulationPolyline {
    const coordinates = [];
    const triangleIdx = [];
    for (const v of copyline) {
      coordinates.push(new Vector3(v._x, v._y, v._z));
      triangleIdx.push(this.preopMesh.getClosestFaceIndex(v));
    }
    return new TriangulationPolyline(coordinates, triangleIdx, this.preopMesh);
  }

  cutOutArea(line: CRVertex[], index1: number, index2: number): CRVertex[] {
    const resVertices = [];
    if (index1 > 0 && index2 < line.length) {
      for (let i = index2 + 1; i < line.length; ++i) {
        resVertices.push(line[i]);
      }

      for (let i = 0; i < index1; ++i) {
        resVertices.push(line[i]);
      }

      return resVertices;
    }

    if (index1 < 0) {
      index1 += line.length;
    }

    if (index2 >= line.length) {
      index2 -= line.length;
    }

    for (let i = index2; i < index1; ++i) {
      resVertices.push(line[i]);
    }

    return resVertices;
  }

  getMinDistanceSquaredToPolyline(line1: CRVertex[], line2: CRVertex[]): { distanceSquared: number; index1: number; index2: number } {
    let distanceSquared = Number.MAX_SAFE_INTEGER;
    let index1 = -1;
    let index2 = -1;
    for (let i = 0; i < line1.length; i++) {
      const p1 = line1[i];
      for (let j = 0; j < line2.length; j++) {
        const p2 = line2[j];
        const distSquared = Vector3.DistanceSquared(p1, p2);
        if (distSquared < distanceSquared) {
          distanceSquared = distSquared;
          index1 = i;
          index2 = j;
        }
      }
    }
    return { distanceSquared, index1, index2 };
  }

  combineTwoCopyLines(line1: CRVertex[], line2: CRVertex[], mesh: CRHalfEdgeMesh): CRVertex[] {
    // check the performance
    const t0 = performance.now();

    const dist = this.getMinDistanceSquaredToPolyline(line1, line2);
    if (dist.index1 < 0 || dist.index2 < 0) {
      return;
    }

    const cutOutPercentage = 0.1;
    const resVertices = [];

    // get number of points and clamp between 5 and 15
    let size1 = Math.round(0.5 * cutOutPercentage * line1.length);
    size1 = Math.max(5, Math.min(15, size1));

    const newLine1 = this.cutOutArea(line1, dist.index1 - size1, dist.index1 + size1);
    newLine1.forEach((element) => {
      resVertices.push(element);
    });

    // get number of points and clamp between 5 and 15
    let size2 = Math.round(0.5 * cutOutPercentage * line2.length);
    size2 = Math.max(5, Math.min(15, size2));

    const newLine2 = this.cutOutArea(line2, dist.index2 - size2, dist.index2 + size2);
    const startPoint1 = newLine1[0];
    const endPoint1 = newLine1[newLine1.length - 1];
    const startPoint2 = newLine2[0];
    const endPoint2 = newLine2[newLine2.length - 1];
    const dist1 = Vector3.Distance(endPoint1, startPoint2);
    const dist2 = Vector3.Distance(endPoint1, endPoint2);
    // const pointsCount = 100;
    // const parStep = 1.0 / pointsCount;
    if (dist1 < dist2) {
      mesh.shortestPath(endPoint1, startPoint2).forEach((v) => {
        resVertices.push(v);
      });

      newLine2.forEach((element) => {
        resVertices.push(element);
      });

      mesh.shortestPath(endPoint2, startPoint1).forEach((v) => {
        resVertices.push(v);
      });
    } else {
      mesh.shortestPath(endPoint1, endPoint2).forEach((v) => {
        resVertices.push(v);
      });

      for (let index = newLine2.length - 1; index >= 0; index--) {
        const element = newLine2[index];
        resVertices.push(element);
      }

      mesh.shortestPath(startPoint2, startPoint1).forEach((v) => {
        resVertices.push(v);
      });
    }

    const t1 = performance.now();
    console.log('Call to CreateCopylineAlgorithm:combineTwoCopyLines() took ' + (t1 - t0) + ' milliseconds.');

    return resVertices;
  }

  collectPoints(he: CRHalfEdge): CRVertex[] {
    const result = [];
    let next = he.next;
    while (next !== he) {
      result.push(next.vertex);
      next = next.next;
    }

    return result;
  }

  collectBoundaries(mesh: CRHalfEdgeMesh): CRVertex[][] {
    const result = [];
    for (const bnd of mesh.boundaries) {
      const vertices = this.collectPoints(bnd.halfedge);
      // do not push small boundaries
      if (vertices.length > 40) {
        result.push(vertices);
      }
    }

    return result;
  }
}
