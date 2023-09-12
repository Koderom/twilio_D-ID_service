const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const {DID} = require('./controllers/DID');
const http = require('http');
const cors = require("cors");
const WebSocketServer = require("websocket").server;

const app = express();
const server = http.createServer(app);
const SERVER_PORT = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


let connection;
wsServer.on("request", (request) => {
    connection = request.accept(null, request.origin);
    connection.send( JSON.stringify({
        type: "connected"
    }));
    console.log("conectado");
});

app.get('/', (req, res) => {
    console.log("test");
    res.status(200).send('OK');
  });
app.post('/test', DID.test);
app.post('/did/create-video',(req, res, next) => {
    req.socketChat = connection;
    next();
},DID.createVideo);

server.listen(SERVER_PORT, () => {
    console.log(`servidor corriendo en el puerto ${SERVER_PORT}`);
});

