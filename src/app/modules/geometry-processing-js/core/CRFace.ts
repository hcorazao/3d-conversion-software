import { Vector3 } from '@babylonjs/core';
import CRHalfEdge from './CRHalfEdge';
import Face from './face';
import Halfedge from './halfedge';

export default class CRFace extends Face {
  /**
   * This class represents a face in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Face
   * @property {module:Core.Halfedge} halfedge One of the halfedges associated with this face.
   */
  constructor() {
    super();
  }

  static CalcNormal(vector0: Vector3, vector1: Vector3, vector2: Vector3): Vector3 {
    const p1p2 = vector0.subtract(vector1);
    const p3p2 = vector2.subtract(vector1);
    const normal = Vector3.Normalize(Vector3.Cross(p1p2, p3p2));
    return normal;
  }

  static CalcCenter(vector0: Vector3, vector1: Vector3, vector2: Vector3): Vector3 {
    const reference = vector0.clone();
    reference.addInPlace(vector1);
    reference.addInPlace(vector2);
    reference.scaleInPlace(1 / 3);
    return reference;
  }

  static CalcArea(v0: Vector3, v1: Vector3, v2: Vector3): number {
    const u = v1.subtract(v0);
    const v = v2.subtract(v0);
    const area = 0.5 * u.cross(v).length();

    return area;
  }

  static CalcAreaSquared(v0: Vector3, v1: Vector3, v2: Vector3): number {
    const u = v1.subtract(v0);
    const v = v2.subtract(v0);
    const area = 0.5 * u.cross(v).lengthSquared();

    return area;
  }

  update(he0: CRHalfEdge, he1: CRHalfEdge, he2: CRHalfEdge) {
    this.halfedge = he0;

    he0.face = this;
    he1.face = this;
    he2.face = this;

    he0.next = he1;
    he1.next = he2;
    he2.next = he0;

    he2.prev = he1;
    he1.prev = he0;
    he0.prev = he2;
  }

  /**
   * Determines whether the face is a fin (has 2 boundary edges)
   * @returns true if face is a fin
   */
  isFin(): boolean {
    let boundaryEdges = 0;
    if (this.halfedge.twin.onBoundary) {
      boundaryEdges++;
    }
    if (this.halfedge.next.twin.onBoundary) {
      boundaryEdges++;
    }
    if (this.halfedge.next.next.twin.onBoundary) {
      boundaryEdges++;
    }
    return boundaryEdges === 2;
  }

  /**
   * Calculates the area of the face.
   * @returns area of the face
   */
  area(): number {
    const u = this.halfedge.next.vertex.subtract(this.halfedge.vertex);
    const v = this.halfedge.next.next.vertex.subtract(this.halfedge.vertex);
    return 0.5 * u.cross(v).length();
  }

  calcNormal(): Vector3 {
    if (this.isBoundaryLoop()) {
      return undefined;
    }

    const u = this.halfedge.vector();
    const v = this.halfedge.prev.vector().negate();
    return v.cross(u).normalize();
  }

  calcCenter(): Vector3 {
    if (this.isBoundaryLoop()) {
      return undefined;
    }

    const center = new Vector3();
    center.copyFrom(this.halfedge.vertex);
    center.addInPlace(this.halfedge.next.vertex);
    center.addInPlace(this.halfedge.next.next.vertex);
    return center.scale(1 / 3);
  }

