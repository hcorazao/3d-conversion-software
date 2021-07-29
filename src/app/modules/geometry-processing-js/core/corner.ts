import CRFace from './CRFace';
import CRHalfEdge from './CRHalfEdge';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import CRVertex from './CRVertex';

export default class Corner {
  public halfedge: CRHalfEdge;
  public index: number;

  /**
   * This class represents a corner in a {@link module:Core.Mesh Mesh}. It is a convenience
   * wrapper around {@link module:Core.Halfedge Halfedge} - each corner stores the halfedge opposite to it.
   * @constructor module:Core.Corner
   * @property {module:Core.Halfedge} halfedge The halfedge opposite to this corner.
   */
  constructor() {
    this.dispose();
  }

  dispose(mesh?: CRHalfEdgeMesh) {
    if (mesh) {
      mesh.corners[this.index] = undefined;
    }

    this.halfedge = undefined;
    this.index = -1; // an ID between 0 and |C| - 1, where |C| is the number of corners in a mesh
  }

  /**
   * The vertex this corner lies on.
   * @member module:Core.Corner#vertex
   * @type {module:Core.Vertex}
   */
  get vertex(): CRVertex {
    return this.halfedge.prev.vertex;
  }

  /**
   * The face this corner is contained in.
   * @member module:Core.Corner#face
   * @type {module:Core.Face}
   */
  get face(): CRFace {
    return this.halfedge.face;
  }

  /**
   * The next corner (in CCW order) in this corner's face.
   * @member module:Core.Corner#next
   * @type {module:Core.Corner}
   */
  get next(): Corner {
    return this.halfedge.next.corner;
  }

  /**
   * The previous corner (in CCW order) in this corner's face.
   * @member module:Core.Corner#prev
   * @type {module:Core.Corner}
   */
  get prev(): Corner {
    return this.halfedge.prev.corner;
  }

  /**
   * Defines a string representation for this corner as its index.
   * @ignore
   * @method module:Core.Corner#toString
   * @returns {string}
   */
  toString() {
    return this.index;
  }
}
