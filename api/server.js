const express = require('express');
const helmet = require('helmet');
const {originCORS, verifyJWT} = require('./middleware');

const server = express();

server.use(helmet());
server.use(express.json());
server.use("/auth", verifyJWT, require('./auth'));

server.use(originCORS());
server.use("/user", verifyJWT, require('./users'));
server.use("/vendors", verifyJWT, require('./vendors'));
server.use("/markets", verifyJWT, require('./markets'));

//Server Test Message
server.get('/', (req, res) => {
    res.status(200).send({ message: 'Hello from Cloud Stands.'})
});

module.exports = server; 