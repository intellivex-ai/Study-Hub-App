import http from 'http';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            console.log('\n--- BROWSER LOG ---');
            try {
                const data = JSON.parse(body);
                console.log(data.type.toUpperCase() + ':', data.message);
            } catch (e) {
                console.log(body);
            }
            res.end('ok');
        });
    } else {
        res.end('ok');
    }
});

server.listen(9999, () => {
    console.log('Log server listening on port 9999');
});
