const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs');

let comments = [];

// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Comments page
app.get('/comments', (req, res) => {
    res.render('comments', { comments: comments });
});

app.post('/comment', (req, res) => {
    const { comment } = req.body;
    comments.push(comment);
    res.redirect('/comments');
});

// Start server
app.listen(3000, () => {
    console.log('App listening on port 3000');
});
