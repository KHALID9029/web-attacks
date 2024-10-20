const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const csrf = require('csurf');

// Create express app
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views')); 

//Setup CSRF protection middleware
const csrfProtection = csrf({ cookie: false });

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



app.get('/change_password', csrfProtection, (req,res)=>{
    res.render('safe_cng',{
        username: req.session.user.name,
        password: req.session.user.password,
        csrfToken: req.csrfToken()
    })
});


app.post('/change_password', csrfProtection, (req,res)=>{
    const newPassword = req.body.new_password;
    req.session.user.password = newPassword;
    
    console.log('Password changed successfully');

    res.render('home',{
        username: req.session.user.name,
        password: req.session.user.password
    });
});


app.listen(8000, ()=>{
    console.log('CSRF protected site running on http://localhost:8000');
});