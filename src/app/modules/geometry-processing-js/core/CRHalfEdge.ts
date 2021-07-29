import { Vector3 } from '@babylonjs/core';
import CRVertex from './CRVertex';
import Halfedge from './halfedge';

/**
 * This module implements a halfedge mesh data structure and its associated geometry.
 * A halfedge mesh stores mesh elements such as vertices, edges and faces as well as
 * their connectivity information. The latter is particulary important in geometry
 * processing, as algorithms often exploit local connectivity of mesh elements. At
 * the cost of slightly higher memory consumption compared to other data structures,
 * a halfedge mesh enables quick access of mesh elements. For example, it is possible to
 * enumerate the vertices and edges contained in and faces adjacent to any single face
 * in a mesh. Similar enumerations are also possible for any vertex or edge in a mesh.
 * Additionally, its possible to perform global traversals that enumerate over all mesh
 * vertices, edges and faces in an unspecified but fixed order.
 *
 * <img src="../imgs/halfedge.png">
 *
 * The diagram above illustrates how connectivity information is stored locally in a
 * halfedge mesh. The key idea is to split a edge into two directed halfedges. Each
 * halfedge stores a reference to the vertex at its base, the edge it lies on, the
 * face adjacent to it, the next halfedge in counter clockwise order, and the opposite
 * (or twin) halfedge. Each vertex, edge and face of a mesh in turn stores a reference
 * to one of the halfedges (outgoing in the case of a vertex) its incident on.
 *
 * @module Core
 */
export default class CRHalfEdge extends Halfedge {
  /**
   * This class defines the connectivity of a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Halfedge
   * @property {module:Core.Vertex} vertex The vertex at the base of this halfedge.
   * @property {module:Core.Edge} edge The edge associated with this halfedge.
   * @property {module:Core.Face} face The face associated with this halfedge.
   * @property {module:Core.Corner} corner The corner opposite to this halfedge. Undefined if this halfedge is on the boundary.
   * @property {module:Core.Halfedge} next The next halfedge (in CCW order) in this halfedge's face.
   * @property {module:Core.Halfedge} prev The previous halfedge (in CCW order) in this halfedge's face.
   * @property {module:Core.Halfedge} twin The other halfedge associated with this halfedge's edge.
   * @property {boolean} onBoundary A flag that indicates whether this halfedge is on a boundary.
   */
  constructor() {
    super();
  }

  update(v: CRVertex, onBoundary: boolean) {
    this.onBoundary = onBoundary;
    this.vertex = v;
    v.halfedge = this;
  }

  vector(): Vector3 {
    return this.next.vertex.subtract(this.vertex);
  }

  /**
   * Computes the signed angle (in radians) between two adjacent faces.
   * @method module:Core.Geometry#dihedralAngle
   * @param {module:Core.Halfedge} h The halfedge (shared by the two adjacent faces) on which
   * the dihedral angle is computed.
   * @returns {number} The dihedral angle.
   */
  dihedralAngle(): number {
    if (this.onBoundary || this.twin.onBoundary) {
      return 0.0;
    }

    const n1 = this.face.calcNormal();
    const n2 = this.twin.face.calcNormal();
    const w = this.vector().normalizeToNew();

    const cosTheta = Vector3.Dot(n1, n2);
    const cross = Vector3.Cross(n1, n2);
    const sinTheta = Vector3.Dot(cross, w);

    return Math.atan2(sinTheta, cosTheta);
  }

  /**
   * Computes the cotangent of the angle opposite to a halfedge.
   * @method module:Core.Geometry#cotan
   * @param {module:Core.Halfedge} h The halfedge opposite to the angle whose cotangent needs to be computed.
   * @returns {number}
   */
  cotan() {
    if (this.onBoundary) {
      return 0.0;
    }

    const u = this.prev.vector();
    const v = this.next.vector().negate();

    return Vector3.Dot(u, v) / Vector3.Cross(u, v).length();
  }
}
