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

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false }
}));

var requireLogin = (req,res,next)=>{
    if(!req.session.user)
    {
        res.redirect('/login');
    }
    else
    {
        next();
    }
}

app.get('/', requireLogin, (req,res,next)=>{
    res.render('home',{
        username: req.session.user.name,
        password: req.session.user.password
    })
});

var validLogins = [
    {name: 'admin', password: 'admin'},
    {name: 'user', password: 'user'}
]

app.get('/login', (req,res,next)=>{
    res.render('login');
});

app.post('/login', (req,res,next)=>{
    if(!req.body.username || !req.body.password)
    {
        res.status(400).send('Login failed');
        return;
    }

    var user = validLogins.find((user)=>{
        return user.name == req.body.username && user.password == req.body.password;
    });

    if(!user)
    {
        res.status(400).send('Login failed');
        return;
    }

    req.session.regenerate((error)=>{
        if(error)
        {
            res.status(500).send('Login failed');
            return;
        }

        req.session.user = user;
        res.redirect('/');
    });
});



app.get('/change_password', (req,res)=>{
    res.render('change_password',{
        username: req.session.user.name,
        password: req.session.user.password
    })
});


app.post('/change_password', (req,res)=>{
    const newPassword = req.body.new_password;
    req.session.user.password = newPassword;
    
    console.log('Password changed successfully');

    res.render('home',{
        username: req.session.user.name,
        password: req.session.user.password
    });
});


app.listen(8000, ()=>{
    console.log('Server started on http://localhost:8000');
});