  /**
   * Computes the normal at a vertex using the "equally weighted" method.
   * @method module:Core.Geometry#vertexNormalEquallyWeighted
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalEquallyWeighted(): Vector3 {
    const n = new Vector3();
    n.addInPlace(this.calcNormal());
    for (const f of this.adjacentFaces()) {
      const normal = f.calcNormal();

      n.addInPlace(normal);
    }

    n.normalize();

    return n;
  }

  /**
   * Computes the normal at a vertex using the "face area weights" method.
   * @method module:Core.Geometry#vertexNormalAreaWeighted
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalAreaWeighted(): Vector3 {
    const n = new Vector3();
    n.addInPlace(this.calcNormal().scale(this.area()));
    for (const f of this.adjacentFaces()) {
      const normal = f.calcNormal();
      const area = f.area();

      n.addInPlace(normal.scale(area));
    }

    n.normalize();

    return n;
  }

  pointInTriangle(queryPoint: Vector3, projectedPoint?: Vector3): boolean {
    // u=P2−P1
    const u = this.halfedge.next.vertex.subtract(this.halfedge.vertex);
    // v=P3−P1
    const v = this.halfedge.next.next.vertex.subtract(this.halfedge.vertex);
    // n=u×v
    const n = u.cross(v);
    // w=P−P1
    const w = queryPoint.subtract(this.halfedge.vertex);

    // Barycentric coordinates of the projection P′of P onto T:
    // γ=[(u×w)⋅n]/n²
    const gamma = Vector3.Dot(u.cross(w), n) / Vector3.Dot(n, n);

    // β=[(w×v)⋅n]/n²
    const beta = Vector3.Dot(w.cross(v), n) / Vector3.Dot(n, n);
    const alpha = 1 - gamma - beta;

    // The point P′ lies inside T if:
    const inside = 0 <= alpha && alpha <= 1 && 0 <= beta && beta <= 1 && 0 <= gamma && gamma <= 1;

    // Barycentric projection point
    // P′=αP1+βP2+γP3
    if (inside && projectedPoint) {
      projectedPoint.copyFrom(
        this.halfedge.vertex.scale(alpha).add(this.halfedge.next.vertex.scale(beta)).add(this.halfedge.next.next.vertex.scale(gamma))
      );
    }

    return inside;
  }

  pointInTriangle2(p: Vector3, target: Vector3): boolean {
    const a = this.halfedge.vertex;
    const b = this.halfedge.next.vertex;
    const c = this.halfedge.next.next.vertex;
    let v;
    let w;

    // algorithm thanks to Real-Time Collision Detection by Christer Ericson,
    // published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
    // under the accompanying license; see chapter 5.1.5 for detailed explanation.
    // basically, we're distinguishing which of the voronoi regions of the triangle
    // the point lies in with the minimum amount of redundant computation.

    const vab = b.subtract(a);
    const vac = c.subtract(a);
    const vap = p.subtract(a);
    const d1 = Vector3.Dot(vab, vap);
    const d2 = Vector3.Dot(vac, vap);
    if (d1 <= 0 && d2 <= 0) {
      return false;
      // vertex region of A; barycentric coords (1, 0, 0)
      // return target.copyFrom( a );
    }

    const vbp = p.subtract(b);
    const d3 = Vector3.Dot(vab, vbp);
    const d4 = Vector3.Dot(vac, vbp);
    if (d3 >= 0 && d4 <= d3) {
      return false;
      // vertex region of B; barycentric coords (0, 1, 0)
      // return target.copyFrom( b );
    }

    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      return false;
      v = d1 / (d1 - d3);
      // edge region of AB; barycentric coords (1-v, v, 0)
      // return target.copyFrom( a.add( vab.scale( v )));
    }

    const vcp = p.subtract(c);
    const d5 = Vector3.Dot(vab, vcp);
    const d6 = Vector3.Dot(vac, vcp);
    if (d6 >= 0 && d5 <= d6) {
      return false;
      // vertex region of C; barycentric coords (0, 0, 1)
      // return target.copyFrom( c );
    }

    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      return false;
      w = d2 / (d2 - d6);
      // edge region of AC; barycentric coords (1-w, 0, w)
      // return target.copyFrom( a.add( vac.scale( w )));
    }

    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      return false;
      const vbc = c.subtract(b);
      w = (d4 - d3) / (d4 - d3 + (d5 - d6));
      // edge region of BC; barycentric coords (0, 1-w, w)
      // return target.copyFrom( b.add( vbc.scale( w ))); // edge region of BC
    }

    // face region
    const denom = 1 / (va + vb + vc);
    // u = va * denom
    v = vb * denom;
    w = vc * denom;

    target.copyFrom(a.add(vab.scale(v)).add(vac.scale(w)));
    return true;
  }
}
