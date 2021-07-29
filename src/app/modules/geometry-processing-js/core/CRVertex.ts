import { Vector3 } from '@babylonjs/core';
import Vertex from './vertex';
import CRCorner from './CRCorner';
import CRHalfEdge from './CRHalfEdge';

export default class CRVertex extends Vertex {
  /**
   * This class represents a vertex in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Vertex
   * @property {module:Core.Halfedge} halfedge One of the outgoing halfedges associated with this vertex.
   */
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z);
  }

  getBoundaryHalfEdge(): CRHalfEdge {
    for (const h of this.adjacentHalfedges()) {
      if (h.onBoundary) {
        return h;
      }
    }

    return undefined;
  }

  barycentricDualArea(): number {
    let area = 0.0;
    for (const face of this.adjacentFaces()) {
      area += face.area() / 3;
    }

    return area;
  }

  /**
   * Computes the normal at a vertex using the "equally weighted" method.
   * @method module:Core.Geometry#vertexNormalEquallyWeighted
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalEquallyWeighted(): Vector3 {
    if (this.fixedNormal) {
      return this.fixedNormal;
    }

    const n = new Vector3();
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
    if (this.fixedNormal) {
      return this.fixedNormal;
    }

    const n = new Vector3();
    for (const f of this.adjacentFaces()) {
      const normal = f.calcNormal();
      const area = f.area();

      n.addInPlace(normal.scale(area));
    }

    n.normalize();

    return n;
  }

  /**
   * Computes the normal at a vertex using the "tip angle weights" method.
   * @method module:Core.Geometry#vertexNormalAngleWeighted
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalAngleWeighted(): Vector3 {
    if (this.fixedNormal) {
      return this.fixedNormal;
    }

    const n = new Vector3();
    for (const x of this.adjacentCorners()) {
      const c = x as CRCorner;
      const normal = c.halfedge.face.calcNormal();
      const angle = c.angle();

      n.addInPlace(normal.scale(angle));
    }

    n.normalize();

    return n;
  }

  /**
   * Computes the normal at a vertex using the "gauss curvature" method.
   * @method module:Core.Geometry#vertexNormalGaussCurvature
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalGaussCurvature(): Vector3 {
    if (this.fixedNormal) {
      return this.fixedNormal;
    }

    const n = new Vector3();
    for (const x of this.adjacentHalfedges()) {
      const h = x as CRHalfEdge;
      const weight = (0.5 * h.dihedralAngle()) / h.edge.length();

      n.addInPlace(h.vector().scale(weight));
    }

    n.normalize();

    return n;
  }

  /**
   * Computes the normal at a vertex using the "mean curvature" method (same as the "area gradient" method).
   * @method module:Core.Geometry#vertexNormalMeanCurvature
   * @param {module:Core.Vertex} v The vertex on which the normal needs to be computed.
   * @returns {module:LinearAlgebra.Vector}
   */
  normalMeanCurvature(): Vector3 {
    if (this.fixedNormal) {
      return this.fixedNormal;
    }

    const n = new Vector3();
    for (const x of this.adjacentHalfedges()) {
      const h = x as CRHalfEdge;
      const weight = 0.5 * (h.cotan() + h.twin.cotan());

      n.addInPlace(h.vector().scale(weight));
    }

    n.normalize();

    return n;
  }
}
