//
//
//  game setup
//
//
playAI=true;
var origBoard;
const huPlayer="o";
const aiPlayer="x";
const winCombos=[
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[6,4,2]
];
const cells=document.querySelectorAll('.cell');
startGame();
//
//

function startGame(playai){
    playAi=playai;
    if(playAi==true){
        document.getElementById("aimsg").innerHTML="playing with AI alg";
    }else{
        document.getElementById("aimsg").innerHTML="playing with fake AI";
    }
    origBoard=Array.from(Array(9).keys());
    document.querySelector(".endgame").style.display='none';
    for(var i=0; i<cells.length; i++){
        cells[i].innerText='';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

// gameplay
function turnClick(cellClicked){
    var i=cellClicked.target.id;
    if(typeof(origBoard[i]=="number")){
        let playNext=turn(i, huPlayer);
        if(!checkTie() && playNext){
            turn(bestSpot(), aiPlayer);
        }
    }
}

// gameplay
function turn(i, player){
    origBoard[i]=player; 
    document.getElementById(i).innerText=player;
    cells[i].removeEventListener('click', turnClick, false);
    let gameWon=checkWin(origBoard, player);
    if(gameWon) {
        gameOver(gameWon);
        return false;
    }
    return true;
}

// ai gameplay
function bestSpot(){
    if(playAi===true) {
        return minimax(origBoard, aiPlayer).index;
    }else {
        var emptyCells=shuffleArray(emptySquares());
        return emptyCells[0];
    }
}

//
function shuffleArray(arr){
    var newArr=Array.from(arr);
    for(let i=0; i<newArr.length; i++){
        let a=i;
        let b= Math.floor(Math.random()*arr.length);
        var tmp=newArr[a];
        newArr[a]=newArr[b];
        newArr[b]=tmp;
    }
    return newArr;
}

// board states
function emptySquares(){
    var arr=[];
    for(var i=0; i<origBoard.length; i++){
        if(typeof(origBoard[i])==="number"){
            arr.push(i);
        }
    }
    return arr;
    // return origBoard.filter(s=>typeof(s)==="number");
}

//
function checkTie(){
    if(emptySquares().length === 0){
        for(var i=0; i<cells.length; i++){
            cells[i].style.backgroundColor="rgba(0,75,100,150)";
            cells[i].removeEventListener("click", turnClick, false);
        }
        declareWinner("Tie Game");
        return true;
    }
    return false;
}

//
function checkWin(board, player){
    // let plays=board.reduce((a,e,i) => (e===player)? a.concat(i) : a, []);
    let plays=[];
    for(var i=0; i<board.length; i++){
        if(board[i] === player){
            plays.push(i);
        }
    }
    let gameWon=null;
    for(var i=0; i<winCombos.length; i++){
        var a=winCombos[i][0];
        var b=winCombos[i][1];
        var c=winCombos[i][2];
        var sum=0;
        for(var j=0; j<plays.length; j++){
            var g=plays[j];
            if(g===a || g===b || g===c){
                sum++;
            }
        }
        if(sum>2){
            gameWon={index:i, player: player};
            break;
        }
    }
    return gameWon;
}

//
function gameOver(gameWon){
    var arr=winCombos[gameWon.index];
    var player=gameWon.player;
    for(var i=0; i<arr.length; i++){
        let id=arr[i];
        if(player === huPlayer){
            document.getElementById(id).style.backgroundColor="green";
        }else{
            document.getElementById(id).style.backgroundColor="red";
        }
    }
    for(var i=0; i<cells.length; i++){
        cells[i].removeEventListener('click', turnClick, false);
    }
    var s= (player===huPlayer? "you win!" : "ai wins!");
    declareWinner(s);
}

//
function declareWinner(who){
    document.querySelector(".endgame").style.display="block";
    document.querySelector(".endgame").innerText=who;
}


/// minimax algorithm
function minimax(newBoard, player){
    var availSpots=emptySquares(newBoard);
    if(checkWin(newBoard, huPlayer)){
        return {score: -10};
    }else if(checkWin(newBoard, aiPlayer)){
        return {score: 10};
    }else if(availSpots.length===0){
        return {score: 0};
    }

    var moves=[]
    for(var i=0; i<availSpots.length; i++){
        var move={};
        move.index=newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;
        if(player== aiPlayer){
            var result=minimax(newBoard, huPlayer);
            move.score=result.score;
        }else{
            var result=minimax(newBoard, aiPlayer);
            move.score=result.score;
        }
        newBoard[availSpots[i]]= move.index;
        moves.push(move);
    }

    var bestMove;
    if(player== aiPlayer){
        var bestScore=-10000;
        for(var i=0; i<moves.length; i++){
            if(moves[i].score > bestScore){
                bestScore=moves[i].score;
                bestMove=i;
            }
        }
    }else{
        var bestScore=10000;
        for(var i=0; i<moves.length; i++){
            if(moves[i].score < bestScore){
                bestScore=moves[i].score;
                bestMove=i;
            }
        }
    }
    return moves[bestMove];
}
