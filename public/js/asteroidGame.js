//
//
//
//


// developer flags
const AUTOMATION_ON=false; // set up the neural networks
const SOUND_ON=true;
const MUSIC_ON=true;
const SHOW_CENTER_DOT=true; // show or hide ship's center point
const SHOW_BOUNDING=false; // show or hide bounding - use circle

//game 
const FPS=30; // frames per second
const TEXT_FADE_TIME=5000; //text fade time in millisecs
const TEXT_SIZE=40; //text font height in pixels
const GAME_LIVES=3; // starting number of liveS
const SAVE_KEY_SCORE="highscore"; // save key for local storage of high score


// ship
const SHIP_SIZE=30;
const SHIP_THRUST=5; // accelaration of ship 5px/s2
const TURN_SPEED=180; // turn speed in degrees per second
const FRICTION=0.7; // 1= lot and 0.0 is none
const SHIP_EXPLODE_DUR = 0.3;// duration of ship's explosion in seconds
const SHIP_INV_DUR=3; // ship's invisibility in seconds
const SHIP_BLINK_DUR=0.1; // duration of ship's blink during invisibility period

// asteroids 
const ROIDS_NUM=3;// starting number of asteroids
const ROIDS_SIZE= 100; //starting size of asteroids in px 
const ROIDS_SPD = 50; // max starting speed of asteroids in px / sec
const ROIDS_VERT=10; // max vertices of roids
const ROIDS_JAG=0.4; // 0=none, 1 = lots
const ROIDS_PTS_LGE=20;
const ROIDS_PTS_MED=50;
const ROIDS_PTS_SML=100;

// lasers
const LASER_MAX= 10;// max lasers on screen
const LASER_SPD = 500; // speed of lasers 
const LASER_DIST= 0.5; // MAX dist laser can travel as fraction of screen width
const LASER_EXPLODE_DUR=0.1 // duration of laser's explosion in seconds


// set up the canvas
var canv = document.getElementById("gameCanvas");
var ctx= canv.getContext("2d");

// set up the sound effects
var fxLaser=new Sound("sounds/laser.m4a",5,1.0);
var fxExplode=new Sound("sounds/explode.m4a",1,1.0);
var fxHit=new Sound("sounds/hit.m4a",5,1.0);
var fxThrust=new Sound("sounds/thrust.m4a",5,1.0);
var music=new Music("sounds/music-low.m4a", "sounds/music-high.m4a");

// set up the game parameters
var level, roids, ship, text, textAlpha, lives, score, scoreHigh;
// set up ship, lvls
newGame();

// set up the neural network
if(AUTOMATION_ON){
    // todo neural network
}

// set up asteroids
createAsteroidBelt();

// set event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// setup game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {keyboardEvent} */ ev){
    if(ship.dead || AUTOMATION_ON){
        return;
    }
    switch (ev.keyCode){
        case 32: // space bar (shoot laser)
            shootLaser();
            break;
        case 37: // left arrow -> rotate ship left
            ship.rot = TURN_SPEED / 180 *Math.PI / FPS;
            break;
        case 38 : // up arrow -> thrust ship up
            ship.thrusting = true;
            break;
        case 39: // right arrow -> rotate ship right
            ship.rot = -TURN_SPEED / 180 *Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {keyboardEvent} */ ev){
    if(ship.dead || AUTOMATION_ON){
        return;
    }
    switch (ev.keyCode){
        case 32: // space bar (allow shooting again)
            ship.canShoot = true;
            break;
        case 37: // left arrow -> STOP rotate ship left
            ship.rot = 0;
            break;
        case 38 : // up arrow -> STOP thrust ship up
            ship.thrusting=false;
            break;
        case 39: // right arrow -> STOP rotate ship right
            ship.rot = 0;
            break;
    }
}

function newAsteroid(x,y,r){
    var lvlMult=1 + 0.1*level;
    var roid={
        x:x,
        y:y,
        xv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2, // in radians
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT/2),
        offs:[]
    };
    // create the vertex offset array
    for(var i=0; i<roid.vert; i++){
        roid.offs.push(Math.random()*ROIDS_JAG * 2 + 1-ROIDS_JAG);
    }
    return roid;
}

function createAsteroidBelt(){ 
    roids=[];
    roidsTotal=(ROIDS_NUM + level)* 7;
    roidsLeft=roidsTotal;
    var x,y;
    for(var i=0; i < ROIDS_NUM + level; i++){
        do{
            x= Math.floor(Math.random() * canv.width);
            y= Math.floor(Math.random() * canv.height);
            
        } while(distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE*2 + ship.r);
        roids.push(newAsteroid(x,y, Math.ceil(ROIDS_SIZE/2) ));
    }
}

