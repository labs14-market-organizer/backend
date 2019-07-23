const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require("passport");

const server = express();

const userRouter = require('./users')
const authRouter = require('./auth');

const marketsRouter = require('./markets/index');

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(passport.initialize());

server.use("/auth", authRouter);
server.use("/userlist", userRouter);

server.use("/markets", marketsRouter);

//Server Test Message
server.get('/', (req, res) => {
    res.status(200).send({ message: 'Hello from CloudStands.'})
});

module.exports = server; 