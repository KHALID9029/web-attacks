const express = require('express');
const path = require('path');

// Create express app
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views')); 

const port = 5000;

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});