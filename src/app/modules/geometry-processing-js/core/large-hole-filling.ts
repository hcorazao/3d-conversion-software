import Debug from '@app/modules/rendering/core/debug/Debug';
import { Color4, Vector3 } from '@babylonjs/core';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import CRHalfEdge from './CRHalfEdge';
import CRFace from './CRFace';
import CRVertex from './CRVertex';
import HalfEdgeMesh from './halfedgemesh';

export default class LargeHoleFillingAlgorithm {
  protected mesh: CRHalfEdgeMesh;
  protected boundaryFace: CRFace;
  protected newVertices: CRVertex[];

  protected readonly LOW_ANGLE = (90 / 180) * Math.PI;
  protected readonly HIGH_ANGLE = (140 / 180) * Math.PI;

  constructor(mesh: CRHalfEdgeMesh, boundaryFace?: CRFace) {
    this.mesh = mesh;
    this.boundaryFace = boundaryFace;
  }

  protected angle(he: CRHalfEdge, up: Vector3): number {
    const v1 = he.prev.vector().negate();
    const v2 = he.vector();

    const dot = Vector3.Dot(v1, v2);
    const cross = Vector3.Cross(v1, v2);

    let angle = Math.atan2(cross.length(), dot);

    const test = Vector3.Dot(up, cross);
    if (test > 0.0) {
      angle = 2 * Math.PI - angle;
    }

    return angle;
  }

  protected intersection(he: CRHalfEdge, up: Vector3, angle: number): { w1: Vector3; w2: Vector3 } {
    const v1 = he.prev.vector().negate();
    const v2 = he.vector();

    let w1: Vector3;
    let w2;
    if (angle <= this.LOW_ANGLE) {
      w1 = undefined;
      w2 = undefined;
    } else if (angle > this.HIGH_ANGLE) {
      w1 = v2.scale(Math.cos((2 * angle) / 3)).add(Vector3.Cross(up, v2).scale(Math.sin((2 * angle) / 3)));
      w2 = v2.scale(Math.cos(angle / 3)).add(Vector3.Cross(up, v2).scale(Math.sin(angle / 3)));

      // w1 = v2.normalizeToNew().add(v1.normalizeToNew().scale(2)).normalize();
      // w2 = v1.normalizeToNew().add(v2.normalizeToNew().scale(2)).normalize();
    } else {
      w1 = v1.normalizeToNew().add(v2.normalizeToNew()).normalize();
      w2 = undefined;
    }

    // project on up-plane
    if (w1) {
      const dist1 = Vector3.Dot(w1, up);
      w1.subtractInPlace(up.scale(dist1));
      w1.normalize();
      w1.scaleInPlace((v1.length() + v2.length()) / 1.9);
      w1.addInPlace(he.vertex);
    }
    if (w2) {
      const dist2 = Vector3.Dot(w2, up);
      w2.subtractInPlace(up.scale(dist2));
      w2.normalize();
      w2.scaleInPlace((v1.length() + v2.length()) / 1.9);
      w2.addInPlace(he.vertex);
    }

    return { w1, w2 };
  }

  setBoundaryFace(boundaryFace: CRFace) {
    if (!boundaryFace.isBoundaryLoop()) {
      console.error('Not a boundary face!');
      this.boundaryFace = undefined;
      return;
    }

    this.boundaryFace = boundaryFace;
  }

  compute() {
    // check the performance
    const t0 = performance.now();

    this.newVertices = [];

    let len = 10000;
    let done = false;
    while (!done && len > 10) {
      done = true;
      const minHe = this.findSmallestAngle(this.boundaryFace.halfedge);
      len = minHe.len;

      if (minHe.angle <= this.LOW_ANGLE) {
        this.handleSmallAngle(minHe.halfEdge);
        len--;
        done = false;
      } else if (minHe.angle > this.HIGH_ANGLE) {
        // this.handleLargeAngle(minHe.halfEdge, minHe.w1, minHe.w2);
        // done = false;
        len++;

        if (minHe.angle > Math.PI) {
          console.error('angle > PI!');
          done = true;
        }
      } else {
        // this.handleMediumAngle(minHe.halfEdge, minHe.w1);
        // done = false;
      }
    }

    const t1 = performance.now();
    console.log('Call to LargeHoleFillingAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');
  }

