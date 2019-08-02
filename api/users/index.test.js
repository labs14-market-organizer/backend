const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
const db = require('./model');
const genToken = require('../auth/genToken');

const tkn1 = genToken({id: 1}, 1000*60*60*2);

describe('/user', () => {
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
