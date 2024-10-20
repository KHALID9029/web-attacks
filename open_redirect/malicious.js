const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


// Create express app
const app = express();

// port
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/malicious', (req,res,next)=>{
    res.render('malicious');
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('http://localhost:5000/malicious');
});