  calcBoundaryNormal(he: CRHalfEdge, n: number): Vector3 {
    const vi = he.vertex;
    const nr = new Vector3();
    const nl = new Vector3();

    let next = he.next;
    for (let i = 0; i < n; i++) {
      const u = vi.subtract(next.vertex).normalize();
      const w = vi.subtract(next.next.vertex).normalize();
      const dot = Vector3.Dot(u, w);
      const cross = Vector3.Cross(u, w);
      const angle = Math.atan2(cross.length(), dot);
      if (angle > (10 / 180) * Math.PI) {
        nr.addInPlace(Vector3.Cross(u, w));
      }
      next = next.next;
    }
    nr.normalize();

    let prev = he.prev;
    for (let i = 0; i < n; i++) {
      const u = vi.subtract(prev.prev.vertex).normalize();
      const w = vi.subtract(prev.vertex).normalize();
      const dot = Vector3.Dot(u, w);
      const cross = Vector3.Cross(u, w);
      const angle = Math.atan2(cross.length(), dot);
      if (angle > (10 / 180) * Math.PI) {
        nl.addInPlace(Vector3.Cross(u, w));
      }
      prev = prev.prev;
    }
    nl.normalize();

    return nr.add(nl).normalize();

    /*
    const el = new Vector3();
    const er = new Vector3();

    let next = he.next;
    for (let i = 0; i < n; i++){
      er.addInPlace(vi.subtract(next.vertex));
      next = next.next;
    }

    let prev = he.prev;
    for (let i = 0; i < n; i++){
      el.addInPlace(vi.subtract(prev.vertex));
      prev = prev.prev;
    }

    const collinear = Vector3.Dot(er, el) / (er.length() * el.length()) > 1 - 0.01;
    if (!collinear){
      // Debug.getInstance().debug_point(he.vertex, 0.05, new Color3(1, 1, 0));
      return undefined;
    }

    return Vector3.Cross(er, el).normalize();
    */
  }

  findSmallestAngle(
    he: CRHalfEdge
  ): { halfEdge: CRHalfEdge; angle: number; w1: Vector3; w2: Vector3; len: number; ni: Vector3; ne: Vector3; nc: Vector3 } {
    const alpha = 0.5;
    const len = HalfEdgeMesh.BoundaryLength(he);
    const boundary: CRHalfEdge[] = [];

    let w1: Vector3;
    let w2: Vector3;
    const ni = new Vector3();
    const ne = new Vector3();
    const nc = new Vector3();
    let minAngle = 10;
    let next = he;
    let minIdx = -1;
    for (let i = 0; i < len; i++) {
      boundary.push(next);

      const nI = next.vertex
        .normalEquallyWeighted()
        .add(next.prev.vertex.normalEquallyWeighted())
        .add(next.next.vertex.normalEquallyWeighted());
      nI.scaleInPlace(1 / 3);

      const nE = this.calcBoundaryNormal(he, Math.max(4, Math.ceil(len / 10)));
      // if (Vector3.Dot(nI, nE) < 0){
      // nE.copyFrom(nE.negate());
      // }

      let nC;
      if (nE) {
        nC = nI.scale(alpha).add(nE.scale(1 - alpha));
      } else {
        nC = nI.scale(1);
      }

      const angle = this.angle(next, nC);
      if (angle < minAngle) {
        const intersect = this.intersection(next, nC, angle);

        minAngle = angle;
        minIdx = i;
        w1 = intersect.w1;
        w2 = intersect.w2;
        ni.copyFrom(nI);
        if (nE) {
          ne.copyFrom(nE);
        }
        nc.copyFrom(nC);
      }

      next = next.next;
    }

    return { halfEdge: boundary[minIdx], angle: minAngle, w1, w2, len, ni, ne, nc };
  }

