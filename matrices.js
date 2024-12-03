class Matrix {
  constructor(m, skipChecks=false){
    if (!Array.isArray(m) || !Array.isArray(m[0])){
      throw new Error("Input must be a nested array.");
    }

    this.rows = m.length;
    this.cols = m[0].length;
    this.data = m;

    if (skipChecks) return;

    for (let i = 0; i < this.rows; i++){
      if (m[i].length !== this.cols) throw new Error("Unexpected ragged array.");
    }
  }

  printMatrix() {
    let printStr = `(${this.rows} x ${this.cols})\n`;
    printStr += `${"-".repeat(20)}\n`;
    for (let i = 0; i < this.rows; i++){
      printStr += this.data[i].toString();
      printStr += "\n"
    }
    printStr += `${"-".repeat(20)}\n`;
    console.log(printStr);
  }
}

Matrix.prototype.multiply = function(m2){
  if (!(m2 instanceof Matrix) && typeof m2 !== "number"){
    throw new Error("Attempted multiplication with non-matrix or non-float");
  }

  const newMat = [];
  if (typeof m2 === "number"){
    for (let i = 0; i < this.rows; i++){
      const newRow = [];
      for (let j = 0; j < this.cols; j++){
        newRow.push(this.data[i][j] * m2);
      }
      newMat.push(newRow);
    }
    return new Matrix(newMat, true);
  }

  if (this.cols !== m2.rows){
    throw new Error("Matrix multiplication has dimension mismatch.");
  }

  for (let i = 0; i < this.rows; i++){
    const newRow = [];
    for (let j = 0; j < m2.cols; j++){
      let dotSum = 0;
      for (let k = 0; k < this.cols; k++){
        dotSum += this.data[i][k] * m2.data[k][j];
      }
      newRow.push(dotSum);
    }
    newMat.push(newRow);
  }
  return new Matrix(newMat, true);
}
Matrix.prototype.m = Matrix.prototype.multiply;

Matrix.prototype.translate = function(){
  const newMat = [];
  for (let i = 0; i < this.cols; i++){
    const newRow = [];
    for (let j = 0; j < this.rows; j++){
      newRow.push(this.data[j][i]);
    }
    newMat.push(newRow);
  }

  return new Matrix(newMat, true);
}

Matrix.prototype.t = Matrix.prototype.translate;

Matrix.prototype.hstack = function(m2){
  if (!(m2 instanceof Matrix)){
    throw new Error("Attempted hstack with non-matrix");
  }

  if (this.rows !== m2.rows){
    throw new Error("Cannot hstack, number of rows mismatch");
  }

  const newMat = [];
  for (let i = 0; i < this.rows; i++){
    const newRow = [];
    for (let j = 0; j < this.cols; j++){
      newRow.push(this.data[i][j]);
    }
    for (let j = 0; j < m2.cols; j++){
      newRow.push(m2.data[i][j]);
    }
    newMat.push(newRow);
  }

  return new Matrix(newMat, true);
}

Matrix.prototype.h = Matrix.prototype.hstack;

Matrix.prototype.vstack = function(m2){
  if (!(m2 instanceof Matrix)){
    throw new Error("Attempted vstack with non-matrix");
  }

  if (this.cols !== m2.cols){
    throw new Error("Cannot vstack, number of cols mismatch");
  }

  const newMat = [];
  for (let i = 0; i < this.rows; i++){
    const newRow = [];
    for (let j = 0; j < this.cols; j++){
      newRow.push(this.data[i][j]);
    }
    newMat.push(newRow);
  }
  for (let i = 0; i < m2.rows; i++){
    const newRow = [];
    for (let j = 0; j < m2.cols; j++){
      newRow.push(m2.data[i][j]);
    }
    newMat.push(newRow);
  }

  return new Matrix(newMat, true);
}

Matrix.prototype.v = Matrix.prototype.vstack;
