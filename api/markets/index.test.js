const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
const db = require('./index');

describe('/markets', () => {
  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request.get('/')
        .expect(200);
    })

    it('should return an array', () => {
      return request.get('/')
        .then(res => expect(getType(res.body)).toBe('array'));
    })
  })

  describe('/:id GET', () => {
    it('should return 200 status', () => {
      return request.get('/markets/1')
        .expect(200);
    })
    
  })
})