  smooth() {
    const lambda = 0.85;
    const positions: Vector3[] = [];
    for (const v of this.newVertices) {
      const c = new Vector3();
      if (!v.onBoundary()) {
        let num = 0;
        for (const w of v.adjacentVertices()) {
          c.addInPlace(w);
          num++;
        }
        c.scaleInPlace(1 / num);
        positions.push(c);
      } else {
        c.copyFrom(v);
        positions.push(c);
      }
    }
    let i = 0;
    for (const v of this.newVertices) {
      const l = v.scale(lambda).add(positions[i++].scale(1 - lambda));
      v.copyFrom(l);
    }
  }

  handleSmallAngle(he: CRHalfEdge) {
    const bthe2 = he;
    const bthe1 = bthe2.prev;
    const bthe0 = bthe1.prev;
    const bthe3 = bthe2.next;
    const tbhe1 = bthe2.twin;
    const tahe1 = bthe1.twin;
    const BT = he.face;
    const V1 = bthe1.vertex;
    const V2 = bthe2.vertex;
    const V3 = tbhe1.vertex;

    // delete 2 half edges
    bthe1.dispose(this.mesh);
    bthe2.dispose(this.mesh);

    // create 3 new half edges for the face TN
    const tnhe0 = this.mesh.createHalfEdge(V1, false);
    const tnhe1 = this.mesh.createHalfEdge(V2, false);
    const tnhe2 = this.mesh.createHalfEdge(V3, false);

    // create new face
    this.mesh.createFace(tnhe0, tnhe1, tnhe2);

    // create new boundary half edge
    const bthei = this.mesh.createHalfEdge(V1, true);
    bthei.face = BT;
    BT.halfedge = bthei;

    // create new edge
    this.mesh.createEdge(bthei, tnhe2);

    // update two edges
    tbhe1.edge.update(tbhe1, tnhe1);
    tahe1.edge.update(tahe1, tnhe0);

    // update vertex
    if (V1.halfedge.index === -1) {
      V1.halfedge = tnhe0;
    }
    if (V2.halfedge.index === -1) {
      V2.halfedge = tnhe1;
    }

    // connect boundary
    bthe0.next = bthei;
    bthei.next = bthe3;
    bthe3.prev = bthei;
    bthei.prev = bthe0;
  }

  handleMediumAngle(he: CRHalfEdge, w1: Vector3) {
    const bthe2 = he;
    const bthe1 = bthe2.prev;
    const bthe0 = bthe1.prev;
    const bthe3 = bthe2.next;
    const tbhe1 = bthe2.twin;
    const tahe1 = bthe1.twin;
    const BT = he.face;
    const V1 = bthe1.vertex;
    const V2 = bthe2.vertex;
    const V3 = tbhe1.vertex;
    const W = this.mesh.createVertex(w1, new Color4(242 / 256, 209 / 256, 107 / 256, 1));
    this.newVertices.push(W);

    // delete 2 half edges
    bthe1.dispose(this.mesh);
    bthe2.dispose(this.mesh);

    // create 3 new half edges for the face TN
    const tnhe0 = this.mesh.createHalfEdge(W, false);
    const tnhe1 = this.mesh.createHalfEdge(V1, false);
    const tnhe2 = this.mesh.createHalfEdge(V2, false);

    // create 3 new half edges for the face TM
    const tmhe0 = this.mesh.createHalfEdge(V3, false);
    const tmhe1 = this.mesh.createHalfEdge(W, false);
    const tmhe2 = this.mesh.createHalfEdge(V2, false);

    W.halfedge = tmhe1;

    // create 2 new faces
    this.mesh.createFace(tnhe0, tnhe1, tnhe2);
    this.mesh.createFace(tmhe0, tmhe1, tmhe2);

    // create 2 new boundary half edges
    const bthei = this.mesh.createHalfEdge(V1, true);
    bthei.face = BT;
    BT.halfedge = bthei;
    const bthej = this.mesh.createHalfEdge(W, true);
    bthej.face = BT;

    // create 3 new edges
    this.mesh.createEdge(bthei, tnhe0);
    this.mesh.createEdge(bthej, tmhe0);
    this.mesh.createEdge(tnhe2, tmhe1);

    // update two edges
    tbhe1.edge.update(tbhe1, tmhe2);
    tahe1.edge.update(tahe1, tnhe1);

    // update vertex
    if (V1.halfedge.index === -1) {
      V1.halfedge = tnhe1;
    }
    if (V2.halfedge.index === -1) {
      V2.halfedge = tmhe2;
    }

    // connect boundary
    bthe0.next = bthei;
    bthei.next = bthej;
    bthej.next = bthe3;
    bthe3.prev = bthej;
    bthej.prev = bthei;
    bthei.prev = bthe0;
  }

