import { FloatArray, Mesh, Vector3, VertexBuffer } from '@babylonjs/core';

import createKDTree from 'static-kdtree';
import { deserialize } from 'static-kdtree';
import CRFace from './../../../geometry-processing-js/core/CRFace';
import CRVertex from './../../../geometry-processing-js/core/CRVertex';

/**
 * Encapsulates the static-kdtree implementation.
 *
 * @Link https://github.com/mikolalysenko/static-kdtree
 */
export default class KdTree {
  constructor() {}

  /**
   * Handle of the kd-Tree
   */
  private kdTree: any;

  /**
   * Creates a kd-Tree from face centers from a given friendly geometry.
   * @param faces The array of faces
   * @returns kd-Tree with stored triangle centers
   */
  async createKdTreeFromFaceArray(faces: Array<CRFace>) {
    // check the performance
    const t0 = performance.now();
    /*
    const worker = new Worker('./kdtree-worker', { type: 'module' });

    const length = 3 * faces.length;

    // Creating a shared buffer
    const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
    const iResultBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * faces.length);
    const pResultBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);

    // Creating a data structure on top of that shared memory area
    const sharedArray = new Float32Array(sharedBuffer);
    const iResultArray = new Int32Array(sharedBuffer);
    const pResultArray = new Float32Array(sharedBuffer);

    let index = 0;
    for (const f of faces) {
      const v = f.calcCenter();
      sharedArray[index++] = v._x;
      sharedArray[index++] = v._y;
      sharedArray[index++] = v._z;
    }

    worker.postMessage({ sharedBuffer, iResultArray, pResultArray });

    setTimeout(() => {
      const data = { i: iResultArray, p: pResultArray };
      this.kdTree = deserialize(data);
      worker.terminate();
    }, 2000);

    */
    const points = [];
    for (const f of faces) {
      points.push(f.calcCenter().asArray());
    }

    // const tree = new KdTree(createKDTree(points));
    this.kdTree = createKDTree(points);

    const t1 = performance.now();
    console.log('Call to KdTree:CreateKdTreeFromFaceArray() took ' + (t1 - t0) + ' milliseconds.');

    // return tree;
  }

  /**
   * Creates a kd-Tree from vertices from a given friendly geometry.
   * @param vertices The array of vertices
   * @returns kd-Tree with stored vertices
   */
  async createKdTreeFromVertexArray(vertices: Array<CRVertex>) {
    // check the performance
    const t0 = performance.now();
    /*
    const worker = new Worker('./kdtree-worker', { type: 'module' });

    const length = 3 * vertices.length;

    // Creating a shared buffer
    const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);
    const iResultBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * vertices.length);
    const pResultBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * length);

    // Creating a data structure on top of that shared memory area
    const sharedArray = new Float32Array(sharedBuffer);
    const iResultArray = new Int32Array(sharedBuffer);
    const pResultArray = new Float32Array(sharedBuffer);

    let index = 0;
    for (const v of vertices) {
      sharedArray[index++] = v._x;
      sharedArray[index++] = v._y;
      sharedArray[index++] = v._z;
    }

    worker.postMessage({ sharedBuffer, iResultArray, pResultArray });

    setTimeout(() => {
      const data = { i: iResultArray, p: pResultArray };
      this.kdTree = deserialize(data);
      worker.terminate();
    }, 2000);

    // return new KdTree(createKDTree(points));
    // return null;
    */
    const points = [];
    for (const v of vertices) {
      points.push(v.asArray());
    }

    // const tree = new KdTree(createKDTree(points));
    this.kdTree = createKDTree(points);

    const t1 = performance.now();
    console.log('Call to KdTree:CreateKdTreeFromVertexArray() took ' + (t1 - t0) + ' milliseconds.');

    // return tree;
  }

  /**
   * Gets the index of the closest item (typically vertex or tringle center) from a given point.
   * @param point The point from which the closest item is sought
   * @returns The closest item index
   */
  getClosestIndex(point: Vector3): number {
    return this.kdTree.nn(point.asArray());
  }

  /**
   * Calls visit function for all items found within a given radius around a given point.
   * @param point The point from which the closest items for a given radius are sought
   * @param radius The radius of interest
   * @param visit The function which is called for every item found
   * @returns ???
   */
  getClosestIndicesInRadius(point: Vector3, radius: number, visit) {
    return this.kdTree.rnn(point.asArray(), radius, visit);
  }

  /**
   * Disposes kd-Tree
   */
  dispose() {
    this.kdTree?.dispose();
  }
}
