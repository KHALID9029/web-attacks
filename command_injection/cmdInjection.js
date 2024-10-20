const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

// Create express app
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Directory for views
app.set('views', path.join(__dirname, 'views')); 

// Get the OS type
const platform = os.platform(); 


app.get('/', (req,res,next)=>{
    res.render('ping');
});


app.post('/ping', (req,res,next)=>{
    
    const ip = req.body.ip;

    let pingCommand;

    //const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // if (!ipRegex.test(ip)) 
    // {
    //     return res.status(400).send('Invalid IP address');
    // }


    if(platform === 'win32')
    {
        pingCommand = `ping /n 3 ${ip}`;
    }
    else
    {
        pingCommand = `ping -c 3 ${ip}`;
    }

    exec(pingCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send(`Error: ${error.message}`);
            return;
        }
        res.send(stdout);
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});