  handleLargeAngle(he: CRHalfEdge, w1: Vector3, w2: Vector3) {
    const bthe2 = he;
    const bthe1 = bthe2.prev;
    const bthe0 = bthe1.prev;
    const bthe3 = bthe2.next;
    const tbhe1 = bthe2.twin;
    const tahe1 = bthe1.twin;
    const TA = tahe1.face;
    const TB = tbhe1.face;
    const BT = he.face;
    const V1 = bthe1.vertex;
    const V2 = bthe2.vertex;
    const V3 = tbhe1.vertex;
    const W = this.mesh.createVertex(w1, new Color4(242 / 256, 209 / 256, 107 / 256, 1));
    const U = this.mesh.createVertex(w2, new Color4(242 / 256, 209 / 256, 107 / 256, 1));
    this.newVertices.push(W);
    this.newVertices.push(U);

    // delete 2 half edges
    bthe1.dispose(this.mesh);
    bthe2.dispose(this.mesh);

    // create 3 new half edges for the face TN
    const tnhe0 = this.mesh.createHalfEdge(W, false);
    const tnhe1 = this.mesh.createHalfEdge(V1, false);
    const tnhe2 = this.mesh.createHalfEdge(V2, false);

    // create 3 new half edges for the face TM
    const tmhe0 = this.mesh.createHalfEdge(U, false);
    const tmhe1 = this.mesh.createHalfEdge(W, false);
    const tmhe2 = this.mesh.createHalfEdge(V2, false);

    // create 3 new half edges for the face TO
    const tohe0 = this.mesh.createHalfEdge(V3, false);
    const tohe1 = this.mesh.createHalfEdge(U, false);
    const tohe2 = this.mesh.createHalfEdge(V2, false);

    W.halfedge = tmhe1;
    U.halfedge = tohe1;

    // create 3 new faces
    this.mesh.createFace(tnhe0, tnhe1, tnhe2);
    this.mesh.createFace(tmhe0, tmhe1, tmhe2);
    this.mesh.createFace(tohe0, tohe1, tohe2);

    // create 3 new boundary half edges
    const bthei = this.mesh.createHalfEdge(V1, true);
    bthei.face = BT;
    BT.halfedge = bthei;
    const bthej = this.mesh.createHalfEdge(W, true);
    bthej.face = BT;
    const bthek = this.mesh.createHalfEdge(U, true);
    bthek.face = BT;

    // create 5 new edges
    this.mesh.createEdge(bthei, tnhe0);
    this.mesh.createEdge(bthej, tmhe0);
    this.mesh.createEdge(bthek, tohe0);
    this.mesh.createEdge(tnhe2, tmhe1);
    this.mesh.createEdge(tmhe2, tohe1);

    // update two edges
    tbhe1.edge.update(tbhe1, tohe2);
    tahe1.edge.update(tahe1, tnhe1);

    // update vertex
    if (V1.halfedge.index === -1) {
      V1.halfedge = tnhe1;
    }
    if (V2.halfedge.index === -1) {
      V2.halfedge = tmhe2;
    }

    // connect boundary
    bthe0.next = bthei;
    bthei.next = bthej;
    bthej.next = bthek;
    bthek.next = bthe3;

    bthe3.prev = bthek;
    bthek.prev = bthej;
    bthej.prev = bthei;
    bthei.prev = bthe0;
  }
}
