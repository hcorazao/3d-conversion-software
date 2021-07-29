import { Mesh } from '@babylonjs/core';
import SceneJawObject from '../JawObjects/SceneJawObject';
import SceneObjectsManager from '../SceneObjectsManager';
import ProjectManager from './ProjectManager';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import HoleFillingAlgorithm from '@app/modules/geometry-processing-js/core/hole-filling';
import Debug from '../../core/debug/Debug';
import ConsistencyChecker from '@app/modules/geometry-processing-js/core/consistency-checker';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';

/**
 * ProjectObjects is a container and handler of the 3d jaw meshes used on the app
 * it keeps track of the 3d objects that are being in the scene and the user information
 *
 */
export default class ProjectObjects {
  private projectData: object;
  private projectManager: SceneObjectsManager;
  private projectManager2: ProjectManager;

  constructor(projectManager, projectManager2) {
    this.projectManager = projectManager;
    this.projectManager2 = projectManager2;
  }

  setUpper(meshArray: Mesh) {
    if (this.projectManager.isPreparation === SceneObjectsManager.JawType.UpperJaw) {
      const upperJaw = new SceneJawObject(this.projectManager, meshArray, new CRHalfEdgeMesh(meshArray, false));
      this.projectManager.setJaw(SceneObjectsManager.JawType.UpperJaw, upperJaw);

      upperJaw.getHalfEdgeMesh().removeFins();

      const holeFilling = new HoleFillingAlgorithm(upperJaw.getHalfEdgeMesh());
      holeFilling.compute();

      upperJaw.getHalfEdgeMesh().indexElements();
      upperJaw.getHalfEdgeMesh().updateMesh();
      upperJaw.getHalfEdgeMesh().createVerticesKdTree();
      upperJaw.getHalfEdgeMesh().createTrianglesKdTree();
    } else {
      const upperJaw = new SceneJawObject(this.projectManager, meshArray, null);
      this.projectManager.setJaw(SceneObjectsManager.JawType.UpperJaw, upperJaw);
    }
  }

  setLower(meshArray: Mesh) {
    if (this.projectManager.isPreparation === SceneObjectsManager.JawType.LowerJaw) {
      const lowerJaw = new SceneJawObject(this.projectManager, meshArray, new CRHalfEdgeMesh(meshArray, false));
      this.projectManager.setJaw(SceneObjectsManager.JawType.LowerJaw, lowerJaw);

      lowerJaw.getHalfEdgeMesh().removeFins();

      const holeFilling = new HoleFillingAlgorithm(lowerJaw.getHalfEdgeMesh());
      holeFilling.compute();

      lowerJaw.getHalfEdgeMesh().indexElements();
      lowerJaw.getHalfEdgeMesh().updateMesh();
      lowerJaw.getHalfEdgeMesh().createVerticesKdTree();
      lowerJaw.getHalfEdgeMesh().createTrianglesKdTree();
    } else {
      const lowerJaw = new SceneJawObject(this.projectManager, meshArray, null);
      this.projectManager.setJaw(SceneObjectsManager.JawType.LowerJaw, lowerJaw);
    }
  }

  setOcclusion(meshArray: Mesh) {
    const occlusionJaw = new SceneJawObject(this.projectManager, meshArray, new CRHalfEdgeMesh(meshArray, false));
    this.projectManager.setJaw(this.projectManager.isPreparation + 1, occlusionJaw);

    occlusionJaw.getHalfEdgeMesh().removeFins();

    const holeFilling = new HoleFillingAlgorithm(occlusionJaw.getHalfEdgeMesh());
    holeFilling.compute();

    occlusionJaw.getHalfEdgeMesh().indexElements();
    occlusionJaw.getHalfEdgeMesh().updateMesh();
    occlusionJaw.getHalfEdgeMesh().createVerticesKdTree();
    occlusionJaw.getHalfEdgeMesh().createTrianglesKdTree();
  }

  setSite(meshArray: Mesh) {
    // this.siteJawObject = new SceneJawObject(meshArray);

    const buccalJaw = new SceneJawObject(this.projectManager, meshArray, new CRHalfEdgeMesh(meshArray, false));
    this.projectManager.setJaw(SceneObjectsManager.JawType.BuccalBite, buccalJaw);

    // the buccal jaw is never visible nor pickable
    buccalJaw.visibility = 0;
    buccalJaw.isPickable = false;
  }

  updateCaseObjectsSettings(options: CaseObjectsSettings) {
    if (this.projectManager.getJawAsObject(this.projectManager.JawType.LowerJaw) && options.lowerJaw?.opacity !== undefined) {
      this.projectManager.getJawAsObject(this.projectManager.JawType.LowerJaw).visibility = options.lowerJaw.opacity;
    }
    if (this.projectManager.getJawAsObject(this.projectManager.JawType.UpperJaw) && options.upperJaw?.opacity !== undefined) {
      this.projectManager.getJawAsObject(this.projectManager.JawType.UpperJaw).visibility = options.upperJaw.opacity;
    }
    if (this.projectManager.getJawAsObject(this.projectManager.JawType.LowerJawSitu) && options.lowerJawSitu?.opacity !== undefined) {
      this.projectManager.getJawAsObject(this.projectManager.JawType.LowerJawSitu).visibility = options.lowerJawSitu?.opacity;
    }
    if (this.projectManager.getJawAsObject(this.projectManager.JawType.UpperJawSitu) && options.upperJawSitu?.opacity !== undefined) {
      this.projectManager.getJawAsObject(this.projectManager.JawType.UpperJawSitu).visibility = options.upperJawSitu?.opacity;
    }
    if (this.projectManager.restorations[this.projectManager.preparationToothNumber] && options.crown?.opacity !== undefined) {
      this.projectManager.restorations[this.projectManager.preparationToothNumber].visibility = options.crown.opacity;
    }
  }

  updateDevSettings(devSettings) {
    this.projectManager.setWireframe(devSettings.meshVisibility);
  }
}
