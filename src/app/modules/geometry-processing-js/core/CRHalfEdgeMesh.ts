import KdTree from '@app/modules/rendering/core/algorithm/KdTree';
import Debug from '@app/modules/rendering/core/debug/Debug';
import ViewAPI from '@app/modules/rendering/ViewApi';
import { Color3, Color4, FloatArray, Mesh, Ray, Vector3, VertexBuffer } from '@babylonjs/core';
import { OBJExport } from '@babylonjs/serializers';

import CRCorner from './CRCorner';
import CREdge from './CREdge';
import CRFace from './CRFace';
import CRHalfEdge from './CRHalfEdge';
import CRVertex from './CRVertex';
import HalfEdgeMesh from './halfedgemesh';
import PriorityQueue from './PriorityQueue';

/* tslint:disable no-bitwise */
export default class CRHalfEdgeMesh extends HalfEdgeMesh {
  public static readonly VA_SPACER = 1 << 0;
  public static readonly VA_MARGIN_THICKNESS = 1 << 1;
  public static readonly VA_COPY = 1 << 2;
  public static readonly VA_RESTORATION = 1 << 3;

  private verticesKdTree: KdTree;
  private trianglesKdTree: KdTree;
  public vertexAttributes: Uint8Array;

  /**
   * This class represents a Mesh.
   * @constructor module:Core.Mesh
   * @property {module:Core.Vertex[]} vertices The vertices contained in this mesh.
   * @property {module:Core.Edge[]} edges The edges contained in this mesh.
   * @property {module:Core.Face[]} faces The faces contained in this mesh.
   * @property {module:Core.Corner[]} corners The corners contained in this mesh.
   * @property {module:Core.Halfedge[]} halfedges The halfedges contained in this mesh.
   * @property {module:Core.Face[]} boundaries The boundary loops contained in this mesh.
   * @property {Array.<module:Core.Halfedge[]>} generators An array of halfedge arrays, i.e.,
   * [[h11, h21, ..., hn1], [h12, h22, ..., hm2], ...] representing this mesh's
   * {@link https://en.wikipedia.org/wiki/Homology_(mathematics)#Surfaces homology generators}.
   */
  constructor(mesh: Mesh, ccw: boolean, createVerticesKdTree = false, createTrianglesKdTree = false) {
    super(mesh);

    this.build(ccw);

    if (createVerticesKdTree) {
      this.createVerticesKdTree();
    }
    if (createTrianglesKdTree) {
      this.createTrianglesKdTree();
    }
  }

  /**
   * Disposes the half edge data structure. Must be called before setting to null in order to delete and free up memory.
   */
  dispose() {
    super.dispose();

    this.verticesKdTree?.dispose();
    this.verticesKdTree = null;
    this.trianglesKdTree?.dispose();
    this.trianglesKdTree = null;
  }

  /**
   * Creates vertex with given information
   * @param pos The position of the vertex
   * @param col The vertex color
   * @returns The newly created vertex
   */
  createVertex(pos: Vector3, col: Color4): CRVertex {
    const v = new CRVertex(pos.x, pos.y, pos.z);
    this.vertices.push(v);
    v.index = this.vertices.length - 1;
    v.color = new Color4(col.r, col.g, col.b, col.a);
    return v;
  }

  /**
   * Creates a new face with given information including the adjacencies
   * @param he0 First half edge
   * @param he1 Second half edge
   * @param he2 Third have edge
   * @returns The newly created face
   */
  createFace(he0: CRHalfEdge, he1: CRHalfEdge, he2: CRHalfEdge): CRFace {
    const f = new CRFace();
    this.faces.push(f);
    f.index = this.faces.length - 1;
    f.halfedge = he0;

    he0.face = f;
    he1.face = f;
    he2.face = f;

    he0.next = he1;
    he1.next = he2;
    he2.next = he0;

    he2.prev = he1;
    he1.prev = he0;
    he0.prev = he2;

    return f;
  }

  createVertexAttributes() {
    this.vertexAttributes = new Uint8Array(this.vertices.length);
    this.vertexAttributes.fill(0);
  }

