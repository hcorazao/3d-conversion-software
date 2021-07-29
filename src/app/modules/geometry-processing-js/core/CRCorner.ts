import { Vector3 } from '@babylonjs/core';
import Corner from './corner';

export default class CRCorner extends Corner {
  /**
   * This class represents a corner in a {@link module:Core.Mesh Mesh}. It is a convenience
   * wrapper around {@link module:Core.Halfedge Halfedge} - each corner stores the halfedge opposite to it.
   * @constructor module:Core.Corner
   * @property {module:Core.Halfedge} halfedge The halfedge opposite to this corner.
   */
  constructor() {
    super();
  }

  /**
   * Computes the angle (in radians) at a corner.
   * @method module:Core.Geometry#angle
   * @param {module:Core.Corner} c The corner at which the angle needs to be computed.
   * @returns {number} The angle clamped between 0 and π.
   */
  angle(): number {
    const u = this.halfedge.prev.vector().normalizeToNew();
    const v = this.halfedge.next.vector().negate().normalizeToNew();

    // return Math.acos(Math.max(-1.0, Math.min(1.0, Vector3.Dot(u, v))));
    return Math.acos(Vector3.Dot(u, v));
  }
}
