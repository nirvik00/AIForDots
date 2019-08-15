class Paddle{
    constructor(game){
        this.gameWidth=game.gameWidth;
        this.gameHeight=game.gameHeight;
        this.width=100;
        this.height=5;
        this.position={
            x:this.gameWidth/2 - this.width/2,
            y:this.gameHeight - this.height - 40
        };
        this.maxSpeed=10;
        this.speed=0;
    }

    draw(ctx){
        ctx.fillStyle="rgba(55,150,200,1.0)";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(){
        //if(!deltaTime) return;
        this.position.x += this.speed;
        this.handleOutOfScreen();
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
        if(this.position.x + this.width > this.gameWidth){
            this.position.x=this.gameWidth-this.width;
        }
    }

    stop(){
        this.speed=0;
    }
}