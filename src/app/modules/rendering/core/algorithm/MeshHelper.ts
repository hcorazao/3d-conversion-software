import { FloatArray, Mesh, Vector3, VertexBuffer } from '@babylonjs/core';

export default class MeshHelper {
  constructor(mesh: Mesh) {
    this.mesh = mesh;
    this.numVertices = this.mesh.getVerticesData(VertexBuffer.PositionKind).length / 3;
    this.numTriangles = this.mesh.getIndices().length / 3;

    this.positions = mesh.getVerticesData(VertexBuffer.PositionKind);

    console.log('Number of vertices...: ' + this.numVertices);
    console.log('Number of triangles..: ' + this.numTriangles);

    this.generateAdjacencies();
  }

  private mesh: Mesh; // Mesh associated to this helper
  private positions: FloatArray;
  private vertexToVerticesAdjacencyList: Array<Array<number>>; // Adjacency list for all vertices around a vertex
  private vertexToTrianglesAdjacencyList: Array<Array<number>>; // Adjacency list for all triangles around a vertex
  private triangleToVerticesList: Array<Array<number>>;
  private numVertices: number; // Number of vertices of the associated mesh
  private numTriangles: number; // Number of triangles of the associated mesh

  // Returns the number of triangles of the mesh
  getNumTriangles(): number {
    return this.numTriangles;
  }

  // Returns the number of vertices of the mesh
  getNumVertices(): number {
    return this.numVertices;
  }

  getVertexAt(vertexId: number): Vector3 {
    return new Vector3(this.positions[vertexId * 3], this.positions[vertexId * 3 + 1], this.positions[vertexId * 3 + 2]);
  }

  // Returns the list of vertex adjecencies for a given vertex ID
  getAdjacentVertices(vertexId: number): number[] {
    return this.vertexToVerticesAdjacencyList[vertexId];
  }

  getAdjacentTriangles(vertexId: number): number[] {
    return this.vertexToTrianglesAdjacencyList[vertexId];
  }

  getTriangleVertices(triangleId: number): number[] {
    return this.triangleToVerticesList[triangleId];
  }

  // Calculates the lists of vertex adjecencies for all vertices
  // NOTE: Function call normally needed only once!
  private generateAdjacencies(): void {
    // check the performance
    const t0 = performance.now();

    // initialize array of lists
    this.triangleToVerticesList = new Array(this.numTriangles);
    this.vertexToVerticesAdjacencyList = new Array(this.numVertices);
    this.vertexToTrianglesAdjacencyList = new Array(this.numVertices);
    for (let vertexId = 0; vertexId < this.vertexToVerticesAdjacencyList.length; vertexId++) {
      this.vertexToVerticesAdjacencyList[vertexId] = [];
      this.vertexToTrianglesAdjacencyList[vertexId] = [];
    }

    const indices = this.mesh.getIndices();
    // For each triangle, ...
    for (let idx = 0; idx < this.numTriangles; idx++) {
      // ... get the vertex indices ...
      const A = indices[idx * 3];
      const B = indices[idx * 3 + 1];
      const C = indices[idx * 3 + 2];

      // ... and add them to the respective vertexToVertexAdjacencyList list.
      // A is adjacent to B & C
      if (this.vertexToVerticesAdjacencyList[A].indexOf(B) === -1) {
        this.vertexToVerticesAdjacencyList[A].push(B);
      }
      if (this.vertexToVerticesAdjacencyList[A].indexOf(C) === -1) {
        this.vertexToVerticesAdjacencyList[A].push(C);
      }

      // B is adjacent to A & C
      if (this.vertexToVerticesAdjacencyList[B].indexOf(A) === -1) {
        this.vertexToVerticesAdjacencyList[B].push(A);
      }
      if (this.vertexToVerticesAdjacencyList[B].indexOf(C) === -1) {
        this.vertexToVerticesAdjacencyList[B].push(C);
      }

      // C is adjacent to A & B
      if (this.vertexToVerticesAdjacencyList[C].indexOf(A) === -1) {
        this.vertexToVerticesAdjacencyList[C].push(A);
      }
      if (this.vertexToVerticesAdjacencyList[C].indexOf(B) === -1) {
        this.vertexToVerticesAdjacencyList[C].push(B);
      }

      // Triangle idx is adjacent to each vertex A, B & C
      if (this.vertexToTrianglesAdjacencyList[A].indexOf(idx) === -1) {
        this.vertexToTrianglesAdjacencyList[A].push(idx);
      }
      if (this.vertexToTrianglesAdjacencyList[B].indexOf(idx) === -1) {
        this.vertexToTrianglesAdjacencyList[B].push(idx);
      }
      if (this.vertexToTrianglesAdjacencyList[C].indexOf(idx) === -1) {
        this.vertexToTrianglesAdjacencyList[C].push(idx);
      }

      this.triangleToVerticesList[idx] = [A, B, C];
    }

    const t1 = performance.now();
    console.log('Call to generateAdjacencies() took ' + (t1 - t0) + ' milliseconds.');
  }
}
