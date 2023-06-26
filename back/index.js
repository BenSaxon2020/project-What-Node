const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const querystring = require('querystring');
const session = require('express-session');
const path = require('path')


const app = express();
const port = 3000;

app.use(
  session({
    secret: 'hy87CSbAyEeWmJNLI2XEVpHrNPWU7snQ',
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.urlencoded({ extended: true }));


// Route to serve the CSS file
app.use(express.static(path.join(__dirname, '../front')));

app.get('/', (req, res) => {
  
  const filePath = '../front/login.html';
  loadPage(filePath, req, res);
});

app.get('/email', (req, res) => {
  if (req.session.username) {
    const filePath = '../front/email.html';
    loadPage(filePath, req, res);
  } else {
    res.redirect('/');
  }  
});

app.post('/email', requireLogin,(req, res) => {
  const cookieValue = req.headers.cookie;
  console.log(cookieValue);
  if (!req.session.username) {
    res.redirect('/login');
  }
  console.log("here")
  title = req.body["title"]
  body = req.body["body"]
  console.log(title);
  console.log(body);
  sendMail(title, body);
  const filePath = '../front/api/data.html';
  loadPage(filePath, req, res);
  
});

app.post('/login', (req, res) => {
          console.log(req.body["Uname"])
          uname = req.body["Uname"]
          pword = req.body["Pword"]
          login(uname, pword)
            .then((x) => {
              console.log(x);
      
              if (x >= 1) {
                req.session.username = uname;
                console.log('Login complete');
                res.redirect('/secure')
              } else {
                console.log('Login failed');
              }
            })
            .catch((error) => {
              console.error('Error during login:', error);
            });
        });
  
app.get('/logout', (req, res)=>{
  delete req.session.username;
  res.redirect('/');
})
app.get('/secure', requireLogin, (req, res) => {
  const filePath = '../front/dashboard.html';
    loadPage(filePath, req, res);
});

app.get('/chat', requireLogin, (req, res) => {
  const filePath = '../front/chat.html';
    loadPage(filePath, req, res);
});

//chat functions

app.post('/msg', requireLogin, (req, res) => {
  
  console.log(req.body["text"])
  res.end(req.body["text"]);

  //next step implement websockets and append message sent to webpage without refreshing the page
})





function loadPage(filePath, req, res) {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(filePath).pipe(res);
    console.log('Page loaded:', filePath);
  });
}

function sendMail(title, body) {
  exec(`echo ${body} | sendmail ${title}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing command: ${err}`);
      return;
    } else {
      console.log(`Email sent!`);
    }
  });
}

function login(uname, pword) {
    return new Promise((resolve, reject) => {
      const mysql = require('mysql');
  
      const connection = mysql.createConnection({
        host: 'localhost',
        user: 'code',
        password: 'password',
        database: 'users'
      });
  
      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err);
          reject(err);
          return;
        }
  
        console.log('Connected to the database');
      });
  
      const query = `SELECT count(*) as count FROM user_creds WHERE Uname = ? AND Pword = ?`;
      const values = [uname, pword];
  
      connection.query(query, values, (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
          return;
        }
  
        console.log('Query results:', results);
  
        if (results) {
          const count = results[0].count;
          console.log(count);
          resolve(count);
        }
      });
  
      connection.end((err) => {
        if (err) {
          console.error('Error closing the database connection:', err);
          return;
        }
  
        console.log('Database connection closed');
      });
    });
  }
  
function requireLogin(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/');
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

