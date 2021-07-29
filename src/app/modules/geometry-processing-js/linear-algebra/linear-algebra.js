/* tslint:disable */
let Vector = require('./vector.js');
let memoryManager = require('./emscripten-memory-manager.js');
let Complex = require('./complex.js');
let DenseMatrix = require('./dense-matrix.js');
let ComplexDenseMatrix = require('./complex-dense-matrix.js');
//let SparseMatrix = require('./sparse-matrix.js').SparseMatrix;
//let Triplet = require('./sparse-matrix.js').Triplet;
import { Triplet } from './sparse-matrix.js';
import { SparseMatrix } from './sparse-matrix.js';

//let [SparseMatrix, Triplet] = require('./sparse-matrix.js');
let [ComplexSparseMatrix, ComplexTriplet] = require('./complex-sparse-matrix.js');

export { Vector, memoryManager, Complex, DenseMatrix, SparseMatrix, Triplet, ComplexDenseMatrix, ComplexSparseMatrix, ComplexTriplet };
