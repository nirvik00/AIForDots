//game 
const FPS=30; // frames per second

// ship
const SHIP_SIZE=30;
const SHIP_THRUST=5; // accelaration of ship 5px/s2
const TURN_SPEED=180; // turn speed in degrees per second
const FRICTION=0.7; // 1= lot and 0.0 is none
const SHIP_EXPLODE_DUR = 0.3;// duration of ship's explosion in seconds
const SHIP_INV_DUR=3; // ship's invisibility in seconds
const SHIP_BLINK_DUR=0.1; // duration of ship's blink during invisibility period

// asteroids 
const ROIDS_NUM=1;// starting number of asteroids
const ROIDS_SIZE= 100; //starting size of asteroids in px 
const ROIDS_SPD = 50; // max starting speed of asteroids in px / sec
const ROIDS_VERT=10; // max vertices of roids
const ROIDS_JAG=0.4; // 0=none, 1 = lots

// collision detection
const SHOW_CENTER_DOT=true; // show or hide ship's center point
const SHOW_BOUNDING=false; // show or hide bounding - use circle

// lasers
const LASER_MAX= 10;// max lasers on screen
const LASER_SPD = 500; // speed of lasers 
const LASER_DIST= 0.2; // MAX dist laser can travel as fraction of screen width
const LASER_EXPLODE_DUR=0.1 // duration of laser's explosion in seconds

var canv = document.getElementById("gameCanvas");
var ctx= canv.getContext("2d");

// set up the game parameters
var level, roids, ship;
// set up ship, lvls
newGame();

// set up asteroids
createAsteroidBelt();

// set event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// setup game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {keyboardEvent} */ ev){
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
    }else if(r == Math.ceil(ROIDS_SIZE/4)){
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/8)));
        roids.push(newAsteroid(x,y,Math.ceil(ROIDS_SIZE/8)));
    }
    // destroy original asteroid 
    roids.splice(index,1);
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
    }
    // prevent shooting
    ship.canShoot=false;
}

function distBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1, 2));
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
}

function newGame(){
    level=0;
    ship=newShip();
    newLevel();
}

function newLevel(){
    createAsteroidBelt();
}


function update(){
    //explosion & reset ship
    var exploding=ship.explodeTime>0;
    var blinkOn=ship.blinkNum % 2 == 0;

    // draw space
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canv.width, canv.height);

    // thrust the ship
    if(ship.thrusting){
        ship.thrust.x+=SHIP_THRUST*Math.cos(ship.a) / FPS;
        ship.thrust.y-=SHIP_THRUST*Math.sin(ship.a) / FPS;
    }else{
        ship.thrust.x -= FRICTION*ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION*ship.thrust.y / FPS;
    }

    if(!exploding){
        if(blinkOn){
            // draw a triangular ship
            ctx.strokeStyle="white";
            ctx.lineWidth=SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo( // nose of ship
                ship.x + (4/3) * ship.r * Math.cos(ship.a),
                ship.y - (4/3) * ship.r * Math.sin(ship.a)
            );
            ctx.lineTo( // rear left
                ship.x - ship.r * ((2/3) * Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * ((2/3) * Math.sin(ship.a) - Math.cos(ship.a))
            );
            ctx.lineTo( // rear right
                ship.x - ship.r * ((2/3) * Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * ((2/3) * Math.sin(ship.a) + Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.stroke();
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
    if(ship.thrusting && blinkOn && !exploding ){
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
    } //end of move and totate

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
    if(!exploding && ship.blinkNum==0){
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
            ship=newShip();
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

}//end update function

