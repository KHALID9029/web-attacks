const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// Create express app
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req,res,next)=>{
    res.render('csrf_attack');
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});