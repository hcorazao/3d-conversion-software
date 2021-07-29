import { int, Vector3, Quaternion } from '@babylonjs/core';
import IAlgorithm from './IAlgorithm';
import CRHalfEdgeMesh from './../../../geometry-processing-js/core/CRHalfEdgeMesh';
import Debug from '../debug/Debug';
import CRHalfEdge from '@app/modules/geometry-processing-js/core/CRHalfEdge';
import { flip, MediumHoleFillingAlgorithm } from '@app/modules/geometry-processing-js/core/medium-hole-filling';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import ConsistencyChecker from '@app/modules/geometry-processing-js/core/consistency-checker';
import CREdge from '@app/modules/geometry-processing-js/core/CREdge';
import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import MixedLaplacianSmoothMeshAlgorithm from './MixedLaplacianSmoothMeshAlgorithm';
import RegionalLaplacianSmoothMeshAlgorithm from './RegionalLaplacianSmoothMeshAlgorithm';

const DEBUG = false;
const LAMBDA_TOP = 0.75;
const LAMBDA_BOTTOM = 0.75;
const ANGLE_OF_ROTATION = -60;

function average(vector0: Vector3, vector1: Vector3, vector2: Vector3) {
  return vector0
    .add(vector1)
    .add(vector2)
    .scale(1 / 3.0);
}

function smoothBoundaryTangents(tangents: Vector3[]): Vector3[] {
  const newTangents = [];

  newTangents.push(average(tangents[tangents.length - 1], tangents[0], tangents[1]));
  for (let i = 1, end = tangents.length - 1; i < end; ++i) {
    newTangents.push(average(tangents[i - 1], tangents[i], tangents[i + 1]));
  }
  newTangents.push(average(tangents[tangents.length - 2], tangents[tangents.length - 1], tangents[0]));
  return newTangents;
}

export default class SewTwoMeshesAlgorithm implements IAlgorithm {
  constructor(mesh: CRHalfEdgeMesh) {
    this.mesh = mesh;
  }

  private mesh: CRHalfEdgeMesh;

  private topBoundaryHE: CRHalfEdge[];
  private bottomBoundaryHE: CRHalfEdge[];

  private newFaces: CRFace[];
  private newEdges: CREdge[];
  private newVertices: CRVertex[];
  private boundaryVertices: CRVertex[];
  private maxEdgeLength: number;
  private minEdgeLength: number;

