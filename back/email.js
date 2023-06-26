const http = require('http');
const fs = require('fs');
const { exec } = require("child_process");
const querystring = require('querystring');
const { log } = require('console');


const server = http.createServer((req, res) => {
  if (req.url === '/api/data' && req.method === 'POST') { // Handle API request
    // console.log(req)
    let data1 = '';
    req.on('data', chunk => {
      data1 += chunk.toString();
    });
    req.on('end', () => {
      const params = querystring.parse(data1);
      const title = params.title;
      const body = params.body;
      console.log(title); // log the title to the console
      console.log(body); // log the body to the console
      sendmail(title, body)
    });
    req.on('end', () => {
        // console.log(`Received data: ${params.title, params.body}`);
      


        res.writeHead(200, { 'content-type': 'application/json' });
        const data = { message: 'API successfully sent email!' };

        res.end(JSON.stringify(data));
    });
  } else { // Serve HTML file for regular HTTP request
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream('../front/index.html').pipe(res);
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


function sendmail(title, body){
exec(`echo ${body} | sendmail ${title}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error executing command: ${err}`);
          return;
        }
      
        console.log(`email sent!`);
      });
    }
