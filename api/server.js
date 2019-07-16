const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require("passport");

const server = express();

const userRouter = require('./users/user-router')
const authRouter = require('./auth');

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(passport.initialize());

server.use("/auth", authRouter);
server.use("/userlist", userRouter)

//Server Test Message
server.get('/', (req, res) => {
    res.status(200).send({ message: 'Hello from CloudStands.'})
});

module.exports = server; 