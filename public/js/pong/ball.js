class Ball{
    constructor(game){
        this.x= 35;
        this.y=200;
        this.r=10;
        this.speedX=3;
        this.speedY=3;
        this.game=game;
        this.gameWidth=this.game.gameWidth;
        this.gameHeight=this.game.gameHeight;
        this.gameOver=false;
        this.humanScore=0;
        this.aiScore=0;
    }
    update(){
        this.x+=this.speedX;
        this.y+=this.speedY;
        this.handleOutofScreen();
        this.checkCollision();
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle="rgba(255,0,0,1)";
        ctx.fill();

        // draw direction
        /*
        let x=this.x, y=this.y, ux= this.speedX, uy=this.speedY;
        ctx.beginPath();
        ctx.moveTo(x,y);
        let sc=10;
        ctx.lineTo(x+ ux*sc,uy*sc +y);
        ctx.lineWidth=1;
        ctx.strokeStyle="rgba(255,255,255,1.0)"
        ctx.stroke();
        */
    }

    handleOutofScreen(){
        if(this.x<0 || this.x>this.gameWidth){
            this.speedX = -this.speedX;
        }
        if(this.y<0 || this.y>this.gameHeight){
            this.speedY = -this.speedY;
        }
        if(this.y>this.gameHeight){
            this.gameOver=true;
        }
    }

    checkCollision(){
        let px=this.game.paddle.position.x;
        let py=this.game.paddle.position.y;
        let pw=this.game.paddle.width;
        let ph=this.game.paddle.height;
        this.collisionObjEffectsBall(px,py,pw,ph);

        let qx=this.game.aiPaddle.position.x;
        let qy=this.game.aiPaddle.position.y;
        let qw=this.game.aiPaddle.width;
        let qh=this.game.aiPaddle.height;
        this.collisionObjEffectsBall(qx,qy,qw,qh);
    }
    collisionObjEffectsBall(px, py, pw, ph){
        let bx=this.x;
        let by=this.y+this.r/2;
        if(by>py && by<py+ph && bx>px && bx<px+pw){
            this.speedY =-this.speedY;
        }
        if(by-this.r <=0){
            this.humanScore++;
        }
        if(by+this.r/2>this.gameHeight){
            this.aiScore++;
        }
    }
}
