const http = require('http');

const timeout = process.env.TM || 1000;
const interval = process.env.INT || 100;

http.createServer((req, res) => {
  if (req.url === '/') {
    console.log('=== START: TM: ' + timeout + ', INT:' + interval + ' ===');

    let enabled = true;

    setTimeout(() => {
      enabled = false;
    }, timeout);

    const timer = setInterval(() => {
      if (enabled) {
        console.log(Date());
      } else {
        clearTimeout(timer);
        console.log('=== FINISH ===');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>' + Date() + '</h1>');
      }
    }, interval);
  }
}).listen(8080);
