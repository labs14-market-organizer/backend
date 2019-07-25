const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
const db = require('./index');
const knex = require('../../data/dbConfig');

describe('/markets', () => {
  beforeAll(async () => {
    // Reset markets table before running tests
    await knex.raw("TRUNCATE TABLE markets RESTART IDENTITY CASCADE");
  })

  describe('/ POST', () => {
    it('should return 201 status', () => {
      const market = { admin_id: 1 }
      return request.post('/markets')
       .send(market)
       .expect(201);
    })
    
    it('should return an object', () => {
      const market = { admin_id: 2 }
      return request.post('/markets')
        .send(market)
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ next ID', () => {
      const market = { admin_id: 3 }
      return request.post('/markets')
        .send(market)
        .then(res => expect(res.body.id).toBe(3));
    })
  })

  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request.get('/markets')
        .expect(200);
    })

    it('should return an array', () => {
      return request.get('/markets')
        .then(res => expect(getType(res.body)).toBe('array'));
    })
    
    it('should return an array w/ proper length', () => {
      return request.get('/markets')
        .then(res => expect(res.body).toHaveLength(3));
    })
  })

  describe('/:id GET', () => {
    it('should return 200 status', () => {
      return request.get('/markets/1')
        .expect(200);
    })
    
    it('should return an object', () => {
      return request.get('/markets/2')
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ proper ID', () => {
      return request.get('/markets/3')
        .then(res => expect(res.body.id).toBe(3));
    })
  })

  describe('/:id PUT', () => {
    it('should return 200 status', () => {
      const market = { admin_id: 4 }
      return request.put('/markets/1')
       .send(market)
       .expect(200);
    })
    
    it('should return an object', () => {
      const market = { admin_id: 5 }
      return request.put('/markets/2')
        .send(market)
        .then(res => {
          expect(getType(res.body)).toBe('object');
        });
    })
    
    it('should return an object', () => {
      const market = { admin_id: 6 }
      return request.put('/markets/3')
        .send(market)
        .then(res => {
          expect(res.body.admin_id).toBe(6);
        });
    })
  })

  describe('/:id DELETE', () => {
    it('should return 200 status', () => {
      return request.delete('/markets/1')
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.delete('/markets/2')
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return 404 status after deleting', () => {
      return request.delete('/markets/1')
        .expect(404);
    })
  })
})



