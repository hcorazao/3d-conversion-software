import { AppFacadeApi } from '@app/facade/app-facade-api';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { Mesh, PickingInfo, Vector3, VertexBuffer } from '@babylonjs/core';
import MeshHelper from '../../core/algorithm/MeshHelper';
import VertexFloodFillAlgorithm from '../../core/algorithm/VertexFloodFillAlgorithm';
import VertexRadiusAndAttributeCondition from '../../core/algorithm/VertexRadiusAndAttributeCondition';
import UndoRedo from '../../components/UndoRedo';
import ViewAPI from '../../ViewApi';

export default abstract class BaseTool {
  constructor() {
    this.maxRadius = 1; // default
    this.maxIntensity = 0.05; // default
    this.distances = null;
    this.trianglesVisited = null;
    this.distanceMap = new Map<number, number>();
    this.toolTiming = performance.now();
    this.hasChanges = false;
    this.undoRedo = new UndoRedo();
  }

  protected mesh: Mesh;
  protected maxRadius: number;
  protected maxIntensity: number;
  protected distances: Array<number>;
  protected distanceMap: Map<number, number>;
  private verticesSelected: Array<boolean>;
  private trianglesVisited: Array<boolean>;

  protected helper: MeshHelper;
  protected vertexAttributes: Uint8Array;

  protected toolTiming: number;
  protected TOOL_TIMING_DELTA = (4 / 60) * 1000; // standard value [ms], but overridable if necessary

  protected hasChanges: boolean;
  protected undoRedo: UndoRedo;

  protected abstract applyTool(pick: PickingInfo): void;

  ApplyTool(pick: PickingInfo): void {
    // check the performance
    const t0 = performance.now();

    this.applyTool(pick);

    const t1 = performance.now();
    console.log('Call to ApplyTool() took ' + (t1 - t0) + ' milliseconds.');
  }

  registerToolRadiusListener(appFacadeApi: AppFacadeApi) {
    appFacadeApi.registerToolRadiusChangeListener((toolRadius: number) => {
      this.setRadius(toolRadius);
    });
  }

  setMesh(mesh: Mesh, vertexAttributes: Uint8Array): void {
    if (mesh) {
      this.mesh = mesh;
      this.helper = new MeshHelper(mesh);
      this.distances = new Array<number>(this.helper.getNumVertices());
      this.verticesSelected = new Array<boolean>(this.helper.getNumVertices());
      this.trianglesVisited = new Array<boolean>(this.helper.getNumTriangles());
      this.vertexAttributes = vertexAttributes;

      this.mesh.markVerticesDataAsUpdatable(VertexBuffer.PositionKind, true);
      this.mesh.markVerticesDataAsUpdatable(VertexBuffer.NormalKind, true);
      this.mesh.createNormals(true);
    }
  }

  setUndoRedoCallbacks() {
    ViewAPI.getInstance().API.configureUndoRedoButtons(
      () => {
        this.undo();
      },
      () => {
        this.redo();
      }
    );
  }

  initializeUndoRedo() {
    this.undoRedo.clear();
    const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind);
    const u = positions.slice();
    this.undoRedo.add(u);
  }

  addUndoItem() {
    if (this.hasChanges) {
      const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind);
      const u = positions.slice();
      this.undoRedo.add(u);
      this.hasChanges = false;
      console.log('Undo item added: ');
    }
  }

  undo() {
    const positions = this.undoRedo.undo().slice();
    if (positions) {
      this.mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
      this.mesh.createNormals(true);
    }
  }

  redo() {
    const positions = this.undoRedo.redo().slice();
    if (positions) {
      this.mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
      this.mesh.createNormals(true);
    }
  }

  setRadius(r: number) {
    this.maxRadius = r;
    console.log('Form tool radius set to:' + this.maxRadius);
  }

  getRadius(): number {
    return this.maxRadius;
  }

  setIntensity(i: number) {
    this.maxIntensity = i;
    console.log('Form tool intensity set to:' + this.maxIntensity);
  }

  protected getVertexListAsIndexList(vertexId: number, center: Vector3): number[] {
    this.distanceMap.clear();

    const floodFill = new VertexFloodFillAlgorithm(
      vertexId,
      this.mesh,
      this.helper,
      new VertexRadiusAndAttributeCondition(center, this.maxRadius, this.distanceMap, this.vertexAttributes, CRHalfEdgeMesh.VA_SPACER)
    );

    return floodFill.compute();
  }

  protected calculateTriangleIndexList(indices: any, vertexList: number[], completeInside: boolean): number[] {
    // check the performance
    const t0 = performance.now();

    const triangleList = [];
    this.trianglesVisited.fill(false);

    for (const v of vertexList) {
      for (const faceId of this.helper.getAdjacentTriangles(v)) {
        if (!this.trianglesVisited[faceId]) {
          if (completeInside) {
            if (
              this.verticesSelected[indices[faceId * 3]] &&
              this.verticesSelected[indices[faceId * 3 + 1]] &&
              this.verticesSelected[indices[faceId * 3 + 2]]
            ) {
              triangleList.push(faceId);
              this.trianglesVisited[faceId] = true;
            }
          } else {
            triangleList.push(faceId);
            this.trianglesVisited[faceId] = true;
          }
        }
      }
    }

    const t1 = performance.now();
    console.log(
      'Call to calculateTriangleIndexList() took ' + (t1 - t0) + ' milliseconds with ' + triangleList.length + ' triangles found.'
    );

    return triangleList;
  }
}
