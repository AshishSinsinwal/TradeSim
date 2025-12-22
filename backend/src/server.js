const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets/socket.auth');
const connectMongo = require('./config/mongo');

 
async function start() {
    await connectMongo();

    const server = http.createServer(app);
    initSocket(server);
    server.listen(5000 , ()=> {
        console.log('server is runing on port 5000');
    })
}

start();