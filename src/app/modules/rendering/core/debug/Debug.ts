import { BoundingBox, MeshBuilder, Mesh, Color3, Color4, StandardMaterial, Vector3 } from '@babylonjs/core';
import SceneManager from './../SceneManager';
import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import CREdge from '@app/modules/geometry-processing-js/core/CREdge';
import CRHalfEdge from '@app/modules/geometry-processing-js/core/CRHalfEdge';
import Polyline from '@app/modules/rendering/core/algorithm/Polyline';

/**
 * This is a core helper class that allows the programmer to add debugging object on a simple way.
 *
 * This class uses the singleton pattern.
 */

export default class Debug {
  private static instance: Debug;

  private debugPoint: Mesh;
  private debugPointIndex: number;
  private debugLineIndex: number;
  private readonly DEBUG_POINT_SIZE = 1;

  constructor() {
    // this.debugPoint = MeshBuilder.CreateBox('sphere', { size: this.DEBUG_POINT_SIZE }, SceneManager.getInstance().currentDebug);
    this.debugPoint = MeshBuilder.CreateSphere('sphere', { diameter: this.DEBUG_POINT_SIZE }, SceneManager.getInstance().current);

    this.debugPoint.material = new StandardMaterial('impactMat', SceneManager.getInstance().current);
    this.debugPoint.position.y = 1000;
    this.debugPoint.registerInstancedBuffer('color', 3);
    this.debugPoint.instancedBuffers.color = new Color3(Math.random(), Math.random(), Math.random());

    this.debugPointIndex = 0;
    this.debugLineIndex = 0;
  }

  static getInstance(): Debug {
    if (!Debug.instance) {
      Debug.instance = new Debug();
    }

    return Debug.instance;
  }

  /**
   * Adds a new intace point to the scene and then returns it
   *
   * @example let point = Debug.getInstance().new_debug_point(size, color);
   * newDebugPoint.position.copyFrom(this.center);
   *
   * @param size the size to be applied to the point
   * @param color the color the point will have
   * @returns the intanced debug point object
   */

  new_debug_point(size = 1, color: Color3 = new Color3(1, 0.1, 0.1)) {
    const pointInstance = this.debugPoint.createInstance('point_' + this.debugPointIndex++);
    if (size !== this.DEBUG_POINT_SIZE) {
      pointInstance.scaling = new Vector3(size, size, size);
    }

    pointInstance.instancedBuffers.color = color;
    return pointInstance;
  }

  debug_point(point: Vector3, size = 0.05, color?: Color3) {
    const newDebugPoint = this.new_debug_point(size, color);
    newDebugPoint.position.copyFrom(point);
  }

  debug_edge(edge: CREdge, size = 0.05) {
    this.debug_halfEdge(edge.halfedge, new Color3(1, 0, 0));
    this.debug_halfEdge(edge.halfedge.twin, new Color3(0, 1, 0));

    this.add_pin(edge.halfedge.face.calcCenter(), edge.halfedge.face.calcNormal());
    this.add_pin(edge.halfedge.twin.face.calcCenter(), edge.halfedge.twin.face.calcNormal());
  }

  /**
   * Adds a line between the vertex of the halfEdge and their next halfhalfEdge's vertex
   * it also adds a cube at 0.25 distance between them
   *
   * @example Debug.getInstance().new_debug_line(this.center, this.center.add(this.normal));
   *
   * @param halfEdge the halfhalfEdge to be tested
   */

  debug_halfEdge(halfEdge: CRHalfEdge, color?: Color3, size = 0.0125) {
    this.new_debug_line(halfEdge.vertex, halfEdge.next.vertex, color);

    const newDebugPoint = this.new_debug_point(size, color);
    Vector3.LerpToRef(halfEdge.vertex, halfEdge.next.vertex, 0.25, newDebugPoint.position);
  }

