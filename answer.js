'use strict';

const http = require('http');
const bcrypt = require('bcryptjs');

const server = http.createServer((req, res) => {
  const input = req.url.replace(/[^\d]/g, '');
  if (bcrypt.compareSync(input, '$2a$15$gpOy5Wibx2fe8C6WRXj3Xe9uCiweQgDYBaLus5/5KVQMIXHyC9.4W')) {
    console.log(`Correct answer submitted: ${input}`);
    return res.end('This is correct, nice job!');
  }
  res.statusCode = 400;
  res.end('Sorry, that is not correct.');
  console.log(`Incorrect answer submitted: ${input}`);
});

server.listen(3000, err => {
  if (err) throw err;
  console.log('Answer server listening on port 3000');
});
