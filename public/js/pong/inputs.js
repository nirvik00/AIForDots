class InputHandler{
    constructor(game){
        this.game=game;
        this.paddle=this.game.paddle;
        document.addEventListener("keydown", evt=>{
            switch(evt.keyCode){
                case 37:
                    this.paddle.moveLeft();
                    break;
                case 39:
                    this.paddle.moveRight();
                    break;
            }
        });
        document.addEventListener("keyup", evt=>{
            switch(evt.keyCode){
                case 37:
                    this.paddle.stop();
                    break;
                case 39:
                    this.paddle.stop();
                    break;
            }
        });
    }
}