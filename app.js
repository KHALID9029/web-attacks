const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios'); 
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs');

let comments = [];

// Middleware to log the IP address
app.use((req, res, next) => {
    // Get the IP address
   // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Log the IP address to the console
    console.log(`Client IP: ${port}`);

    // Call the next middleware or route handler
    next();
});


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




// SSRF Vulnerable
app.get('/ssrf', (req,res) => {res.render('ssrf');});

app.post('/fetch', async (req,res) => 
{
    const { url } = req.body;
    try
    {
      const con = await axios.get(url);
      res.send(`${con.data}`);

    }
    catch (ex)
    {
        res.status(500).send('Error fetching the url');
    }
});

// Start server
// Start the server 
app.listen(port, () => {
    console.log(`App.js running on http://localhost:${port}`);
});