function destroyAsteroid(index){
    var x=roids[index].x;
    var y=roids[index].y;
    var r=roids[index].r;
    
    //split the asteroid
    if(r== Math.ceil(ROIDS_SIZE/2)){
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/4)));
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/4)));
        score+=ROIDS_PTS_LGE;
    }else if(r == Math.ceil(ROIDS_SIZE/4)){
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/8)));
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/8)));
        score+=ROIDS_PTS_MED;
    }else{
        score+=ROIDS_PTS_SML;
    }

    // check high score
    if(score>scoreHigh){
        scoreHigh=score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    // destroy original asteroid 
    roids.splice(index,1);
    fxHit.play();

    // find the roids ratio to determine the music tempo
    roidsLeft--;
    music.setAsteroidRatio(roidsLeft==0 ? 1: roidsLeft/roidsTotal);

    // new level when no more asteroids
    if(roids.length==0){
        level++;
        newLevel();
    }
}

function newShip(){
    return {
        x: canv.width/2,
        y: canv.height/2,
        r: SHIP_SIZE/2,
        a: (90 / 180) * Math.PI, // convert to radians
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        rot: 0,
        thrusting: false,
        canShoot: true,
        lasers: [],
        explodeTime: 0,
        dead:false,
        thrust: {
            x:0,
            y:0
        }  
    }
};

function shootLaser(){
    //create laser object
    if(ship.canShoot && ship.lasers.length < LASER_MAX){
        ship.lasers.push({
            // from the nose of the ship
            x:ship.x + (4/3) * ship.r * Math.cos(ship.a),
            y: ship.y - (4/3) * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist:0,
            explodeTime:0
        });
        fxLaser.play();
    }
    // prevent shooting
    ship.canShoot=false;
}

function distBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1, 2));
}