  hasVertexAttribute(vertexIdx: number, attribute: number): boolean {
    return (this.vertexAttributes[vertexIdx] & attribute) === attribute;
  }

  setVertexAttribute(vertexIdx: number, attribute: number) {
    this.vertexAttributes[vertexIdx] = this.vertexAttributes[vertexIdx] | attribute;
  }

  /**
   * Creates a new corner
   * @returns The newly created corner
   */
  createCorner(he: CRHalfEdge): CRCorner {
    const c = new CRCorner();
    this.corners.push(c);
    c.index = this.corners.length - 1;

    he.corner = c;
    c.halfedge = he;

    return c;
  }

  /**
   * Creates a new edge with given information including the adjacencies
   * @param he0 First half edge
   * @param he1 Second half edge
   * @returns The newly created edge
   */
  createEdge(he0: CRHalfEdge, he1: CRHalfEdge): CREdge {
    const e = new CREdge();
    this.edges.push(e);
    e.index = this.edges.length - 1;
    e.halfedge = he0;

    he0.edge = e;
    he1.edge = e;

    he0.twin = he1;
    he1.twin = he0;

    return e;
  }

  /**
   * Creates a new half edge with given information including the adjacencies
   * @param v The start vertex of a half edge
   * @param onBoundary True if the half edge is a boundary half edge
   * @returns The newly created half edge
   */
  createHalfEdge(v: CRVertex, onBoundary: boolean): CRHalfEdge {
    const he = new CRHalfEdge();
    this.halfedges.push(he);
    he.index = this.halfedges.length - 1;
    he.onBoundary = onBoundary;

    he.vertex = v;
    v.halfedge = he;

    if (!onBoundary) {
      const c = this.createCorner(he);
      // c.halfedge = he;
      // he.corner = c;
    }

    return he;
  }

