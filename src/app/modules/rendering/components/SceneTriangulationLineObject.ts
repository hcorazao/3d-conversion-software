import { Mesh, BoundingBox, Vector3, Color3, MeshBuilder, StandardMaterial, Curve3 } from '@babylonjs/core';
import TriangulationPolyline from '../core/algorithm/TriangulationPolyline';
import Polyline from '../core/algorithm/Polyline';
import SceneObject from './SceneObject';
import CRSceneObjectsManager from './SceneObjectsManager';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import Debug from '../core/debug/Debug';

export default class SceneTriangulationLineObject extends SceneObject {
  constructor(name: string, objectManager: CRSceneObjectsManager, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.name = name;
    this.polyline = null;
    this.controlPoints = [];
    this.redoControlPoints = [];

    this.tubeRadius = 0.07;
    // this.tubeRadius = 0.005;
    this.sphereDiameter = 0.3;
    this.interval = 0.075;

    this.debugPointLine = [];

    this.segments = [];
  }

  public polyline: TriangulationPolyline;
  protected controlPoints: Vector3[];
  protected redoControlPoints: Vector3[];
  protected name: string;

  protected startSphere: Mesh;
  protected sphereDiameter: number;
  protected interval: number;
  protected tubeRadius: number;

  protected segments: TriangulationPolyline[];

  protected debugPointLine: Mesh[];

  protected _dispose() {
    this.startSphere?.dispose();
    this.startSphere = null;
    this.polyline = null;
    this.controlPoints = [];
    this.segments = [];
  }

  /**
   * Gets bounding box
   * @todo think about returning BoundingInfo
   * @returns bounding box
   */
  getBoundingBox(): BoundingBox {
    if (this.polyline) {
      return this.polyline.getBoundingBox();
    }
  }

  getPart(startIdx: number, endIdx: number): Polyline {
    return this.polyline.getPart(startIdx, endIdx);
  }

  getControlPoints(): Vector3[] {
    return this.controlPoints;
  }

  getRedoControlPoints(): Vector3[] {
    return this.redoControlPoints;
  }

  getCenterOfMass(): Vector3 {
    return this.polyline.getCenterOfMass();
  }

  getCurve(): Vector3[] {
    return this.polyline.getCurve();
  }

  isCCW(up: Vector3): boolean {
    return this.polyline.isCCW(up);
  }

  isClose(v: Vector3, eps: number): { isClose: boolean; distance: number; closestPoint: Vector3; index: number } {
    const model = this.polyline?.getMinDistance(v);
    if (model) {
      return {
        isClose: model.distance < eps,
        distance: model.distance,
        closestPoint: model.closestPoint,
        index: model.index,
      };
    }
  }

  getLength(): number {
    return this.polyline.length();
  }

  /**
   * Adds new control point
   * @param point the control point to be added
   * @param last if true, this is the last point coming
   * @param closed if true, the line is a closed line
   */
  addNewControlPoint(point: Vector3, last: boolean, closed: boolean, inCameraDirection: boolean): void {
    if (!(last && closed)) {
      // do not add the last point
      this.controlPoints.push(point);
    }
    if (last) {
      // if the line is closed, remove start sphere
      this.startSphere.dispose();
      this.startSphere = null;
    }

    // with the first double click, add the start sphere
    if (this.controlPoints.length === 1) {
      this.drawStartPoint(this.name + '_StartSphere', this.controlPoints[0], this.accentColor);
    } else {
      if (this.createNewSegment(last, closed, inCameraDirection)) {
        this.polyline = TriangulationPolyline.CreatePolyline(this.segments);
        this.drawLine(this.name);
      } else {
        this.deleteLastControlPoint();
      }
    }
  }

  deleteLastControlPoint(): boolean {
    // if there are sufficient control points, just remove the last and re-draw the line
    if (this.controlPoints.length > 2) {
      this.controlPoints.pop();
      this.segments.pop();
      this.polyline = TriangulationPolyline.CreatePolyline(this.segments);
      this.drawLine(this.name);
      return true;
    }
    // if only 2 control points left, remove the last and delete the line
    else if (this.controlPoints.length === 2) {
      this.controlPoints.pop();
      this.segments.pop();
      this.mesh?.dispose();
      this.mesh = null;
      return true;
    }
    // if only 1 control point left, remove the last and delete the start ball
    else {
      this.controlPoints.pop();
      this.startSphere?.dispose();
      this.startSphere = null;
      return false;
    }
  }

