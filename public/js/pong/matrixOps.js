//
//

"use strict";

//
//

class Matrix{
    constructor(rows, cols, data=[]){
        this._rows=rows;
        this._cols=cols;
        this._data=data;
        if(data==null || data.length==0){
            this._data=[];
            for(let i=0; i<this._rows; i++){
                this._data[i]=[];
                for(let j=0; j<this._cols; j++){
                    this._data[i][j]=0;
                }
            }
        }else{
            if(data.length != rows || data[0].length != cols){
                throw new Error("Incorrect data dimensions sent to constructor");
            }
        }
    }

    get rows(){
        return this._rows;
    }
    get cols(){
        return this._cols;
    }
    get data(){
        return this._data;
    }

    // set random weights to all elements of matrix between -1, 1
    randomWeights(){
        for(let i=0; i<this.rows; i++){
            for(let j=0; j<this.cols; j++){
                this.data[i][j]=Math.random() * 2 - 1; // -1 < x < 1
            }
        }
    }

    // element-wise matrix addition 
    static add(m0, m1){
       Matrix.checkDimensions(m0,m1);
       let m=new Matrix(m0.rows, m0.cols);
       for(let i=0; i<m.rows; i++){
           for(let j=0; j<m.cols; j++){
               m.data[i][j] = m0.data[i][j] + m1.data[i][j];
           }
       }
       return m;
    }

    // element-wise matrix subtraction
    static subtract(m0, m1){
        Matrix.checkDimensions(m0, m1);
        let m= new Matrix(m0.rows, m0.cols);
        for(let i=0; i<m.rows; i++){
            for(let j=0;j< m.cols; j++){
                m.data[i][j]= m0.data[i][j] - m1.data[i][j];
            }
        }
        return m;
    }

    // element-wise matrix multiplication
    static multiply(m0, m1){
        Matrix.checkDimensions(m0, m1);
        let m=new Matrix(m0.rows, m0.cols);
        for(let i=0; i<m.rows; i++){
            for(let j=0; j<m.cols ; j++){
                m.data[i][j]=m0.data[i][j] * m1.data[i][j];
            }
        }
        return m;
    }

    // dot product of two matrices: sumOf(rows(m0)*cols(m1))
    static dot(m0, m1){
        if(m0.cols !== m1.rows){
            throw new Error("dot prod: incompatible matrices");
        }
        let m=new Matrix(m0.rows, m1.cols);
        for(let i=0; i<m.rows; i++){
            for(let j=0; j<m.cols; j++){
                let sum=0;
                for(let k=0; k<m0.cols; k++){
                    sum+= (m0.data[i][k] * m1.data[k][j]);
                }
                m.data[i][j]=sum;
            }
        }
        return m;
    }

    // single-row matrix from a 1-d array
    static convertFromArray(arr){
        return new Matrix(1, arr.length, [arr]);
    }

    // apply function to all elements of matrix
    static map(m0, mFunc){
        let m=new Matrix(m0.rows, m0.cols);
        for(let i=0; i<m.rows; i++){
            for(let j=0; j<m.cols; j++){
                m.data[i][j] = mFunc(m0.data[i][j]);
            }
        }
        return m;
    }

    // matrix transpose: rows= cols & cols=rows
    static transpose(m0){
        let m= new Matrix(m0.cols, m0.rows);
        for(let i=0; i<m0.rows; i++){
            for(let j=0; j<m0.cols; j++){
                m.data[j][i] = m0.data[i][j];
            }
        }
        return m;
    }

    // ensure dimensions of both matrix are same
    static checkDimensions(m0, m1){
        if(m0.rows != m1.rows || m0.cols != m1.cols){
            throw new Error("Matrices have different dimensions");
        }
    }
}