  /**
   * Updates the underlying BabylonJS mesh
   */
  updateMesh() {
    // we move the array of vertices to a buffer structure and apply that to the geometry
    const positions: FloatArray = [];
    positions.length = this.vertices.length * 3;

    let i;
    for (i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i]) {
        positions[i * 3] = this.vertices[i].x;
        positions[i * 3 + 1] = this.vertices[i].y;
        positions[i * 3 + 2] = this.vertices[i].z;
      }
    }
    const indices: FloatArray = [];
    indices.length = this.faces.length * 3;

    for (i = 0; i < this.faces.length; i++) {
      indices[i * 3] = this.faces[i] ? this.faces[i].halfedge.vertex.index : 0;
      indices[i * 3 + 1] = this.faces[i] ? this.faces[i].halfedge.next.vertex.index : 0;
      indices[i * 3 + 2] = this.faces[i] ? this.faces[i].halfedge.next.next.vertex.index : 0;
    }

    let withColors = true;
    let colors: FloatArray;
    this.vertices[0].color ? (withColors = true) : (withColors = false);
    if (withColors) {
      colors = [];
      colors.length = this.vertices.length * 4;

      for (i = 0; i < this.vertices.length; i++) {
        if (this.vertices[i]) {
          colors[i * 4] = this.vertices[i].color.r;
          colors[i * 4 + 1] = this.vertices[i].color.g;
          colors[i * 4 + 2] = this.vertices[i].color.b;
          colors[i * 4 + 3] = this.vertices[i].color.a;
        }
      }
    }

    const normals: FloatArray = [];
    normals.length = this.vertices.length * 3;

    this.mesh.setVerticesData(VertexBuffer.PositionKind, positions);
    this.mesh.setVerticesData(VertexBuffer.NormalKind, normals);
    if (withColors) {
      this.mesh.setVerticesData(VertexBuffer.ColorKind, colors);
    }
    this.mesh.setIndices(indices);

    this.mesh.createNormals(true);
  }

  /**
   * Finds a short path from start to end. Mathematically it is possible, that a shorter path
   * exists.
   * @param start Start vertex of the path
   * @param end End vertex of the path
   * @returns List of vertices
   */
  shortestPath(start: CRVertex, end: CRVertex): CRVertex[] {
    return this.djikstraAlgorithm(start, end);

    const path: CRVertex[] = [];
    path.push(start);

    let minW;
    do {
      const v = path[path.length - 1];
      let minDist2 = Number.MAX_SAFE_INTEGER;
      for (const w of v.adjacentVertices()) {
        // find the closest vertex to end
        const dist2 = Vector3.DistanceSquared(w, end);
        if (dist2 < minDist2) {
          minDist2 = dist2;
          minW = w;
        }
      }
      path.push(minW);
    } while (minW !== end);

    return path;
  }

  djikstraAlgorithm(start: CRVertex, end: CRVertex): CRVertex[] {
    // check the performance
    const t0 = performance.now();

    const dmax = Vector3.Distance(start, end) * 1.4;
    const distances = {};

    // Stores the reference to previous nodes
    const prev = {};
    const pq = new PriorityQueue((a, b) => a[1] < b[1]);

    // Set distances to all nodes to be infinite except startNode
    distances[start.index] = 0;
    pq.push([start, 0]);
    for (const v of this.vertices) {
      if (v) {
        if (v !== start) {
          distances[v.index] = Infinity;
        }
        prev[v.index] = null;
      }
    }

    while (!pq.isEmpty()) {
      const currNode: CRVertex = pq.pop()[0]; // minNode.data;

      for (const neighbor of currNode.adjacentVertices()) {
        const alt = distances[currNode.index] + Vector3.Distance(currNode, neighbor);
        if (alt < distances[neighbor.index] && alt < dmax) {
          distances[neighbor.index] = alt;
          prev[neighbor.index] = currNode;
          pq.push([neighbor, distances[neighbor.index]]);
        }
      }
    }

    // rewind the path from end to start
    const vertices: CRVertex[] = [];
    vertices.unshift(end);
    let next = end;
    do {
      next = prev[next.index];
      vertices.unshift(next);
    } while (next !== start);

    const t1 = performance.now();
    console.log('Call to CRHalfEdgeMesh:djikstraAlgorithm() took ' + (t1 - t0) + ' milliseconds.');

    return vertices;
  }

  /**
   * Creates a kd-Tree out of the vertices only if not already exists.
   */
  createVerticesKdTree() {
    if (!this.verticesKdTree) {
      this.verticesKdTree = new KdTree();
      this.verticesKdTree.createKdTreeFromVertexArray(this.vertices);
    }
  }

  /**
   * Updates the kd-Tree only if already exists.
   */
  updateVerticesKdTree() {
    if (this.verticesKdTree) {
      // delete and free memory
      this.verticesKdTree.dispose();
      this.verticesKdTree = null;

      this.verticesKdTree = new KdTree();
      this.verticesKdTree.createKdTreeFromVertexArray(this.vertices);
    }
  }

  /**
   * Creates a kd-Tree out of the faces only if not already exists.
   */
  createTrianglesKdTree() {
    if (!this.trianglesKdTree) {
      this.trianglesKdTree = new KdTree();
      this.trianglesKdTree.createKdTreeFromFaceArray(this.faces);
    }
  }

  /**
   * Updates the kd-Tree only if already exists.
   */
  updateTrianglesKdTree() {
    if (this.trianglesKdTree) {
      // delete and free memory
      this.trianglesKdTree.dispose();
      this.trianglesKdTree = null;

      this.trianglesKdTree = new KdTree();
      this.trianglesKdTree.createKdTreeFromFaceArray(this.faces);
    }
  }

  /**
   * Gets closest vertex index to a given coordinate c
   * @param c Coordinate to which the closest vertex is sought
   * @returns closest vertex index
   */
  getClosestVertexIndex(c: Vector3): number {
    if (!this.verticesKdTree) {
      console.error('kd-Tree of vertices not initializes!');
      return;
    }
    return this.verticesKdTree.getClosestIndex(c);
  }

  /**
   * Gets closest face index to a given coordinate c
   * @param c Coordinate to which the closest face is sought
   * @returns Closest face index
   */
  getClosestFaceIndex(c: Vector3): number {
    if (!this.trianglesKdTree) {
      console.error('kd-Tree of faces not initializes!');
      return;
    }
    return this.trianglesKdTree.getClosestIndex(c);
  }

  /**
   * Gets closest face index to a given coordinate c around a given radius
   * @param c Coordinate to which the closest face is sought
   * @param radius The radius around the coordinate c
   * @param visit Callback function which will be called for every face index found
   * @returns Closest face indices
   */
  getClosestTrianglesInRadius(c: Vector3, radius: number, visit) {
    if (!this.trianglesKdTree) {
      console.error('kd-Tree of faces not initializes!');
      return;
    }
    return this.trianglesKdTree.getClosestIndicesInRadius(c, radius, visit);
  }

  /**
   * Finds the closest point on the mesh. The point is projected on the plane defined by a triangle.
   * @param point Query point
   * @returns The closest point exactly on the mesh
   */
  closestPointOnMesh(point: Vector3): { point: Vector3; success: boolean; faceId: number } {
    const closestVertex = Vector3.Zero();
    const adjVerticesArray: number[] = [];

    let idx = this.getClosestVertexIndex(point);
    const fallbackVertexIdx = idx;
    for (const face of this.vertices[idx].adjacentFaces()) {
      adjVerticesArray.push(face.halfedge.vertex.index); // for 1.fallback
      adjVerticesArray.push(face.halfedge.next.vertex.index); // for 1.fallback
      adjVerticesArray.push(face.halfedge.next.next.vertex.index); // for 1.fallback

      const inside = face.pointInTriangle(point, closestVertex);

      if (inside) {
        return { point: closestVertex, success: true, faceId: face.index };
      }
    }

    // 1. Fallback: in rare cases the adjacent triangles of the closest vertex are
    // not sufficient. The second line of triangles must be taken.
    for (idx of adjVerticesArray) {
      for (const face of this.vertices[idx].adjacentFaces()) {
        const inside = face.pointInTriangle(point, closestVertex);

        if (inside) {
          return { point: closestVertex, success: true, faceId: face.index };
        }
      }
    }

    // FALLBACK: should never happen
    console.error('FALLBACK at ' + fallbackVertexIdx + ' ! --> ' + this.vertices[fallbackVertexIdx]);

    const fallbackFaceIdx = this.getClosestFaceIndex(point);

    return { point: this.vertices[fallbackVertexIdx], success: false, faceId: fallbackFaceIdx };
  }

  closestPointsOnMesh(points: Vector3[], triangleIdx: number[]) {
    for (const v of points) {
      const closestPoint = this.closestPointOnMesh(v);
      if (!closestPoint.success) {
        console.error('An error in closestPointsOnMesh() has occured!');
      }

      triangleIdx.push(closestPoint.faceId);
    }
  }

  /**
   * It is possible, that you get more than one point. This function sorts the points in order of the distance
   * to the camera.
   * @param points Points to sort
   * @param eye Camera position
   */
  sortPoints(points: { vertex: Vector3; index: number }[], eye: Vector3) {
    if (points.length > 1) {
      console.log('more than one point');

      const sortedArray: { vertex: Vector3; index: number }[] = points.sort((p1, p2) => {
        const d1 = Vector3.DistanceSquared(eye, p1.vertex);
        const d2 = Vector3.DistanceSquared(eye, p2.vertex);
        if (d1 > d2) {
          return 1;
        }

        if (d1 < d2) {
          return -1;
        }

        return 0;
      });
    }
  }

  /**
   * Closests points on mesh projected
   * @param points
   * @param eye
   * @param [inclBackfaces]
   * @param [r1]
   * @param [r2]
   */
  closestPointsOnMeshProjected(
    points: Vector3[],
    triangleIdx: number[],
    eye: Vector3,
    inclBackfaces = false,
    onlyInDirection = false,
    r1 = 3.0,
    r2 = 10.0
  ) {
    for (let idx = 0; idx < points.length; idx++) {
      const v = points[idx];
      const dir = v.subtract(eye);
      dir.normalize();

      const closestPoint = this.closestPointOnMeshProjected(v, dir, inclBackfaces, onlyInDirection, r1, r2);
      if (!closestPoint.success) {
        console.error('An error in closestPointsOnMeshProjected() has occured!');
      } else {
        triangleIdx.push(closestPoint.index);
      }

      // postprocess
      if (idx > 0 && idx < points.length - 1) {
        for (let jdx = idx + 1; jdx < points.length - 1; jdx++) {
          const smooth = points[jdx].add(points[jdx - 1]).add(points[jdx + 1]);
          smooth.scaleInPlace(0.333333);
          points[jdx].copyFrom(smooth);
        }
      }
    }
  }

  /**
   * Closests point on mesh projected
   * @param point The point
   * @param dir The direction
   * @param [inclBackfaces] true, if the algorithm should also consider triangles facing back
   * @param [onlyInDirection] true, if the algorithm should only consider the ray in one direction
   * @param [r1] first radius to check
   * @param [r2] second fallback radius to check
   * @returns true if point on mesh projected
   */
  closestPointOnMeshProjected(
    point: Vector3,
    dir: Vector3,
    inclBackfaces = false,
    onlyInDirection = false,
    r1 = 2.0,
    r2 = 10.0
  ): { success: boolean; index: number } {
    const R = new Ray(point, dir, 200);

    const closestVertex: { vertex: Vector3; index: number }[] = [];

    const visit = (index) => {
      const tri = this.faces[index];

      const intersectionInfo = R.intersectsTriangle(tri.halfedge.vertex, tri.halfedge.next.vertex, tri.halfedge.next.next.vertex);
      if (intersectionInfo) {
        const backface = inclBackfaces || Vector3.Dot(R.direction, tri.calcNormal()) > 0;
        const direction = !onlyInDirection || intersectionInfo.distance > 0;

        if (backface && direction) {
          closestVertex.push({
            vertex: R.origin.add(R.direction.scale(intersectionInfo.distance)),
            index,
          });
        }
      }
    };

    this.getClosestTrianglesInRadius(point, r1, visit);

    if (closestVertex.length === 0 && r2 > 0) {
      console.log('closestPointOnMeshProjected: Second try needed!');
      this.getClosestTrianglesInRadius(point, r2, visit);
    }

    this.sortPoints(closestVertex, point);

    if (closestVertex.length > 0) {
      point.copyFrom(closestVertex[0].vertex);
      return { success: true, index: closestVertex[0].index };
    }

    return { success: false, index: undefined };
  }

  /**
   * Determines whether a mesh has fin faces
   * @returns true if mesh has fin faces
   */
  hasFinFaces(): boolean {
    let nbFins = 0;
    for (const f of this.faces) {
      if (f && f.isFin()) {
        nbFins++;
      }
    }
    if (nbFins > 0) {
      console.error('Mesh has fin faces!');
    }

    return nbFins > 0;
  }

  drawHoles() {
    for (const h of this.holes) {
      if (this.boundaries[h]) {
        const first = this.boundaries[h].halfedge;
        Debug.getInstance().debug_face(first.twin.face, 0.019 * 3, new Color3(0, 1, 0));
        let next = first.next;
        while (next !== first) {
          Debug.getInstance().debug_face(next.twin.face, 0.019);
          next = next.next;
        }
      }
    }
  }

  drawIslands() {
    for (const i of this.islands) {
      const first = this.boundaries[i].halfedge;
      Debug.getInstance().debug_face(first.twin.face, 0.019 * 3, new Color3(0, 0, 1));
      let next = first.next;
      while (next !== first) {
        Debug.getInstance().debug_face(next.twin.face, 0.019);
        next = next.next;
      }
    }
  }

  /**
   * Removes a fin
   * @param tdhe1 One half edge of a fin
   */
  protected removeFin(tdhe1: CRHalfEdge) {
    const tbhe1 = tdhe1.next.next.twin;
    const bthe2 = tdhe1.twin;
    const bthe3 = bthe2.next;
    const bthe1 = bthe2.prev;
    const bthe0 = bthe1.prev;
    const bt = bthe2.face;
    const v1 = tdhe1.vertex;
    const v2 = tdhe1.prev.vertex;
    // Debug.getInstance().debug_point(v1);
    // Debug.getInstance().debug_point(v2);

    // delete one vertex
    tdhe1.next.vertex.dispose(this);

    // delete two edges
    tdhe1.edge.dispose(this);
    tdhe1.next.edge.dispose(this);
    const e = tdhe1.prev.edge;

    // delete 3 corners
    tdhe1.corner.dispose(this);
    tdhe1.next.corner.dispose(this);
    tdhe1.next.next.corner.dispose(this);

    // delete 1 face
    tdhe1.face.dispose(this);

    // delete 5 half edges
    bthe1.dispose(this);
    bthe2.dispose(this);
    tdhe1.next.next.dispose(this);
    tdhe1.next.dispose(this);
    tdhe1.dispose(this);

    // new structure
    // const bthei = this.createHalfEdge(tbhe1.next.vertex, true);
    const bthei = new CRHalfEdge();
    this.halfedges.push(bthei);
    bthei.index = this.halfedges.length - 1;
    bthei.onBoundary = true;
    bthei.face = bt;
    bt.halfedge = bthei;
    bthei.vertex = tbhe1.next.vertex;
    // e.update(bthei, tbhe1);
    bthei.twin = tbhe1;
    tbhe1.twin = bthei;
    bthei.edge = e;

    bthe0.next = bthei;
    bthei.prev = bthe0;

    bthe3.prev = bthei;
    bthei.next = bthe3;

    // tbhe1.vertex.halfedge = tbhe1;
    // tbhe1.next.vertex.halfedge = tbhe1.next;

    if (tbhe1.edge.halfedge.index === -1) {
      tbhe1.edge.halfedge = tbhe1;
    }

    if (tbhe1.vertex.halfedge.index === -1) {
      tbhe1.vertex.halfedge = tbhe1;
    }
    if (tbhe1.next.vertex.halfedge.index === -1) {
      tbhe1.next.vertex.halfedge = tbhe1.next;
    }
  }

  /**
   * Removes ALL fins from this mesh
   */
  removeFins() {
    // check the performance
    const t0 = performance.now();

    let removed = true;
    while (removed) {
      removed = false;
      for (const f of this.faces) {
        if (f && f.isFin()) {
          if (f.halfedge.twin.onBoundary && f.halfedge.next.twin.onBoundary) {
            if (f.halfedge.next.vertex.degree() === 2) {
              this.removeFin(f.halfedge);
              removed = true;
            } else {
              Debug.getInstance().debug_point(f.halfedge.next.vertex);
            }
          } else if (f.halfedge.next.twin.onBoundary && f.halfedge.next.next.twin.onBoundary) {
            if (f.halfedge.next.next.vertex.degree() === 2) {
              this.removeFin(f.halfedge.next);
              removed = true;
            } else {
              Debug.getInstance().debug_point(f.halfedge.next.next.vertex);
            }
          } else {
            if (f.halfedge.vertex.degree() === 2) {
              this.removeFin(f.halfedge.next.next);
              removed = true;
            } else {
              Debug.getInstance().debug_point(f.halfedge.vertex);
            }
          }
        }
      }
    }

    const t1 = performance.now();
    console.log('Call to HalfEdgeMesh:removeFins() took ' + (t1 - t0) + ' milliseconds.');
  }

  oneRing(vertexList: CRVertex[], boundaryVertexList?: CRVertex[]): CRVertex[] {
    const vertexMap = new Map<CRVertex, boolean>();
    const oneRing: CRVertex[] = [];

    for (const v of vertexList) {
      vertexMap.set(v, true);
    }

    let list = vertexList;
    if (boundaryVertexList) {
      for (const v of boundaryVertexList) {
        vertexMap.set(v, true);
        // Debug.getInstance().debug_point(v, 0.02, new Color3(1, 0, 1));
      }
      list = boundaryVertexList;
    }

    for (const v of list) {
      for (const w of v.adjacentVertices()) {
        if (!vertexMap.has(w)) {
          oneRing.push(w);
          vertexMap.set(w, true);
          // Debug.getInstance().debug_point(w, 0.02, new Color3(1, 1, 0));
        }
      }
    }
    return oneRing;
  }

  public exportObj(fileName: string) {
    const angularCallback = (serialized) => {
      const exampleFile = new File([serialized], fileName + '.obj', {
        type: 'text/plain',
      });
      ViewAPI.getInstance().API.exportToCaseFolderLocation(exampleFile);
    };

    const obj = OBJExport.OBJ([this.mesh]);
    angularCallback(obj);
  }
}
