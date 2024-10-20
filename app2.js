

// Import required modules
// module for parsing POST requests
const bodyParser = require('body-parser');
// module for creating web applications Express 
const express = require('express');
// module for making HTTP requests
const axios = require('axios');
// module for reading files
const fs = require('fs');
// module for handling paths
const path = require('path');
// module for creating TCP servers and clients / port scanning
const net = require('net'); 
// module for executing shell commands
const { exec } = require('child_process');
// Create an Express application
const app = express();
// port
const port = 3005;
// Use bodyParser to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Set the view engine to EJS
app.use(express.static('public'));
app.set('view engine', 'ejs');


// List of common ports to scan
const commonPorts = [21, 22, 25, 53, 80, 110, 143, 443, 3306, 5432];

// Middleware to log the IP address
app.use((req, res, next) => {
    // Get the IP address
   // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Log the IP address to the console
    console.log(`Client IP: ${port}`);

    // Call the next middleware or route handler
    next();
});
/*****************************************************************************/
//                         GET requests pages /forms
/*****************************************************************************/
// Render to the dos page
app.get('/dos', (req, res) => { res.render('dos'); });
// Render to path_traversal page
app.get('/path_traversal', (req, res) => { res.render('path_traversal', { fileContent: null, port: port });});
// Render to port_scanning page
app.get('/port_scanning', (req, res) => { res.render('port_scanning', { openPorts: null }); });
// Render to command_line page
app.get('/command_line', (req, res) => { res.render('command_line', { output: null });});

/*****************************************************************************/
//                         Get requests via URL
/*****************************************************************************/

// Handles DoS attack dynamically via URL parameter (GET request)
// Decodes the URL-encoded string
app.get('/dos/:encodedTargetUrl', (req, res) => {
    const encodedTargetUrl = req.params.encodedTargetUrl;
    const targetUrl = decodeURIComponent(encodedTargetUrl); 
    startDoS(targetUrl, res);
});


// Handles path traversal attack dynamically via URL parameter (GET request)
app.get('/path_traversal/access_file', (req, res) => 
{
    const filePath = req.query.filePath; 
    accessFile(filePath, (err, data) => 
    {
        if (err) 
        {
            return res.status(400).send(`Error: ${err.message}`);
        }
        res.send(`<h1>File Content:</h1><pre>${data}</pre>`);
    });
});

// Handles port scanning dynamically via URL parameter (GET request)
app.get('/port_scanning/:targetIp', (req, res) => 
{
    const { targetIp } = req.params;
    scanPorts(targetIp, (error, openPorts) => {
        if (error) 
        {
            return res.status(400).send(`Error: ${error}`);
        }
        res.send(`<h1>Open ports on ${targetIp}:</h1><pre>${openPorts.join(', ')}</pre>`);
    });
});

// Handles command execution dynamically via URL parameter (GET request)
app.get('/command_line/:command', (req, res) => 
{
    const { command } = req.params;
    executeCommand(command, (error, output) => 
    {
        if (error) 
        {
            return res.status(500).send(`Error: ${error}`);
        }

        res.send(`<h1>Command Output:</h1><pre>${output}</pre>`);
    });
});

app.get('/execute/:ip/:command', (req, res) => {
    const { ip, command } = req.params;

    console.log(`Executing command for IP: ${ip}`);

    executeCommand(command, (error, output) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.send(`<h1>Command Output for IP ${ip}:</h1><pre>${output}</pre>`);
    });
});




/*****************************************************************************/
//                         POST requests via form submission
/*****************************************************************************/

// Handles DoS attack manually via form submission (POST request)
app.post('/dos', (req, res) => 
{
    const { targetUrl } = req.body;
    startDoS(targetUrl, res);
});

// Handles path traversal attack manually via form submission (POST request)
app.post('/access_file', (req, res) => 
{
    const { filePath } = req.body;
    accessFile(filePath, (err, data) => 
    {
        if (err) 
        {
            return res.render('path_traversal', { fileContent: `Error: ${err.message}` });
        }
        res.render('path_traversal', { fileContent: data });
    });
});