function drawShip(x,y,a, color = "white"){
    ctx.strokeStyle=color;
    ctx.lineWidth=SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose of ship
        x + (4/3) * ship.r * Math.cos(a),
        y - (4/3) * ship.r * Math.sin(a)
    );
    ctx.lineTo( // rear left
        x - ship.r * ((2/3) * Math.cos(a) + Math.sin(a)),
        y + ship.r * ((2/3) * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // rear right
        x - ship.r * ((2/3) * Math.cos(a) - Math.sin(a)),
        y + ship.r * ((2/3) * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip(){
    if(SHOW_BOUNDING){
        ctx.strokeStyle="red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI*2, false);
        ctx.fill();
        ctx.stroke();
    }
    ship.explodeTime=Math.ceil(SHIP_EXPLODE_DUR * FPS); 
    fxExplode.play();
}

function gameOver(){
    ship.dead=true;
    text="Game Over";
    textAlpha=1.0;
}

function newGame(){
    level=0;
    score=0;
    lives=GAME_LIVES;
    // get the high score from the local storage
    var scoreStr=localStorage.getItem(SAVE_KEY_SCORE);
    if(scoreStr== null){
        scoreHigh=0;
    }else{
        scoreHigh=parseInt(scoreStr);
    }
    ship=newShip();
    newLevel();
}

function newLevel(){
    text="Level " + (level+1);
    textAlpha=1.0;
    createAsteroidBelt();
}

function Music(srcLow, srcHigh){
    this.soundLow=new Audio(srcLow);
    this.soundHigh=new Audio(srcHigh);
    this.low=true;
    this.tempo=1.0;//seconds / beat
    this.beatTime=0;//frames left until next beat
    this.play=function(){
        if(this.low){
            this.soundLow.play();     
        }else{
            this.soundHigh.play();
        }
        this.low= !this.low;
    }
    this.setAsteroidRatio=function(ratio){
        this.tempo=1.0- 0.75*(1.0-ratio);
    }
    if(MUSIC_ON){
        this.tick=function(){
            if(this.beatTime==0){
                this.play();
                this.beatTime=Math.ceil(this.tempo * FPS);
            }else{
                this.beatTime--;
            }
        }
    }
}

function Sound(src, maxStreams=1, vol=1.0){
    this.streamNum=0;
    this.streams=[];
    for(var i=0; i<maxStreams; i++){
        this.streams.push(new Audio(src));
        this.streams[i].volume=vol;
    }
    this.play=function(){
        if(SOUND_ON){
            this.streamNum=(this.streamNum+1)%maxStreams;
            this.streams[this.streamNum].play();
        }
    }
    this.stop= function(){
        this.streams[this.streamNum].pause();
        this.streams[this.streamNum].currentTime=0;
    }
}


function update(){
    //explosion & reset ship
    var exploding=ship.explodeTime>0;
    var blinkOn=ship.blinkNum % 2 == 0;

    //use the neural network to rotate  the ship and shoot
    if(AUTOMATION_ON){
        //todo constrol ship
    }

    //tick the music
    music.tick();

    // draw space
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canv.width, canv.height);

    // thrust the ship
    if(ship.thrusting){
        ship.thrust.x+=SHIP_THRUST*Math.cos(ship.a) / FPS;
        ship.thrust.y-=SHIP_THRUST*Math.sin(ship.a) / FPS;
        fxThrust.play();
    }else{
        ship.thrust.x -= FRICTION*ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION*ship.thrust.y / FPS;
        fxThrust.stop();
    }

    if(!exploding){
        if(blinkOn  && !ship.dead){
            // draw a triangular ship
            drawShip(ship.x, ship.y, ship.a);
            // ship is drawn
        }
        //handle blinking
        if(ship.blinkNum>0){
            // reduce blink time
            ship.blinkTime--;
            //reduce nlink number
            if(ship.blinkTime==0){
                ship.blinkTime=Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }// blinking over
    }else{
        // draw the explosion
        ctx.fillStyle="darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r*1.7, 0, Math.PI*2, false);
        ctx.fill();
        ctx.fillStyle="red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r*1.4, 0, Math.PI*2, false);
        ctx.fill();
        ctx.fillStyle="orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r*1.1, 0, Math.PI*2, false);
        ctx.fill();
        ctx.fillStyle="yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r*0.5, 0, Math.PI*2, false);
        ctx.fill();
        ctx.fillStyle="white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r*0.2, 0, Math.PI*2, false);
        ctx.fill();
    }
    // 
    if(SHOW_BOUNDING){
        ctx.strokStyle="lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI*2, false);
        ctx.stroke();
    }
    
    // draw the thruster
    if(ship.thrusting && blinkOn && !exploding && !ship.dead){
        ctx.fillStyle = "red";
        ctx.strokeStyle="yellow";
        ctx.lineWidth=SHIP_SIZE / 20;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.r * ((2/3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * ((2/3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( // rear behind the ship
            ship.x - ship.r * ((5/3) * Math.cos(ship.a)),
            ship.y + ship.r * ((5/3) * Math.sin(ship.a))
        );
        ctx.lineTo( // rear right
            ship.x - ship.r * ((2/3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * ((2/3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }//end thruster

    if(!exploding){
        // rotate ship 
        ship.a += ship.rot;

        // move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // handle edge of screen
        if(ship.x <0 - ship.r){
            ship.x = canv.width + ship.r;
        }else if(ship.x > canv.width + ship.r){
            ship.x = 0+ship.r;
        }
        if(ship.y <0 - ship.r){
            ship.y = canv.height + ship.r;
        }else if(ship.y> canv.height + ship.r){
            ship.y = 0+ship.r;
        }
    } //end of move and rotate

    // center  dot
    ctx.fillStyle="red";
    ctx.fillRect(ship.x-1, ship.y-1, 2, 2);

    // draw the lasers
    for(var i=0; i<ship.lasers.length; i++){
        if(ship.lasers[i].explodeTime==0){
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE/15, 0, Math.PI*2, false);
            ctx.fill();
        }else{
            //draw exploding lasers
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r*0.75, 0, Math.PI*2, false);
            ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r*0.5, 0, Math.PI*2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r*0.25, 0, Math.PI*2, false);
            ctx.fill();
        }
    }

    //move the lasers
    for(var i=ship.lasers.length-1; i>=0; i--){ // handle splicing - arr reduction
        // check dist travelled
        if(ship.lasers[i].dist> LASER_DIST*canv.width){
            ship.lasers.splice(i,1);
            continue;
        }
        //handle the explosion
        if(ship.lasers[i].explodeTime > 0){
            ship.lasers[i].explodeTime--;
            //destroy the laser after the duration is up
            if(explodeTime==0){
                ship.lasers.splice(i,1);
                continue;
            }
        }else{
            // move the lasers if dist is ok
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;
            // calculate dist travelled by lasers
            ship.lasers[i].dist+= Math.sqrt(Math.pow(ship.lasers[i].xv, 2)+Math.pow(ship.lasers[i].yv,2));
        }
        //handle edge of screen - LASER
        if(ship.lasers[i].x<0){
            ship.lasers[i].x =canv.width;
        }else if(ship.lasers[i].x > canv.width){
            ship.lasers[i].x =0;
        }
        if(ship.lasers[i].y<0){
            ship.lasers[i].y =canv.height;
        }else if(ship.lasers[i].y > canv.height){
            ship.lasers[i].y =0;
        }
    }
  
    // draw the asteroids
    for(var i=0; i<roids.length; i++){
        var x,y,r,a,vert,offs;
        ctx.strokeStyle="slategrey";
        ctx.lineWidth=SHIP_SIZE/20;
        x=roids[i].x;
        y=roids[i].y;
        r=roids[i].r;
        a=roids[i].a;
        vert=roids[i].vert;
        offs=roids[i].offs;
        //path
        ctx.beginPath();
        ctx.moveTo(
            x+r*offs[0]*Math.cos(a),
            y+r*offs[0]*Math.sin(a)
        );
        //polygon
        for(var j=1; j<vert; j++){
            ctx.lineTo(
                x+r*offs[j]*Math.cos(a+ j*Math.PI*2/vert),
                y+r*offs[j]*Math.sin(a+ j*Math.PI*2/vert),
            );
        }
        ctx.closePath();
        ctx.stroke();
        if(SHOW_BOUNDING){
            ctx.strokeStyle="green";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2, false);
            ctx.stroke();
        }
    }// end of asteroid creation


    // laser hits asteroid
    var ax, ay, ar, lx, ly;
    for (var i=roids.length-1; i>=0 ;i--){
        ax=roids[i].x;
        ay=roids[i].y;
        ar=roids[i].r;
        //loop over lasers
        for(var j=ship.lasers.length-1; j>=0; j--){
            lx=ship.lasers[j].x;
            ly=ship.lasers[j].y;
            //detect hits
            if(ship.lasers[j].explodeTime==0 && distBetweenPoints(ax,ay,lx,ly)<ar){
                // ship.lasers.splice(j,1);//remove laser
                //roids.splice(i,1); //remove asteroid
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;

            }
        }
    }

    // check for asteroid collision
    if(!exploding && ship.blinkNum==0  && !ship.dead){
        for(var i=0; i<roids.length; i++){
            if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y)< ship.r+roids[i].r){
                explodeShip();
                destroyAsteroid(i);
                break;
            }
        }
    }else{
        ship.explodeTime--;
        if(ship.explodeTime == 0){
            lives--;
            if(lives==0){
                gameOver();
            }else{
                ship=newShip();
            }
        }
    }

    //move the asteroid
    for(var i=0; i<roids.length; i++){
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;
        //handle edge of screen
        if(roids[i].x < 0 - roids[i].r){
            roids[i].x = canv.width + roids[i].r;
        }else if(roids[i].x > canv.width + roids[i].r){
            roids[i].x =roids[i].r;
        }
        if(roids[i].y < 0 - roids[i].r){
            roids[i].y = canv.height + roids[i].r;
        }else if(roids[i].y > canv.height + roids[i].r){
            roids[i].y =roids[i].r;
        }
    }//end roids for loop


    // draw game text level
    if(textAlpha>=0){
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillStyle="rgba(255,255,255, " + textAlpha + ")";
        ctx.font="small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canv.width/2, canv.height*0.75);
        textAlpha -= (1.0/(TEXT_FADE_TIME/FPS));
    }else if(ship.dead){
        newGame();
    }

    // draw the lives
    var lifeColor;
    for(var i=0 ; i<lives; i++){
        lifeColor= exploding && i==lives-1 ? "red" : "white";
        drawShip(SHIP_SIZE + i*SHIP_SIZE*1.2, SHIP_SIZE, 0.5*Math.PI, lifeColor);
    }

    // draw the score
    ctx.textAlign="right";
    ctx.textBaseline="middle";
    ctx.fillStyle="white";
    ctx.font=TEXT_SIZE+"px dejavu sans mono";
    ctx.fillText(score, canv.width-SHIP_SIZE/2, SHIP_SIZE);

    // draw the high score
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillStyle="white";
    ctx.font=TEXT_SIZE+"px dejavu sans mono";
    ctx.fillText(scoreHigh, canv.width/2, SHIP_SIZE);
}//end update function

