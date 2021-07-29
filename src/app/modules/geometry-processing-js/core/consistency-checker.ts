import Debug from '@app/modules/rendering/core/debug/Debug';
import { Color3 } from '@babylonjs/core';
import HalfEdgeMesh from './halfedgemesh';

export default class ConsistencyChecker {
  protected mesh: HalfEdgeMesh;
  protected nbVertices: number;
  protected nbFaces: number;
  protected nbEdges: number;
  protected nbHalfEdges: number;
  protected nbBorderHalfEdges: number;
  protected nbCorners: number;

  constructor(mesh: HalfEdgeMesh) {
    this.mesh = mesh;
  }

  checkAllConsistencies() {
    // check the performance
    const t0 = performance.now();

    this.nbVertices = 0;
    this.nbFaces = 0;
    this.nbEdges = 0;
    this.nbHalfEdges = 0;
    this.nbBorderHalfEdges = 0;
    this.nbCorners = 0;

    this.checkVertexConsistency();
    this.checkFaceConsistency();
    this.checkEdgeConsistency();
    this.checkCornerConsistency();
    this.checkHalfEdgeConsistency();
    this.checkNumberOfElements();
    this.checkBoundaryConsistency();

    if (this.mesh.hasIsolatedFaces()) {
      console.error('Isolated Faces!');
    }

    if (this.mesh.hasIsolatedVertices()) {
      console.error('Isolated Vertices!');
    }

    if (this.mesh.hasNonManifoldVertices()) {
      console.error('Non Manifold Vertices!');
    }

    const t1 = performance.now();
    console.log('Call to ConsistencyChecker:checkAllConsistencies() took ' + (t1 - t0) + ' milliseconds.');
  }

  checkVertexConsistency() {
    console.log('Checking vertices...');
    for (let i = 0; i < this.mesh.vertices.length; i++) {
      const v = this.mesh.vertices[i];
      if (v) {
        this.nbVertices++;
        // check indices
        if (v.index !== i) {
          console.error('Vertex: Index error!');
        }

        if (v.halfedge) {
          const w = v.halfedge.vertex;
          if (v !== w) {
            console.error('Vertex: Pairing error!');
            Debug.getInstance().debug_point(v, 0.01, new Color3(1, 0, 0));
            Debug.getInstance().debug_point(w, 0.01, new Color3(0, 1, 0));
          }
        } else {
          console.error('Vertex: HalfEdge is undefined!');
        }
      }
    }

    // deleted indices still referenced
    for (const he of this.mesh.halfedges) {
      if (he && he.vertex && he.vertex.index === -1) {
        console.error('Vertex: Reference error!');
      }
    }
  }

  checkFaceConsistency() {
    console.log('Checking faces...');
    for (let i = 0; i < this.mesh.faces.length; i++) {
      const f = this.mesh.faces[i];
      if (f) {
        this.nbFaces++;
        // check indices
        if (f.index !== i) {
          console.error('Face: Index error!');
        }

        if (f.halfedge) {
          const w = f.halfedge.face;
          if (f !== w) {
            console.error('Face: Pairing error!');
          }
          const adjFace = f.halfedge.twin.face;
          if (!adjFace.isBoundaryLoop()) {
            const f1 = adjFace.halfedge.twin.face;
            const f2 = adjFace.halfedge.next.twin.face;
            const f3 = adjFace.halfedge.prev.twin.face;
            if (f1 !== f && f2 !== f && f3 !== f) {
              console.error('Face: Face adjacency not correct!');
            }
          }
          if (!f.isBoundaryLoop() && f.halfedge.next.next !== f.halfedge.prev) {
            console.error('Face: Inner half edges inconsistent!');
            Debug.getInstance().debug_point(f.halfedge.vertex, 0.01);
          }
        } else {
          console.error('Face: HalfEdge is undefined!');
        }
      }
    }

    // deleted indices still referenced
    for (const he of this.mesh.halfedges) {
      if (he && he.face && he.face.index === -1) {
        console.error('Face: Reference error!');
      }
    }
  }

  checkEdgeConsistency() {
    console.log('Checking edges...');
    for (let i = 0; i < this.mesh.edges.length; i++) {
      const e = this.mesh.edges[i];
      if (e) {
        this.nbEdges++;
        // check indices
        if (e.index !== i) {
          console.error('Edge: Index error!');
        }

        if (e.halfedge) {
          const w = e.halfedge.edge;
          if (e !== w) {
            console.error('Edge: Pairing error!');
          }
          if (e.halfedge.twin.index === -1) {
            console.error('Edge: Twin is undefined!');
          } else if (!e.onBoundary() && e.halfedge.twin.edge !== e) {
            // TODO: check whether this is wrong!
            console.error('Edge: Twin half edge not on same edge!');
          }
        } else {
          console.error('Edge: HalfEdge is undefined!');
        }
      }
    }

    // deleted indices still referenced
    for (const he of this.mesh.halfedges) {
      if (he && he.edge && he.edge.index === -1) {
        console.error('Edge: Reference error!');
      }
    }
  }