// Handles port scanning manually via form submission (POST request)
app.post('/port_scan', (req, res) => 
{
    const targetIpOrDomain = req.body.targetIp;
    scanPorts(targetIpOrDomain, (error, openPorts) => 
    {
        if (error) 
        {
            return res.render('port_scanning', { openPorts: `Error: ${error}` });
        }
        res.render('port_scanning', { openPorts: openPorts.join(', ') });
    });
});

// Handles command execution manually via form submission (POST request)
app.post('/execute_command', (req, res) => 
{
    const { command } = req.body;
    executeCommand(command, (error, output) => 
    {
        if (error) 
        {
            return res.render('command_line', { output: error });
        }

        res.render('command_line', { output: output });
    });
});




/*****************************************************************************/
//                         Helper functions
/*****************************************************************************/

// Function to start the DoS simulation
function startDoS(targetUrl, res) 
{
    let requestCount = 0;

    if (!targetUrl) 
    {
        return res.status(400).send('Target URL is required.');
    }

    res.send(`<h1>DoS simulation started on ${targetUrl}!</h1><p>Check the console for request logs.</p>`);

    const intervalId = setInterval(async () => 
    {
        try 
        {
            requestCount++;
            console.log(`Sending request ${requestCount} to ${targetUrl}`);
            await axios.get(targetUrl);
        } catch (error) 
        {
            console.error(`Error during request ${requestCount}:`, error.message);
        }

        if (requestCount >= 10) 
        {
            clearInterval(intervalId);
            console.log(`DoS simulation complete. Sent 10 requests to ${targetUrl}.`);
        }
    }, 200); 
}

// function to access file content 
// Sanitizes the file path to prevent path traversal attacks
function accessFile(filePath, callback) 
{
    if (!filePath) 
    {
        return callback(new Error('File path is required.'));
    }
    // Sanitize the file path to prevent path traversal attacks
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$)|\/|\\)/, '');
    const safeBaseDir = '/';  
    const fullPath = path.join(safeBaseDir, sanitizedPath);
    if (!fullPath.startsWith(safeBaseDir)) 
    {
        return callback(new Error('Access to this path is not allowed.'));
    }

    fs.readFile(fullPath, 'utf8', (err, data) => 
    {
        if (err) 
        {
            return callback(err);
        }
        callback(null, data);
    });
}


// Function to scan open ports on a target IP address or domain
function scanPorts(target, callback) 
{
    const openPorts = [];
    const portScanPromises = [];
    const validIpOrDomain = /^[a-zA-Z0-9.-]+$/.test(target);

    if (!validIpOrDomain) 
    {
        return callback('Invalid IP address or domain format.', null);
    }

    commonPorts.forEach((port) => 
    {
        portScanPromises.push(new Promise((resolve) => 
        {
            const socket = new net.Socket();
            socket.setTimeout(200);
            socket.on('connect', () => 
            {
                openPorts.push(port);
                socket.destroy();
                resolve();
            });

            socket.on('error', () => 
            {
                socket.destroy();
                resolve();
            });

            socket.connect(port, target);
        }));
    });

    Promise.all(portScanPromises)
        .then(() => 
        {
            if (openPorts.length === 0) openPorts.push('No open ports found');
            callback(null, openPorts); 
        })
        .catch((error) => 
        {
            callback(error, null);
        });
}

// function to execute the command and return output
function executeCommand(command, callback) 
{
    exec(command, (error, stdout, stderr) => 
    {
        if (error) 
        {
            console.error(`Error executing command: ${error.message}`);
            return callback(`Error: ${error.message}`, null);
        }
        if (stderr) 
        {
            console.error(`Command stderr: ${stderr}`);
            return callback(`stderr: ${stderr}`, null);
        }

        callback(null, stdout || 'No output');
    });
}

/******************************************************************* */
// Start the server 
app.listen(port, () => {
    console.log(`App2.js running on http://localhost:${port}`);
});