import createKDTree from 'static-kdtree';

/**
 * [OPT-JJ] worker for creating KdTrees for FriendlyGeometry
 * message has 2 fields:
 *  - vertexPoints - Float64Array of vertices: [x1, y1, z1, x2, y2, z2, ...]
 *  - facePoints - Float64Array of faces' center vectors: [x1, y1, z1, x2, y2, z2, ...]
 * groups vertices' coordinates together and sends it to createKDTree
 * returns message with serialized created KdTrees
 */
addEventListener('message', (event: any) => {
  const sharedArray = new Float32Array(event.data.sharedBuffer);
  const iArray = new Int32Array(event.data.iResultArray);
  const pArray = new Float32Array(event.data.pResultArray);
  // console.log(sharedArray);

  const len = sharedArray.length / 3;
  const array = [];
  array.length = len;
  for (let i = 0; i < len; i++) {
    array[i] = [sharedArray[i * 3], sharedArray[i * 3 + 1], sharedArray[i * 3 + 2]];
  }

  const verticesKdTree = createKDTree(array);
  const ser = verticesKdTree.serialize();

  for (let i = 0; i < iArray.length; i++) {
    iArray[i] = ser.i[i];
  }

  for (let i = 0; i < pArray.length; i++) {
    pArray[i] = ser.p[i];
  }

  /*
  for (let i = 0; i < vertexPoints.length; i += 3) {
    vertexPointsGrouped.push([vertexPoints[i], vertexPoints[i + 1], vertexPoints[i + 2]]);
  }
  for (let i = 0; i < facePoints.length; i += 3) {
    facePointsGrouped.push([facePoints[i], facePoints[i + 1], facePoints[i + 2]]);
  }
  const verticesKdTree = createKDTree(vertexPointsGrouped);
  const trianglesKdTree = createKDTree(facePointsGrouped);
  postMessage({
    verticesKdTreeSerialized: verticesKdTree.serialize(),
    trianglesKdTreeSerialized: trianglesKdTree.serialize(),
  });
  */
});
