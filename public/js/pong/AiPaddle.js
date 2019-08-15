class aiPaddle{
    constructor(game){
        this.game=game;
        this.W=this.game.gameWidth;
        this.H=this.game.gameHeight;
        this.width=100;
        this.height=20;
        this.destroy=[];
        // determine the brick x,y
        this.position={x: 200, y:20};

        this.maxSpeed=10;
        this.speed=0;
    }

    draw(ctx){
        let x=this.position.x;
        let y=this.position.y;
        ctx.fillStyle="rgba(255,150,150,0.5)";
        ctx.fillRect(x,y,this.width,this.height);

        // test pt intersection

    }
    
    update(deltaTime){
        let a=this.baseIntxPt();
        if(a > this.position.x){
            this.moveRight();
        } else {
            this.moveLeft(); 
        }
        this.position.x += (this.speed);
        this.handleOutOfScreen();
    }

    baseIntxPt(){
        let bx=this.game.ball.x;
        let by=this.game.ball.y;
        let vx=this.game.ball.speedX/3;
        let vy=this.game.ball.speedY/3;
        let c= by - (vy/vx)*bx;
        let a= -c / (vy/vx);
        return a-this.width/2;
    }

    moveLeft(){
        this.speed = -this.maxSpeed;
    }

    moveRight(){
        this.speed = +this.maxSpeed;
    }

    handleOutOfScreen(){
        if(this.position.x<0){
            this.position.x =0;
        }
        if(this.position.x + this.width > this.game.gameWidth){
            this.position.x=this.game.gameWidth - this.width;
        }
    }
}