  private refineSegment(points: Vector3[], triangleIdx: number[], factor: number, stop: number): boolean {
    let done = false;
    let cnt = 0;
    while (!done) {
      done = true;
      cnt++;
      for (let i = 0; i < points.length - 1; i++) {
        const P0 = points[i];
        const P1 = points[i + 1];
        const A = this.objectManager.camera.position.subtract(P0);
        const B = P1.subtract(P0);
        const d = B.length();

        if (d > factor * this.interval) {
          B.normalize();
          const N = Vector3.Cross(A, B).normalize();
          const D = Vector3.Cross(A, N).normalize();

          const Pi = P0.add(B.scale(this.interval));
          const Pj = P0.add(B.scale(d - this.interval));

          const proji = this.objectManager.getPickedAsHalfEdgeMesh().closestPointOnMeshProjected(Pi, D, true, false, 1, 10);
          const projj = this.objectManager.getPickedAsHalfEdgeMesh().closestPointOnMeshProjected(Pj, D, true, false, 1, 10);
          if (proji.success && projj.success) {
            points.splice(i + 1, 0, Pi);
            points.splice(i + 2, 0, Pj);
            triangleIdx.splice(i + 1, 0, proji.index);
            triangleIdx.splice(i + 2, 0, projj.index);
            done = false;
            break;
          } else {
            console.error('No projection point found!');
            return false;
          }
        }
      }
      if (cnt > stop) {
        console.error('ABORT!');
        return false;
      }
    }
    return true;
  }

  /**
   * Creates a new piecewise hermite spline segment.
   * @param closed Whether the line is closed, this also means that this is the last control point
   */
  private createNewSegment(last: boolean, closed: boolean, inCameraDirection: boolean): boolean {
    const idx = !closed ? this.controlPoints.length - 2 : this.controlPoints.length - 1;
    const p1 = this.controlPoints[idx];
    const p2 = this.controlPoints[!closed ? idx + 1 : 0];
    const d = Vector3.Distance(p1, p2);
    let t1: Vector3;
    let t2: Vector3;

    if (idx === 0) {
      t1 = p2.subtract(p1).normalize();
      t2 = t1;
    } else {
      t1 = this.segments[idx - 1].getTangentAt(1.0).scale(d * 1.0);
      t2 = !closed ? p2.subtract(p1).normalize() : this.segments[0].getTangentAt(0.0).scale(d);

      /* try to get it "rounder"
      const h1 = Curve3.CreateHermiteSpline(p1, t1, p2, t2, 2);
      const h2 = new CRPolyline(h1.getPoints());
      t2 = (!closed) ? h2.getTangentAt(0.9) : this.segments[0].getTangentAt(0.0).scale(d);
*/
    }

    const hermite = Curve3.CreateHermiteSpline(p1, t1, p2, t2, d / this.interval);
    const points = hermite.getPoints();
    if (closed) {
      points.push(p2);
    }

    let eye = this.objectManager.camera.position;

    // if the camera position is not desired, a virtual camera position is being calculated
    // the average of the two face normals is being used
    if (!inCameraDirection) {
      const faceId1 = this.objectManager.getPickedAsHalfEdgeMesh().getClosestFaceIndex(p1);
      const faceId2 = this.objectManager.getPickedAsHalfEdgeMesh().getClosestFaceIndex(p2);
      const dir1 = this.objectManager.getPickedAsHalfEdgeMesh().faces[faceId1].calcNormal();
      const dir2 = this.objectManager.getPickedAsHalfEdgeMesh().faces[faceId2].calcNormal();
      const p = p1.add(p2);
      p.scaleInPlace(0.5);
      eye = dir1.add(dir2); // the average
      eye.scaleInPlace(2); // move away
      eye.addInPlace(p);
    }

    const triangleIdx = [];
    this.objectManager.getPickedAsHalfEdgeMesh().closestPointsOnMeshProjected(points, triangleIdx, eye, true);

    const success = this.refineSegment(points, triangleIdx, 2.5, 500);

    this.segments.push(new TriangulationPolyline(points, triangleIdx, this.objectManager.getPickedAsHalfEdgeMesh()));

    return success;
  }

  update(name: string): void {
    this.line(name, this.getCurve());
  }

  /**
   * Draws the start point as a sphere at a given position.
   * @param name The name of the start sphere.
   * @param at The position of the start sphere.
   * @param col The color of the start sphere.
   */
  private drawStartPoint(name: string, at: Vector3, col: Color3): void {
    this.startSphere = MeshBuilder.CreateSphere(name, { diameter: this.sphereDiameter, updatable: true }, this.objectManager.scene);
    this.startSphere.position = at;
    this.startSphere.isPickable = false;

    const myMaterial = new StandardMaterial(name + '_Material', this.objectManager.scene);
    myMaterial.diffuseColor = col;
    this.startSphere.material = myMaterial;
  }

