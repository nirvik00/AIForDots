const express = require('express');
const exphbs=require('express-handlebars');

const app = express();


process.env.PWD=process.cwd();
app.use('/public', express.static(process.env.PWD+'/public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', (req, res)=>{
    const name="havoc ai page";
    res.render('index', {name: name});
})

app.get('/about', (req, res)=>{
    res.render('about');
});

app.get('/games/Tictactoe', (req, res)=>{
    res.render('games/Tictactoe');
});

app.get('/games/pong', (req,res) => {
    res.render('games/pong');
});

app.get('/games/asteroids', (req, res)=>{
    res.render('games/asteroids');
});

app.get('/games/asteroidsAI', (req, res)=>{
    res.render('games/asteroidsAI');
});

const port=process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`server started on port ${port}`);
});