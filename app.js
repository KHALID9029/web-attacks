const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name (insecure)
    }
});

const upload = multer({ storage: storage });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
app.post('/comment', upload.single('file'), (req, res) => {
    const { comment } = req.body;

    if (req.file) {
        comments.push(`${comment} (File uploaded: <a href="/uploads/${req.file.filename}">${req.file.filename}</a>)`);
    } else {
        comments.push(comment); 
    }

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

// File Upload page
app.get('/upload', (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Forbidden: You need to be logged in to access this page.');
    }
    res.render('upload'); 
});

// Vulnerable file upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.send(`File uploaded: <a href="/uploads/${req.file.filename}">${req.file.filename}</a>`);
    } else {
        res.send('File upload failed.');
    }
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});
