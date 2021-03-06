const server = require('../server');
const request = require('supertest')(server);
const knex = require('../../db/config');
const getType = require('jest-get-type');
const db = require('./model');
const genToken = require('../genToken');

const tkn1 = genToken({id: 1}).token;

describe('/user', () => {
  beforeAll(async () => await knex.seed.run());

  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request.get('/user')
        .set({authorization: tkn1})
        .expect(200);
    })

    it('should return an array', () => {
      return request.get('/user')
        .set({authorization: tkn1})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
  })

  describe('/:id GET', () => {
    it('should return 200 status', () => {
      return request.get('/user/1')
        .expect(200);
    })
    
    it('should return an object', () => {
      return request.get('/user/1')
        .then(res => expect(getType(res.body)).toBe('object'));
    })
  })
})
