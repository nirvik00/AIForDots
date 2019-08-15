class Game{
    constructor(gameWidth, gameHeight){
        this.gameWidth=gameWidth;
        this.gameHeight=gameHeight;
        this.humanScore=0;
        this.aiScore=0;

        // game elements
        this.paddle=new Paddle(this);
        this.ball= new Ball(this);
        this.aiPaddle=new aiPaddle(this);
        
        // handle inputs
        this.inp= new InputHandler(this);
        
        this.gameObjects=[this.paddle, this.ball, this.aiPaddle];
    }

    update(deltaTime){
        this.gameObjects.forEach(element => {
            element.update(deltaTime);
        });
        this.humanScore=this.ball.humanScore;
        this.aiScore=this.ball.aiScore;
    }

    draw(ctx){
        this.gameObjects.forEach(element=>{
            element.draw(ctx);
        });

        // give the score
        ctx.font= "small-caps " + 15 + "px dejavu sans mono";
        ctx.fillStyle="rgba(255,255,255,1.0)";
        ctx.fillText("human score: " + this.humanScore, 10, this.gameHeight-15);
        ctx.fillText("use left & right arrow to move", 475, this.gameHeight-15);        
        ctx.fillText("ai score: " + this.aiScore, 10, 15);
    }
}
