import { Color3, Color4, FloatArray, Orientation, Vector3 } from '@babylonjs/core';
import IAlgorithm from './IAlgorithm';
import TriangulationPolyline from './TriangulationPolyline';
import CRHalfEdgeMesh from './../../../geometry-processing-js/core/CRHalfEdgeMesh';
import Debug from '../debug/Debug';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import CRHalfEdge from '@app/modules/geometry-processing-js/core/CRHalfEdge';
import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import LargeHoleFillingAlgorithm from '@app/modules/geometry-processing-js/core/large-hole-filling';

export default class FillThinSpaceBetweenTriAndLineAlgorithm implements IAlgorithm {
  constructor(mesh: CRHalfEdgeMesh, polyline: TriangulationPolyline, up: Vector3, visibility = 0, colors?: FloatArray) {
    this.mesh = mesh;
    this.polyline = polyline;
    this.up = up;
    this.visibility = visibility;
    this.colors = colors;
  }

  private mesh: CRHalfEdgeMesh;
  private polyline: TriangulationPolyline;
  private up: Vector3;
  private visibility: number;
  private colors: FloatArray;

  private newBoundary0HalfEdges: CRHalfEdge[];
  private newBoundary1HalfEdges: CRHalfEdge[];

  compute(): any {
    // check the performance
    const t0 = performance.now();

    // remove fins
    this.mesh.removeFins();

    const fill = new LargeHoleFillingAlgorithm(this.mesh);
    fill.setBoundaryFace(this.mesh.boundaries[0]);
    fill.compute();

    let d2 = Number.MAX_SAFE_INTEGER;
    let minIdx = -1;
    let start: CRHalfEdge;

    let next = this.mesh.boundaries[0].halfedge;
    do {
      const v = next.vertex;
      const model = this.polyline.getMinDistanceSquared(v);
      if (model.distanceSquared < d2) {
        d2 = model.distanceSquared;
        minIdx = model.index;
        start = next;
      }
      next = next.next;
    } while (next !== this.mesh.boundaries[0].halfedge);

    const boundaryLen = CRHalfEdgeMesh.BoundaryLength(start);
    const lineLen = this.polyline.getCurve().length;
    const factor = (2.5 * lineLen) / boundaryLen;

    let idx;
    let curve: Vector3[];
    if (this.polyline.isCCW(this.up)) {
      curve = this.polyline.getCurve();
      idx = minIdx;
    } else {
      curve = [];
      for (const c of this.polyline.getCurve()) {
        curve.unshift(c);
      }
      idx = lineLen - minIdx;
    }

    next = start;
    do {
      const v = next.vertex;

      if (next === start) {
        // Debug.getInstance().debug_point(v);
      }

      let minIndex = -1;
      let minDist = Number.MAX_SAFE_INTEGER;
      for (let i = idx; i < idx + factor; i++) {
        const d = Vector3.DistanceSquared(curve[i % lineLen], v);
        if (d < minDist) {
          minDist = d;
          minIndex = i;
        }
      }

      v.copyFrom(curve[minIndex % lineLen]);
      v.fixedNormal = new Vector3();
      v.fixedNormal.copyFrom(this.polyline.getTriangle(minIndex % lineLen).calcNormal());
      // TODO: Normals seems to be incorrect
      // Debug.getInstance().add_pin(v, v.fixedNormal);
      // Debug.getInstance().debug_face(this.polyline.getTriangle(minIndex % lineLen));

      next = next.next;
      idx = minIndex + 1;
    } while (next !== start);

    const t1 = performance.now();
    console.log('Call to FillThinSpaceBetweenTriAndLineAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return undefined;
  }

  /*
  compute(): any {
    // check the performance
    const t0 = performance.now();

    // remove fins
    this.mesh.removeFins();

    this.createVerticesOnLine(this.mesh.boundaries[0]);

    this.createSmallestTriangle();

    const fill = new LargeHoleFillingAlgorithm(this.mesh);
    fill.setBoundaryFace(this.mesh.boundaries[0]);
    fill.compute();

    const t1 = performance.now();
    console.log('Call to FillThinSpaceBetweenTriAndLineAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return undefined;
  }

  protected createVerticesOnLine(boundaryFace: CRFace){
    // create new boundary face
    const bf = new CRFace();
    this.mesh.boundaries.push(bf);
    bf.index = this.mesh.boundaries.length - 1;

    this.newBoundary0HalfEdges = [];
    this.newBoundary1HalfEdges = [];
    const len = this.polyline.getCurve().length;
    for (let i = 0; i < len; i++){
      const c = this.polyline.getCurve()[i];
      const v = this.mesh.createVertex(c, new Color4(1, 0, 0, 1));
      v.fixedNormal = this.polyline.getNormal(i);
      const he = this.mesh.createHalfEdge(v, true);
      he.face = bf;
      this.newBoundary1HalfEdges.push(he);
    }
    bf.halfedge = this.newBoundary1HalfEdges[0];

    // const len = this.newBoundary1HalfEdges.length;
    for (let i = 0; i < len; i++){
      this.newBoundary1HalfEdges[i].next = this.newBoundary1HalfEdges[(i + 1) % len];
      this.newBoundary1HalfEdges[(i + 1) % len].prev = this.newBoundary1HalfEdges[i];

      this.newBoundary1HalfEdges[i].prev = this.newBoundary1HalfEdges[(len + i - 1) % len];
      this.newBoundary1HalfEdges[(len + i - 1) % len].next = this.newBoundary1HalfEdges[i];
    }

    for (let i = 0; i < len; i++){
      const he = this.mesh.createHalfEdge(this.newBoundary1HalfEdges[i].next.vertex, true);
      he.face = boundaryFace;
      const e = this.mesh.createEdge(this.newBoundary1HalfEdges[i], he);
      this.newBoundary0HalfEdges.push(he);
    }

    for (let i = 0; i < len; i++){
      this.newBoundary0HalfEdges[i].prev = this.newBoundary0HalfEdges[(i + 1) % len];
      this.newBoundary0HalfEdges[(i + 1) % len].next = this.newBoundary0HalfEdges[i];

      this.newBoundary0HalfEdges[i].next = this.newBoundary0HalfEdges[(len + i - 1) % len];
      this.newBoundary0HalfEdges[(len + i - 1) % len].prev = this.newBoundary0HalfEdges[i];
    }
  }

  protected createSmallestTriangle(){
    let d2 = Number.MAX_SAFE_INTEGER;
    let minIdx = -1;
    let he3: CRHalfEdge;

    let next = this.mesh.boundaries[0].halfedge;
    do{
      const v = next.vertex;
      const model = this.polyline.getMinDistanceSquared(v);
      if (model.distanceSquared < d2){
        d2 = model.distanceSquared;
        minIdx = model.index;
        he3 = next;
      }
      next = next.next;
    }while (next !== this.mesh.boundaries[0].halfedge);

    const he4 = he3.prev;
    const v0 = he3.vertex;

    const minHe = this.newBoundary0HalfEdges[minIdx];
    const heA = minHe.next;
    const heB = minHe.prev;

    let he1: CRHalfEdge;
    if (Vector3.DistanceSquared(minHe.vertex, heA.vertex) < Vector3.DistanceSquared(minHe.vertex, heB.vertex)){
      he1 = minHe.next.twin;
    }else{
      he1 = minHe.twin;
    }

    // Debug.getInstance().debug_halfEdge(he3.next, new Color3(1, 1, 0));
    // Debug.getInstance().debug_halfEdge(he3.prev, new Color3(1, 1, 0));
    // Debug.getInstance().debug_halfEdge(he1.next, new Color3(0, 1, 1));
    // Debug.getInstance().debug_halfEdge(he1.prev, new Color3(0, 1, 1));

    const he7 = he1.prev;
    const he8 = he1.next;
    const v1 = he1.vertex;
    const v2 = he8.vertex;

    const he0 = this.mesh.createHalfEdge(v0, false);
    const he2 = this.mesh.createHalfEdge(v2, false);
    he1.onBoundary = false;

    this.mesh.createFace(he0, he1, he2);

    const he5 = this.mesh.createHalfEdge(v1, true);
    const he6 = this.mesh.createHalfEdge(v0, true);
    he5.face = this.mesh.boundaries[0];
    he6.face = this.mesh.boundaries[0];

    this.mesh.createEdge(he0, he5);
    this.mesh.createEdge(he2, he6);

    he7.next = he5;
    he5.next = he3;
    he3.prev = he5;
    he5.prev = he7;

    he4.next = he6;
    he6.next = he8;
    he8.prev = he6;
    he6.prev = he4;

    // Debug.getInstance().debug_point(v0, 0.02);
    // Debug.getInstance().debug_point(v1, 0.02, new Color3(0, 1, 0));
    // Debug.getInstance().debug_point(v2, 0.02, new Color3(0, 0, 1));

    Debug.getInstance().debug_halfEdge(he4, new Color3(1, 0, 0));
    Debug.getInstance().debug_halfEdge(he6, new Color3(0, 1, 0));
    Debug.getInstance().debug_halfEdge(he8, new Color3(0, 0, 1));

    Debug.getInstance().debug_halfEdge(he3, new Color3(1, 0, 0));
    Debug.getInstance().debug_halfEdge(he5, new Color3(0, 1, 0));
    Debug.getInstance().debug_halfEdge(he7, new Color3(0, 0, 1));

  }
  */
}