  /**
   * Draws the line.
   * @param name Scene name of the line
   * @param [dotted] Whether the line should be a dotted line - mostly for debug puposes
   */
  private drawLine(name: string, dotted = false): void {
    if (!dotted) {
      this.line(name, this.polyline.getCurve());
    } else {
      this.dotted(name, this.polyline.getCurve());
    }
  }

  /**
   * Draws the line as a solid line.
   * @param name The name of the line
   * @param pp The points including control points and in between points
   */
  private line(name: string, pp: Vector3[]) {
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = null;
    }

    this.mesh = MeshBuilder.CreateTube(name, { path: pp, radius: this.tubeRadius }, this.objectManager.scene);
    this.mesh.isPickable = false;
    const myMaterial = new StandardMaterial(name + '_Material', this.objectManager.scene);
    myMaterial.diffuseColor = this.tertiaryColor;
    this.mesh.material = myMaterial;
  }

  /**
   * Draws the line as a dotted line mostly for debug purposes.
   * @param name The name of the line
   * @param pp The points including control points and in between points
   */
  private dotted(name: string, pp: Vector3[]) {
    while (this.debugPointLine.length > 0) {
      let m = this.debugPointLine.splice(0, 1)[0];
      m.dispose();
      m = null;
    }

    for (let i = 0; i < pp.length; i++) {
      this.debugPointLine[i] = MeshBuilder.CreateSphere(name + i, { diameter: 0.1 }, this.objectManager.scene);
      this.debugPointLine[i].position = pp[i];
      this.debugPointLine[i].isPickable = false;
      const myMaterial = new StandardMaterial(name + '_Material' + i, this.objectManager.scene);
      const model = this.objectManager.getPickedAsHalfEdgeMesh().closestPointOnMesh(pp[i]);
      const d = Vector3.DistanceSquared(pp[i], model.point);
      if (d < 0.00000001) {
        myMaterial.diffuseColor = this.tertiaryColor;
      } else {
        myMaterial.diffuseColor = new Color3(1, 0, 0);
        this.debugPointLine[i].position = model.point;
        console.log('red dot: ' + Math.sqrt(d));
      }
      this.debugPointLine[i].material = myMaterial;
    }
  }

  export(appFacadeApi: AppFacadeApi) {
    const angularCallback = (serialized) => {
      // TODO: Jerzy, I also need the case name here
      const filename = this.objectManager.caseName + '-' + this.objectManager.preparationToothNumber + '-' + this.name + '-debug.xyz';
      const exampleFile = new File([serialized], filename, {
        type: 'text/plain',
      });
      appFacadeApi.exportToCaseFolderLocation(exampleFile);
    };

    const curve = this.polyline.getCurve();
    let serialize: string = curve.length.toString() + '\n';
    for (const c of curve) {
      serialize += c._x + ' ' + c._y + ' ' + c._z + ' ' + '\n';
    }

    angularCallback(serialize);
  }

  import(points: Vector3[]): boolean {
    if (points) {
      const triangleIdx = [];
      this.objectManager.getPickedAsHalfEdgeMesh().closestPointsOnMesh(points, triangleIdx);
      this.polyline = new TriangulationPolyline(points, triangleIdx, this.objectManager.getPickedAsHalfEdgeMesh());
      this.drawLine(this.name);

      // this.polyline.distanceStatistic();
      // this.polyline.refineLine(0.08);
      // this.polyline.distanceStatistic();

      return true;
    }

    return false;
  }

  validate(): boolean {
    let ok = true;
    const line = this.polyline.getCurve();
    const len = line.length;
    for (let i = 0; i < len; i++) {
      const a = line[(len + i - 1) % len];
      const b = line[(i + 1) % len];
      const c = line[i];

      const test =
        Vector3.Dot(b.subtract(a).normalize(), c.subtract(b).normalize()) <= 0 &&
        Vector3.Dot(a.subtract(b).normalize(), c.subtract(a).normalize()) <= 0;

      if (!test) {
        Debug.getInstance().debug_point(c, 0.05);
        Debug.getInstance().debug_point(a, 0.05, new Color3(0, 1, 0));
        Debug.getInstance().debug_point(b, 0.05, new Color3(0, 0, 1));
      }

      ok = ok && test;
    }
    return ok;
  }
}
