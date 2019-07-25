const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require("passport");
const {verifyJWT} = require('./middleware');

const server = express();

const userRouter = require('./users')
const authRouter = require('./auth');

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(passport.initialize());

server.use("/auth", verifyJWT(false), authRouter);
server.use("/userlist", verifyJWT(false), userRouter)

//Server Test Message
server.get('/', (req, res) => {
    res.status(200).send({ message: 'Hello from CloudStands.'})
});

module.exports = server; 