import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { BoundingBox, int, Mesh, Vector3, VertexBuffer } from '@babylonjs/core';
import MeshHelper from '../../core/algorithm/MeshHelper';
import Polyline from '../../core/algorithm/Polyline';
import Debug from '../../core/debug/Debug';
import ViewAPI from '../../ViewApi';
import { MediumHoleFillingAlgorithm } from '@app/modules/geometry-processing-js/core/medium-hole-filling';
import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import CREdge from '@app/modules/geometry-processing-js/core/CREdge';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';

export default class DistanceCalculator {
  private occlusalCubes = [];
  private proximalCubes = [];
  private allCubes = [];
  private meshToShade: Mesh;
  private occlMapVisibility: boolean;
  private proxMapVisibility: boolean;

  private vertexAttributesCopy: Uint8Array;

  public vertexIndexMap: Map<number, number>;

  public constructor() {
    console.log(`DistanceCalculator started`);

    this.occlMapVisibility = true;
    this.proxMapVisibility = true;
    this.setMapVisibility(
      ViewAPI.getInstance().API.getToolsSettings().occlusalDistance,
      ViewAPI.getInstance().API.getToolsSettings().proximalDistance
    );
  }

  /**
   * Sets occlusal and proximal distance map/shader visibility. It will be called with with program start and
   * after state change.
   * We have to call createDistanceAttributesForMesh to recreate distance colors after each event.
   * That for, we need a copy here.
   * @param occlMapVisibility True, if occlusal distance map is visible
   * @param proxMapVisibility True, if proximal distance map is visible
   */
  setMapVisibility(occlMapVisibility: boolean, proxMapVisibility: boolean) {
    this.occlMapVisibility = occlMapVisibility;
    this.proxMapVisibility = proxMapVisibility;
    this.createDistanceAttributesForMesh(this.meshToShade, this.vertexAttributesCopy);
  }

  /**
   * Adds mesh to be used for distance shading.
   * Creates one cubeList for every mesh and slices the geometry into it.
   * @param mesh The mesh to be used
   * @param bIsAntagonist Tell, if Antagonist or Protagonist
   * @param areaOfInterest Bounding box
   */
  addSenderMesh(mesh: Mesh, bIsAntagonist: boolean, areaOfInterest: BoundingBox) {
    console.log(`DistanceCalculator add mesh `, mesh.getTotalVertices());
    if (bIsAntagonist) {
      this.createCubes(areaOfInterest, this.occlusalCubes);
      this.sliceOneMesh(mesh, areaOfInterest, this.occlusalCubes);
    } else {
      this.createCubes(areaOfInterest, this.proximalCubes);
      this.sliceOneMesh(mesh, areaOfInterest, this.proximalCubes);
    }
  }

  finishSetup(areaOfInterest: BoundingBox) {
    // as we search for the ONE closest cube, the result woud be random, if we don't mix content of cubes woith the same bounding box
    // we create allCubes[], a list with the cubes for occlusal AND proximal values to calculate against.
    this.allCubes = [];
    this.createCubes(areaOfInterest, this.allCubes);
    // add all content from proximalCubes
    // to avoid browser-specific issues with deep cloning, we do it by hand (yawn):
    for (let i = 0; i < this.proximalCubes.length; i++) {
      const cube = this.proximalCubes[i];
      for (let j = 0; j < cube.vertices.length / 3; j++) {
        this.allCubes[i].addVertex(cube.vertices[j * 3 + 0], cube.vertices[j * 3 + 1], cube.vertices[j * 3 + 2]);
        this.allCubes[i].addNormal(cube.normals[j * 3 + 0], cube.normals[j * 3 + 1], cube.normals[j * 3 + 2]);
      }
    }
    for (let i = 0; i < this.occlusalCubes.length; i++) {
      const cube = this.occlusalCubes[i];
      for (let j = 0; j < cube.vertices.length / 3; j++) {
        this.allCubes[i].addVertex(cube.vertices[j * 3 + 0], cube.vertices[j * 3 + 1], cube.vertices[j * 3 + 2]);
        this.allCubes[i].addNormal(cube.normals[j * 3 + 0], cube.normals[j * 3 + 1], cube.normals[j * 3 + 2]);
      }
    }
  }

