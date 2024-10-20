const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

const users = [
    { username: 'user', password: 'cipiripi', role: 'user' },
    { username: 'admin', password: 'adminpass', role: 'admin' }
];

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Comments page (for XSS demo)
let comments = [];
app.get('/comments', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Forbidden: You need to be logged in to access this page.');
    }
    res.render('comments', { comments: comments });
});

// Add a comment (XSS vulnerability demo)
app.post('/comment', (req, res) => {
    const { comment } = req.body;
    comments.push(comment); // Comments are not sanitized (XSS vulnerability)
    res.redirect('/comments');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        req.session.user = { username: user.username, role: user.role }; 
        res.redirect('/');
    } else {
        res.send('Invalid credentials. <a href="/login">Try again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/');
    });
});

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        res.status(403).send('Forbidden: You are not authorized to access this page.');
    }
}

// Admin page (for Broken Authorization demo)
app.get('/admin', /* isAdmin,*/ (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Forbidden: You need to be logged in to access this page.');
    }

    res.render('admin');
});

// Password change page (only for logged-in users)
app.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Forbidden: You need to be logged in.');
    }
    res.render('change-password');
});

app.post('/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = users.find(u => u.username === req.session.user.username);

    if (user.password === oldPassword) {
        user.password = newPassword;  // Update password
        res.send('Password successfully changed.');
    } else {
        res.send('Incorrect current password.');
    }
});

app.get('/attacker', (req, res) => {
    res.render('attacker');
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
