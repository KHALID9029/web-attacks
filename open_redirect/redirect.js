const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


// Create express app
const app = express();

// port
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views'));

const validRedirects = ['/', '/dashboard', '/profile'];


// Render the login page
app.get('/login', (req,res,next)=>{
    const redirect = req.query.redirect;
    res.render('login', { redirect });
});


// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password, redirect } = req.body;

    // Simple check for demo purposes
    if (username === 'user' && password === 'user') 
    {
        if (!validRedirects.includes(redirect))
        {
            res.send('Invalid redirect URL');
        }
        res.redirect(redirect);  // Redirect to intended or custom URL
    } 
    else 
    {
        res.send('Invalid credentials');
    }
});


// Render the dashboard page
app.get('/dashboard', (req, res) => {
    res.send('<h2>Welcome to your Dashboard</h2>');
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('http://localhost:3000/login?redirect=/dashboard');
    console.log('http://localhost:3000/login?redirect=http://localhost:5000/malicious')
});