  checkCornerConsistency() {
    console.log('Checking corners...');
    for (let i = 0; i < this.mesh.corners.length; i++) {
      const c = this.mesh.corners[i];
      if (c) {
        this.nbCorners++;
        // check indices
        if (c.index !== i) {
          console.error('Corner: Index error!');
        }

        if (c.halfedge) {
          const w = c.halfedge.corner;
          if (c !== w) {
            console.error('Corner: Pairing error!');
          }
        } else {
          console.error('Corner: HalfEdge is undefined!');
        }
      }
    }

    // deleted indices still referenced
    for (const he of this.mesh.halfedges) {
      if (he && !he.onBoundary && he.corner && he.corner.index === -1) {
        console.error('Corner: Reference error!');
      }
    }
  }

  checkHalfEdgeConsistency() {
    console.log('Checking halfedges...');
    for (let i = 0; i < this.mesh.halfedges.length; i++) {
      const he = this.mesh.halfedges[i];
      if (he) {
        this.nbHalfEdges++;
        // check indices
        if (he.index !== i) {
          console.error('HalfEdge: Index error!');
        }

        if (!he.edge) {
          console.error('HalfEdge: No associated edge!');
        }
        // if (he.onBoundary && !he.edge){
        //  console.error('HalfEdge: Wrongly associated edge!');
        // }

        if (!he.onBoundary && !he.corner) {
          console.error('HalfEdge: No associated corner!');
        }
        if (he.onBoundary && he.corner) {
          console.error('HalfEdge: Wrongly associated corner!');
        }

        // check ???
        if (he.onBoundary === undefined) {
          console.error('HalfEdge: onBoundary is undefined!');
        }

        if (he.onBoundary) {
          this.nbBorderHalfEdges++;
          if (!he.next.onBoundary || !he.prev.onBoundary) {
            console.error('HalfEdge: Wrong onboundary!');
          }
        }
      }
    }

    // deleted indices still referenced
    for (const c of this.mesh.corners) {
      if (c && c.halfedge.index === -1) {
        console.error('HalfEdge: Reference error with corners!');
      }
    }
    for (const e of this.mesh.edges) {
      if (e && e.halfedge.index === -1) {
        console.error('HalfEdge: Reference error with edges!');
      }
    }
    for (const f of this.mesh.faces) {
      if (f && f.halfedge.index === -1) {
        console.error('HalfEdge: Reference error with faces!');
      }
    }
    for (const v of this.mesh.vertices) {
      if (v && v.halfedge.index === -1) {
        console.error('HalfEdge: Reference error with vertices!');
      }
    }
  }

  checkNumberOfElements() {
    if (this.nbHalfEdges !== this.nbEdges * 2) {
      console.error('Number of halfedges to edges are incorrect!');
    }
    if (this.nbHalfEdges - this.nbBorderHalfEdges !== this.nbCorners) {
      console.error('Number of halfedges to corners are incorrect!');
    }
    if (this.nbFaces !== this.nbCorners / 3) {
      console.error('Number of faces to corners are incorrect!');
    }
  }

  checkBoundaryConsistency() {
    console.log('Checking boundaries...');
    for (const b of this.mesh.boundaries) {
      if (b && !b.isBoundaryLoop()) {
        console.error('Face not a boundary loop!');
      }

      if (b && b.index === -1) {
        console.error('Face is not indexed/valid!');
      }

      if (b) {
        const first = b.halfedge;
        let next = b.halfedge;
        let num = 0;
        do {
          if (next.onBoundary !== true) {
            console.error('Halfedge onBoundary true is missing!');
          }
          if (next.face !== b) {
            console.error('Face from boundary halfedge not correct');
          }
          next = next.next;
        } while (next !== first || num++ > 5000 || next === undefined);

        if (num >= 5000) {
          console.error('Infinite loop in boundary (forward)!');
        }
        if (next === undefined) {
          console.error('Forward connection not correct!');
        }

        next = b.halfedge;
        num = 0;
        do {
          if (next.onBoundary !== true) {
            console.error('Halfedge onBoundary true is missing!');
          }
          next = next.prev;
        } while (next !== first || num++ > 5000 || next === undefined);

        if (num >= 5000) {
          console.error('Infinite loop in boundary (backward)!');
        }
        if (next === undefined) {
          console.error('Backward connection not correct!');
        }
      }
    }
  }
}
