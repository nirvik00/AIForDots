//
//

/*
// test matrix ops
let m0=new Matrix(2,3);
m0.randomWeights();
// console.table(m0.data);


let m1=new Matrix(3,2,[
    [1,2],
    [2,3],
    [3,4]
]);
// console.table(m1.data);

let m2=new Matrix(2,2,[
    [4,5],
    [6,7]
]);
let m3=Matrix.dot(m1,m2);
// console.table(m3.data);

let m4= Matrix.map(m3, e=>(e*2));
// console.table(m4.data);

// test neural networks XOR Gate
var nn=new NeuralNetwork(2,15,1);
var out=nn.feedForward([1,2]);
for(let i=0; i<10000;i++){
    let input0=Math.round(Math.random());
    let input1=Math.round(Math.random());
    let output= ((input0==input1) ? 0 : 1);
    nn.train([input0, input1], [output]);
}
// test output
console.log("0.0:"+nn.feedForward([0,0]).data);
console.log("0.1:"+nn.feedForward([0,1]).data);
console.log("1.0:"+nn.feedForward([1,0]).data);
console.log("1.1:"+nn.feedForward([1,1]).data);
*/


//
//
//


let canvas=document.getElementById("gameScreen");
let ctx=canvas.getContext('2d');

const GAME_HEIGHT=500;
const GAME_WIDTH=700;
const DELTA_TIME=30;
const FPS=10;

ctx.fillStyle="rgba(255,0,0,0.5)";
ctx.fillRect(20,20,40,20);


var game=new Game(GAME_WIDTH, GAME_HEIGHT);


//game loop

/*
var lastTime=0;
function gameLoop(timeStamp){
    let deltaTime= timeStamp - lastTime;
    lastTime=timeStamp;
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    //
    game.update(deltaTime);
    game.draw(ctx);
    //
    requestAnimationFrame(gameLoop);
    //
}
gameLoop(0);
*/


setInterval(gameLoop, FPS);
function gameLoop(){
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    //
    game.update();
    game.draw(ctx);
}
