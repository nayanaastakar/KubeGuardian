const http = require('http');

const endpoints = [
  { path: '/health', method: 'GET' },
  { path: '/api/clusters/live', method: 'GET' },
  { path: '/api/clusters', method: 'GET' },
  { path: '/api/ai/chat', method: 'POST', body: { message: 'test' } },
  { path: '/api/auth/login', method: 'POST', body: { email: 'admin@test.com', password: 'password' } },
  { path: '/api/scans', method: 'GET' },
  { path: '/api/alerts', method: 'GET' }
];

async function testApi() {
  console.log("Starting API Tests...\n");
  for (const ep of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: ep.path,
        method: ep.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`[${ep.method}] ${ep.path} -> Status: ${res.statusCode}`);
          if (res.statusCode >= 400) console.log(`Error: ${data.substring(0, 100)}`);
          resolve();
        });
      });
      
      req.on('error', (e) => {
        console.log(`[${ep.method}] ${ep.path} -> FAILED (${e.message})`);
        resolve();
      });

      if (ep.body) req.write(JSON.stringify(ep.body));
      req.end();
    });
  }
}

testApi();