  compute(): any {
    const checker = new ConsistencyChecker(this.mesh);
    checker.checkAllConsistencies();

    // check the performance
    const t0 = performance.now();

    // remove fins
    this.mesh.removeFins();
    // this.smoothBoundary(0);

    this.alignBoundaries();
    this.createBoundaryLists();

    const boundaryTangents = [];

    for (const edge of this.topBoundaryHE) {
      const direction = edge.twin.vector().add(edge.next.twin.vector());
      const normal = edge.twin.vertex.normalEquallyWeighted();
      const tangent = Vector3.Cross(normal, direction).normalize().scale(LAMBDA_TOP);

      boundaryTangents.push(tangent);
      if (DEBUG) {
        // Debug.getInstance().add_pin(edge.twin.vertex, normal, 0.019, Color3.Black());
        Debug.getInstance().add_pin(edge.twin.vertex, tangent);
      }
    }
    for (const edge of this.bottomBoundaryHE) {
      const direction = edge.twin.vector().add(edge.next.twin.vector());
      const normal = edge.twin.vertex.normalEquallyWeighted();
      const q = Quaternion.RotationAxis(direction, (ANGLE_OF_ROTATION * Math.PI) / 180.0);

      normal.rotateByQuaternionToRef(q, normal);

      const tangent = Vector3.Cross(normal, direction).normalize().scale(LAMBDA_BOTTOM);

      boundaryTangents.push(tangent);
      if (DEBUG) {
        // Debug.getInstance().add_pin(edge.twin.vertex, normal, 0.019, Color3.Black());
        Debug.getInstance().add_pin(edge.twin.vertex, tangent);
      }
    }
    // this.boundaryTangents = smoothBoundaryTangents(this.boundaryTangents);
    // this.boundaryTangents = smoothBoundaryTangents(this.boundaryTangents);

    /* TODO: think about closing triangles first
    const fill = new LargeHoleFillingAlgorithm(this.mesh);
    fill.setBoundaryFace(this.mesh.boundaries[0]);
    fill.compute();
    */

    const topBoundaryLen = this.topBoundaryHE.length;
    const bottomBoundaryLen = this.bottomBoundaryHE.length;
    const len = Math.min(topBoundaryLen, bottomBoundaryLen);

    console.log(topBoundaryLen + ' / ' + bottomBoundaryLen);

    this.newFaces = [];
    this.newEdges = [];
    this.newVertices = [];

    let firstHalfEdge;
    let lastHalfEdge;
    let idx;
    for (idx = 0; idx < len; idx++) {
      const het = this.topBoundaryHE[idx];
      const heb = this.bottomBoundaryHE[idx];
      const v0 = het.vertex;
      const v1 = het.next.vertex;
      const v2 = heb.vertex;
      const v3 = heb.next.vertex;

      // create 4 half edges
      const he1 = this.mesh.createHalfEdge(v1, false);
      const he2 = this.mesh.createHalfEdge(v2, false);
      const he4 = this.mesh.createHalfEdge(v3, false);
      const he5 = this.mesh.createHalfEdge(v0, false);

      // create 2 triangles
      const f0 = this.mesh.createFace(het, he1, he2);
      this.newFaces.push(f0);
      const f1 = this.mesh.createFace(heb, he4, he5);
      this.newFaces.push(f1);

      // create edges
      const e0 = this.mesh.createEdge(he2, he5);
      this.newEdges.push(e0);
      if (lastHalfEdge) {
        const e1 = this.mesh.createEdge(he4, lastHalfEdge);
        this.newEdges.push(e1);
      }
      lastHalfEdge = he1;

      // update boundary halfedges
      het.onBoundary = false;
      this.mesh.createCorner(het);
      heb.onBoundary = false;
      this.mesh.createCorner(heb);

      if (!firstHalfEdge) {
        firstHalfEdge = he4;
      }
    }

    if (topBoundaryLen === bottomBoundaryLen) {
      // create last edge
      const e = this.mesh.createEdge(firstHalfEdge, lastHalfEdge);
      this.newEdges.push(e);
    } else if (topBoundaryLen > len) {
      for (let i = idx; i < topBoundaryLen; i++) {
        const het = this.topBoundaryHE[i];
        const heb = this.bottomBoundaryHE[bottomBoundaryLen - 1];
        const v0 = het.vertex;
        const v1 = het.next.vertex;
        const v2 = heb.vertex;

        // create 2 half edges
        const he1 = this.mesh.createHalfEdge(v1, false);
        const he2 = this.mesh.createHalfEdge(v2, false);

        // create 1 triangle
        const f0 = this.mesh.createFace(het, he1, he2);
        this.newFaces.push(f0);

        // create 1 edge
        const e0 = this.mesh.createEdge(he2, lastHalfEdge);
        this.newEdges.push(e0);
        lastHalfEdge = he1;

        // update boundary halfedges
        het.onBoundary = false;
        this.mesh.createCorner(het);

        // Debug.getInstance().debug_point(this.topBoundaryHE[i].vertex, 0.02);
      }

      // create last edge
      const e = this.mesh.createEdge(firstHalfEdge, lastHalfEdge);
      this.newEdges.push(e);
    } else {
      for (let i = idx; i < bottomBoundaryLen; i++) {
        const het = this.topBoundaryHE[0];
        const heb = this.bottomBoundaryHE[i];
        const v0 = het.vertex;
        const v2 = heb.vertex;
        const v3 = heb.next.vertex;

        // create 2 half edges
        const he4 = this.mesh.createHalfEdge(v3, false);
        const he5 = this.mesh.createHalfEdge(v0, false);

        // create 1 triangle
        const f1 = this.mesh.createFace(heb, he4, he5);
        this.newFaces.push(f1);

        // create 1 edge
        const e0 = this.mesh.createEdge(he4, lastHalfEdge);
        this.newEdges.push(e0);
        lastHalfEdge = he5;

        // update boundary halfedges
        heb.onBoundary = false;
        this.mesh.createCorner(heb);

        // Debug.getInstance().debug_point(this.bottomBoundaryHE[i].vertex, 0.02);
        // Debug.getInstance().debug_face(f1);
      }

      // create last edge
      const e = this.mesh.createEdge(firstHalfEdge, lastHalfEdge);
      this.newEdges.push(e);
    }

    // delete boundaries
    this.mesh.boundaries[0].dispose();
    this.mesh.boundaries[1].dispose();
    this.mesh.boundaries = [];

    const medium = new MediumHoleFillingAlgorithm(this.mesh);
    medium.subdivideAllFaces(this.newFaces, this.newVertices, this.newEdges);

    // step 3: flip edges and smooth for an initial mesh
    let flipped;
    for (let flips = 0; flips < 100; flips++) {
      flipped = medium.flipEdges(this.newEdges);
      medium.smoothTwoRing(1, this.newVertices);
      medium.smooth(1, this.newVertices);
      if (!flipped) {
        break;
      }
    }

    // step 4: first laplace on coarse mesh for initial form
    this.smooth(boundaryTangents);

    // step 5: further refine mesh
    // const avg = (3 * this.maxEdgeLength + this.minEdgeLength) / 4;
    const avg = this.maxEdgeLength;
    for (let flips = 0; flips < 100; flips++) {
      const nbNewFaces = medium.subdivideLargeFaces(this.newFaces, this.newVertices, this.newEdges, avg);

      flipped = medium.flipEdges(this.newEdges);
      medium.smooth(1, this.newVertices);
      flipped = medium.flipEdges(this.newEdges);
      medium.smooth(1, this.newVertices);

      if (!flipped) {
        break;
      }
    }

    // step 5: final bi-laplace
    this.smooth(boundaryTangents);

    this.mesh.indexElements();
    this.mesh.updateMesh();

    // add vertex attributes
    const data = new Uint8Array(this.newVertices.length);
    data.fill(CRHalfEdgeMesh.VA_RESTORATION);
    const newArray = new Uint8Array(this.mesh.vertexAttributes.length + data.length);
    newArray.set(this.mesh.vertexAttributes); // copy old data
    newArray.set(data, this.mesh.vertexAttributes.length); // copy new data after end of old data
    this.mesh.vertexAttributes = newArray;

    const t1 = performance.now();
    console.log('Call to SewTwoMeshesAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    checker.checkAllConsistencies();

    return undefined;
  }

  protected smoothBoundary(i: int) {
    const boundary = this.mesh.boundaries[i];
    let flipped = true;

    while (flipped) {
      this.mesh.removeFins();
      let edge = boundary.halfedge;

      flipped = false;
      do {
        if (edge.next.twin.next === edge.twin.prev.twin) {
          const oldNormal = edge.twin.face.calcNormal();
          const temp = edge.twin.prev.edge;

          flip(temp);

          const newNormal0 = temp.halfedge.face.calcNormal();
          const newNormal1 = temp.halfedge.twin.face.calcNormal();

          if (Vector3.Dot(oldNormal, newNormal0) < 0 || Vector3.Dot(oldNormal, newNormal1) < 0) {
            console.log('DEBUG: Flip was illegal.  Undoing.');
            flip(temp);
          } else {
            flipped = true;
          }
        }
        edge = edge.next;
      } while (edge !== boundary.halfedge);
    }

    {
      let edge = boundary.halfedge;

      do {
        if (Vector3.Dot(edge.vector().normalize(), edge.prev.vector().negate().normalize()) > 0) {
          console.log('DEBUG: Add smoothing edge.');
          const edge0 = this.mesh.createHalfEdge(edge.vertex, true);
          const edge1 = this.mesh.createHalfEdge(edge.next.next.vertex, false);

          edge0.prev = edge.prev;
          edge0.next = edge.next.next;
          edge.prev.next = edge0;
          edge.next.next.prev = edge0;
          edge.onBoundary = false;
          edge.next.onBoundary = false;
          this.mesh.createEdge(edge0, edge1);
          this.mesh.createFace(edge1, edge, edge.next);
          if (boundary.halfedge === edge) {
            boundary.halfedge = edge0;
          } else if (boundary.halfedge === edge.next) {
            boundary.halfedge = edge0;
            break;
          }
          Debug.getInstance().debug_point(edge.vertex, 0.3);
          edge = edge0;
        }
        edge = edge.next;
      } while (edge !== boundary.halfedge);
    }
  }

  protected smooth(tangents?: Vector3[]) {
    if (tangents) {
      new MixedLaplacianSmoothMeshAlgorithm(this.newVertices, this.boundaryVertices, tangents).compute();
    } else {
      const oneRing = this.mesh.oneRing(this.newVertices, this.boundaryVertices);

      new RegionalLaplacianSmoothMeshAlgorithm(this.newVertices, this.boundaryVertices, oneRing).compute();
    }
  }

  protected createBoundaryLists() {
    this.topBoundaryHE = [];
    this.bottomBoundaryHE = [];
    this.boundaryVertices = [];
    this.maxEdgeLength = 0;
    this.minEdgeLength = Number.MAX_SAFE_INTEGER;

    let start = this.mesh.boundaries[1].halfedge;
    let next = start;
    do {
      this.topBoundaryHE.push(next);

      next.vertex.fixedNormal = next.vertex.normalAreaWeighted();
      this.boundaryVertices.push(next.vertex);

      this.maxEdgeLength = Math.max(this.maxEdgeLength, next.vector().length());
      this.minEdgeLength = Math.min(this.minEdgeLength, next.vector().length());

      next = next.next;
    } while (next !== start);

    start = this.mesh.boundaries[0].halfedge;
    next = start;
    do {
      this.bottomBoundaryHE.push(next);

      next.vertex.fixedNormal = next.vertex.normalAreaWeighted();
      this.boundaryVertices.push(next.vertex);

      next = next.prev;
    } while (next !== start);
  }

  protected alignBoundaries() {
    const v = this.mesh.boundaries[0].halfedge.vertex;
    const start = this.mesh.boundaries[1].halfedge;
    let next = start;
    let minDist = Number.MAX_SAFE_INTEGER;
    do {
      const w = next.vertex;
      const d = Vector3.DistanceSquared(v, w);
      if (d < minDist) {
        minDist = d;
        this.mesh.boundaries[1].halfedge = next.prev;
      }
      next = next.next;
    } while (next !== start);
  }
}