  /**
   * Adds a new line to the scene and then returns it
   *
   * @example Debug.getInstance().new_debug_line(this.center, this.center.add(this.normal));
   *
   * @param v1 the initial point of the line
   * @param v2 the end point of the line
   * @returns the line
   */

  new_debug_line(v1: Vector3, v2: Vector3, color = new Color3(1, 1, 1)) {
    const line = MeshBuilder.CreateLines(
      'line_' + this.debugLineIndex++,
      { points: [v1, v2], colors: [Color4.FromColor3(color), Color4.FromColor3(color)] },
      SceneManager.getInstance().current
    );
    return line;
  }

  /**
   * Add three lines representing the edges of a face and a line from the center of the face pushed to the normal directiono
   *
   * @example Debug.getInstance().debug_face(face));
   *
   */

  debug_face(face: CRFace, size = 0.019, color = new Color3(1, 0, 0)) {
    Debug.getInstance().new_debug_line(face.halfedge.vertex, face.halfedge.next.vertex);
    Debug.getInstance().new_debug_line(face.halfedge.next.vertex, face.halfedge.next.next.vertex);
    Debug.getInstance().new_debug_line(face.halfedge.next.next.vertex, face.halfedge.vertex);

    const newDebugPoint = Debug.getInstance().new_debug_point(size, color);
    newDebugPoint.position.copyFrom(face.calcCenter());
    newDebugPoint.position.addInPlace(face.calcNormal().scale(0.25));

    Debug.getInstance().new_debug_line(face.calcCenter(), face.calcCenter().add(face.calcNormal().scale(0.25)));
  }

  /**
   * Add three lines representing the edges of a face and a line from the center of the face pushed to the normal directiono
   *
   * @example Debug.getInstance().debug_face(face));
   *
   */

  debug_face_and_halfedge(face: CRFace, i = 0, size = 0.019, color = new Color3(1, 0, 0)) {
    Debug.getInstance().debug_halfEdge(face.halfedge);
    Debug.getInstance().debug_halfEdge(face.halfedge.next);
    Debug.getInstance().debug_halfEdge(face.halfedge.next.next);

    const newDebugPoint = Debug.getInstance().new_debug_point(size, color);
    const center = face.calcCenter();
    const normal = face.calcNormal();
    newDebugPoint.position.copyFrom(center);
    newDebugPoint.position.addInPlace(normal.scale(0.25));

    Debug.getInstance().new_debug_line(center, center.add(normal.scale(0.25)));
  }

  /**
   * Add a line and a sphere given an at vertex and a normal
   *
   * @example Debug.getInstance().debug_face(face));
   *
   */

  add_pin(at: Vector3, normal: Vector3, size = 0.019, color = new Color3(1, 0, 0)) {
    Debug.getInstance().new_debug_line(at, at.add(normal));

    const newDebugPoint = Debug.getInstance().new_debug_point(size, color);
    newDebugPoint.position.copyFrom(at);
    newDebugPoint.position.addInPlace(normal);
  }

  debug_polyline(polyline: Polyline, closed = true, step = 1, size = 0.05, color?: Color3) {
    for (let i = 0; i < polyline.path.length; i += step) {
      this.debug_point(polyline.path[i], size);
      if (i === 0) {
        continue;
      }

      this.new_debug_line(polyline.path[i - step], polyline.path[i], color);
      if (!closed) {
        continue;
      }

      const nextIndex = i + step;
      if (i + step >= polyline.path.length) {
        this.new_debug_line(polyline.path[i], polyline.path[0], color);
        this.debug_point(polyline.path[0], 3 * size, new Color3(0.1, 1, 0.1));
        this.debug_point(polyline.path[i], 3 * size, new Color3(0.1, 0.1, 1));
      }
    }
  }

  debug_bb(bb: BoundingBox, step = 1, color?: Color3) {
    bb.vectorsWorld.forEach((v) => {
      this.debug_point(v, 1.0);
    });

    this.debug_point(bb.centerWorld, 2.0);
  }
}