  createCubes(areaOfInterest: BoundingBox, cubeList: any) {
    const minX = areaOfInterest.minimum._x;
    const minY = areaOfInterest.minimum._y;
    const minZ = areaOfInterest.minimum._z;
    const maxX = areaOfInterest.maximum._x;
    const maxY = areaOfInterest.maximum._y;
    const maxZ = areaOfInterest.maximum._z;

    // TODO: use cubes of the same edge length!
    const cubeCount = 7;
    const offset = 1.001; // bigger -> better results
    const cubeSizeX = (maxX - minX) / cubeCount;
    const cubeSizeY = (maxY - minY) / cubeCount;
    const cubeSizeZ = (maxZ - minZ) / cubeCount;

    // create empty cubes
    for (let z = 0; z < cubeCount; z++) {
      for (let y = 0; y < cubeCount; y++) {
        for (let x = 0; x < cubeCount; x++) {
          const miX = minX + x * cubeSizeX - offset;
          const maX = minX + x * cubeSizeX + cubeSizeX + offset;
          const miY = minY + y * cubeSizeY - offset;
          const maY = minY + y * cubeSizeY + cubeSizeY + offset;
          const miZ = minZ + z * cubeSizeZ - offset;
          const maZ = minZ + z * cubeSizeZ + cubeSizeY + offset;

          const cube = {
            boundsX: [miX, maX],
            boundsY: [miY, maY],
            boundsZ: [miZ, maZ],
            center: [(miX + maX) / 2.0, (miY + maY) / 2.0, (miZ + maZ) / 2.0],
            vertices: [],
            addVertex(vX: number, vY: number, vZ: number) {
              this.vertices.push(vX, vY, vZ);
            },
            normals: [],
            addNormal(vX: number, vY: number, vZ: number) {
              this.normals.push(vX, vY, vZ);
            },
          };
          cubeList.push(cube);
        }
      }
    }
  }

  _sliceOneMesh(meshIn: Mesh, areaOfInterest: BoundingBox, cubeList: any[]) {
    console.log(`DistanceCalculator slicing one mesh `, meshIn.getTotalVertices());
    /*
    let newFaces: CRFace[];
    let newEdges: CREdge[];
    let newVertices: CRVertex[];

    const mesh = new CRHalfEdgeMesh(meshIn, false);

    const medium = new MediumHoleFillingAlgorithm(mesh);
    medium.subdivideAllFaces(newFaces, newVertices, newEdges); // error: TypeError: faceList is not iterable
    let px: number;
    let py: number;
    let pz: number;
    let vCount = 0;
    const v = new Vector3(0, 0, 0);

   for (let p = 0; p < size; p++) {
      px = vertices[p * 3 + 0];
      py = vertices[p * 3 + 1];
      pz = vertices[p * 3 + 2];
      v.copyFromFloats(px, py, pz);

      if (areaOfInterest.intersectsPoint(v)) {
        if (!this.vertexIndexMap.has(p)) {
          for (const cube of cubeList) {
            if (
              //  we can add the same vertex to multiple cubes due to the offset
              cube.boundsX[0] < px &&
              cube.boundsX[1] > px &&
              cube.boundsY[0] < py &&
              cube.boundsY[1] > py &&
              cube.boundsZ[0] < pz &&
              cube.boundsZ[1] > pz
            ) {
              // add vertices to cubes
              cube.addVertex(px, py, pz);
              cube.addNormal(normals[p * 3 + 0], normals[p * 3 + 1], normals[p * 3 + 2]);
              vCount++;
            }
          }
        }
      }
    }
    console.log('DistanceCalculator added vertices total: ', vCount);*/
  }
  sliceOneMesh(mesh: Mesh, areaOfInterest: BoundingBox, cubeList: any[]) {
    console.log(`DistanceCalculator slicing one mesh `, mesh.getTotalVertices());

    const size = mesh.getTotalVertices();
    const vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
    const normals = mesh.getVerticesData(VertexBuffer.NormalKind);
    let px: number;
    let py: number;
    let pz: number;
    let vCount = 0;
    const v = new Vector3(0, 0, 0);

    for (let p = 0; p < size; p++) {
      px = vertices[p * 3 + 0];
      py = vertices[p * 3 + 1];
      pz = vertices[p * 3 + 2];
      v.copyFromFloats(px, py, pz);

      if (areaOfInterest.intersectsPoint(v)) {
        if (!this.vertexIndexMap.has(p)) {
          for (const cube of cubeList) {
            if (
              //  we can add the same vertex to multiple cubes due to the offset
              cube.boundsX[0] < px &&
              cube.boundsX[1] > px &&
              cube.boundsY[0] < py &&
              cube.boundsY[1] > py &&
              cube.boundsZ[0] < pz &&
              cube.boundsZ[1] > pz
            ) {
              // add vertices to cubes
              cube.addVertex(px, py, pz);
              cube.addNormal(normals[p * 3 + 0], normals[p * 3 + 1], normals[p * 3 + 2]);
              vCount++;
            }
          }
        }
      }
    }
    console.log('DistanceCalculator added vertices total: ', vCount);
  }

  createDistanceAttributesForMesh(mesh: Mesh, vertexAttributes: Uint8Array) {
    if (typeof vertexAttributes === 'undefined') {
      return;
    }
    if (vertexAttributes.length > 0) {
      this.vertexAttributesCopy = vertexAttributes;
    }

    if (typeof mesh === 'undefined') {
      return;
    }
    this.meshToShade = mesh;
    const indexList = [];
    const uvs = [];
    for (let i = 0; i < mesh.getTotalVertices(); i++) {
      indexList.push(i);
      uvs.push(100, 0);
    }
    mesh.setVerticesData(VertexBuffer.UVKind, uvs, true);
    this.updateDistanceAttributesForMesh(mesh, 1, indexList, vertexAttributes);
  }

