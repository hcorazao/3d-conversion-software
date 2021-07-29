import ConsistencyChecker from './consistency-checker';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import SmallHoleFillingAlgorithm from './small-hole-filling';
import { MediumHoleFillingAlgorithm } from './medium-hole-filling';
import LargeHoleFillingAlgorithm from './large-hole-filling';
import HalfEdgeMesh from './halfedgemesh';

export default class HoleFillingAlgorithm {
  protected mesh: CRHalfEdgeMesh;
  protected smallHoleFiller: SmallHoleFillingAlgorithm;
  protected mediumHoleFiller: MediumHoleFillingAlgorithm;
  protected largeHoleFiller: LargeHoleFillingAlgorithm;

  protected readonly SMALL = 6;
  protected readonly MEDIUM = 1120;

  constructor(mesh: CRHalfEdgeMesh) {
    this.mesh = mesh;
    this.smallHoleFiller = new SmallHoleFillingAlgorithm(mesh);
    this.mediumHoleFiller = new MediumHoleFillingAlgorithm(mesh);
    this.largeHoleFiller = new LargeHoleFillingAlgorithm(mesh);
  }

  compute() {
    const checker = new ConsistencyChecker(this.mesh);
    // checker.checkAllConsistencies();

    // check the performance
    const t0 = performance.now();

    for (const hole of this.mesh.holes) {
      const f = this.mesh.boundaries[hole];
      const len = HalfEdgeMesh.BoundaryLength(f.halfedge);
      /*
      if (len > this.SMALL) {
        this.largeHoleFiller.setBoundaryFace(f);
        this.largeHoleFiller.compute();
      }
*/
      if (len > this.SMALL && len <= this.MEDIUM) {
        this.mediumHoleFiller.setBoundaryFace(f);
        this.mediumHoleFiller.compute();
      }
    }

    const t1 = performance.now();
    console.log('Call to HoleFillingAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    // checker.checkAllConsistencies();
  }
}
