const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
const db = require('./model');

describe('/userlist', () => {
  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request.get('/userlist')
        .expect(200);
    })

    it('should return an array', () => {
      return request.get('/userlist')
        .then(res => expect(getType(res.body)).toBe('array'));
    })
  })

  describe('/:id GET', () => {
    it('should return 200 status', () => {
      return request.get('/userlist/1')
        .expect(200);
    })
    
    // it('should return an object', () => {
    //   return request.get('/userlist/1')
    //     .then(res => expect(res).toBe('object'));
    // })
  })
})