  updateDistanceAttributesForMesh(mesh: Mesh, increment: int, indexList: number[], vertexAttributes: Uint8Array) {
    // assign the cubeList we need:
    let cubeList = [];
    if (this.occlMapVisibility && this.proxMapVisibility) {
      cubeList = this.allCubes;
    } else {
      if (this.occlMapVisibility) {
        cubeList = this.occlusalCubes;
      }
      if (this.proxMapVisibility) {
        cubeList = this.proximalCubes;
      }
    }
    if (cubeList.length === 0) {
      return;
    }

    console.log(`DistanceCalculator updates now `, mesh.getTotalVertices());
    const t0 = performance.now();
    const vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
    // TODO: create normals after tool usage:
    // const normals = mesh.getVerticesData(VertexBuffer.NormalKind); // needed later - acutually, the tools create wrong normals
    const uvs = mesh.getVerticesData(VertexBuffer.UVKind);
    const steps = 1;
    let px: number;
    let py: number;
    let pz: number;
    let dist: number;
    let x: number;
    let y: number;
    let z: number;
    let calculationsCnt = 0;
    let cubeChecksCnt = 0;
    let cubeIndex = -1;
    let closestDist = 100000000;
    let overlap = 1.0;
    let cube = cubeList[0];
    let minDist = 1.1;
    let p = 0;

    let attrib = 0;
    // through ALL vertices from indexList
    for (let q = 0; q < indexList.length; q += increment) {
      p = indexList[q];
      attrib = vertexAttributes[p];

      px = vertices[p * 3 + 0];
      py = vertices[p * 3 + 1];
      pz = vertices[p * 3 + 2];

      cubeIndex = -1;
      closestDist = 100000000;

      // here you can alter the attrib for the vertices to pass through to distance calculations
      // tslint:disable-next-line
      if ((attrib & CRHalfEdgeMesh.VA_RESTORATION) === CRHalfEdgeMesh.VA_RESTORATION) {
        // find cubeIndex now
        // for better heuristic, try last cubeIndex first
        // now, we have to decide whether to use cubes for occlusal or proximal or both
        // we should create one, new cube array before we do the loop where we put the right cubes in!
        for (let c = 0; c < cubeList.length; c++) {
          x = cubeList[c].center[0] - px;
          y = cubeList[c].center[1] - py;
          z = cubeList[c].center[2] - pz;
          dist = x * x + y * y + z * z;
          cubeChecksCnt++;
          if (dist < closestDist) {
            closestDist = dist;
            cubeIndex = c;
          }
        }
      }

      // now, only search through the ONE, closest cube at cubeIndex
      minDist = 1.1;
      overlap = 1.0;
      if (cubeIndex > -1) {
        cube = cubeList[cubeIndex];
        for (let i = 0; i < cube.vertices.length / 3; i = i + steps) {
          // x y z: receiver minus sender:
          x = px - cube.vertices[i * 3 + 0];
          y = py - cube.vertices[i * 3 + 1];
          z = pz - cube.vertices[i * 3 + 2];
          dist = Math.sqrt(x * x + y * y + z * z); // dist to point in cube - sqrt strangely doesn't matter
          if (dist < minDist) {
            minDist = dist;
            overlap = 1.0;
            // check dot product to detect overlap:
            if (minDist < 0.6 && x * cube.normals[i * 3 + 0] + y * cube.normals[i * 3 + 1] + z * cube.normals[i * 3 + 2] < 0.0) {
              overlap = -1.0;
            }
          }
          calculationsCnt++;
        }
        minDist *= overlap;
      }
      uvs[p * 2] = minDist;
      // if we ever need more speed, we can think about jumping to the cube index attached to every vertex. For now, it's not used.
      // problem occurs, when the vertex moves into another cube by using the form tools
      uvs[p * 2 + 1] = attrib;
    }
    mesh.setVerticesData(VertexBuffer.UVKind, uvs, true);

    console.log('tests done: ', calculationsCnt, 'cube checks ', cubeChecksCnt);
    const t1 = performance.now();
    console.log('Call to DistanceCalculator:updateDistanceAttributesForMesh() took ' + (t1 - t0) + ' milliseconds.');
  }

  public inflateBottom(helper: MeshHelper, polyline: Polyline) {
    console.log(`Call to DistanceCalculator:inflateBottom()`);
    for (let i = 0; i < 25; i++) {
      const newVertices = [];
      for (const v of this.vertexIndexMap) {
        const vertices = helper.getAdjacentVertices(v[0]);
        for (const w of vertices) {
          if (!this.vertexIndexMap.has(w) && polyline.getMinDistance(helper.getVertexAt(w)).distance < 1.01) {
            newVertices.push(w);
          }
        }
      }
      let idx = this.vertexIndexMap.size;
      for (const w of newVertices) {
        this.vertexIndexMap.set(w, idx++);
      }
    }
  }
}
