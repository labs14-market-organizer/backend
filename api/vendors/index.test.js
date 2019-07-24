const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
// const db = require('./model');
const knex = require('../../data/dbConfig');

describe('/vendors', () => {
  beforeAll(async () => {
    // Reset vendors table before running tests
    await knex.raw("TRUNCATE TABLE vendors RESTART IDENTITY CASCADE");
  })

  describe('/ POST', () => {
    it('should return 201 status', () => {
      const vendor = { admin_id: 1 }
      return request.post('/vendors')
       .send(vendor)
       .expect(201);
    })
    
    it('should return an object', () => {
      const vendor = { admin_id: 2 }
      return request.post('/vendors')
        .send(vendor)
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ next ID', () => {
      const vendor = { admin_id: 3 }
      return request.post('/vendors')
        .send(vendor)
        .then(res => expect(res.body.id).toBe(3));
    })
    
    it('should return an object w/ items array', () => {
      const vendor = {
        "admin_id": 4,
        "items": ["something","something else"]
      }
      return request.post('/vendors')
        .send(vendor)
        .then(res => expect(getType(res.body.items)).toBe('array'));
    })
  })

  describe('/ GET', () => {
    it('should return 200 status', async () => {
      return request.get('/vendors')
       .expect(200);
    })
    
    it('should return an array', () => {
      return request.get('/vendors')
        .then(res => expect(getType(res.body)).toBe('array'));
    })
    
    it('should return an array w/ next ID', () => {
      return request.get('/vendors')
        .then(res => expect(res.body).toHaveLength(4));
    })
  })

  describe('/:id GET', () => {
    it('should return 200 status', async () => {
      return request.get('/vendors/1')
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.get('/vendors/2')
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ proper ID', () => {
      return request.get('/vendors/3')
        .then(res => expect(res.body.id).toBe(3));
    })
  })

  describe('/:id PUT', () => {
    it('should return 200 status', async () => {
      const vendor = { admin_id: 4 }
      return request.put('/vendors/1')
       .send(vendor)
       .expect(200);
    })
    
    it('should return an object', () => {
      const vendor = { admin_id: 5 }
      return request.put('/vendors/2')
        .send(vendor)
        .then(res => {
          expect(getType(res.body)).toBe('object');
        });
    })
    
    it('should return an object', () => {
      const vendor = { admin_id: 6 }
      return request.put('/vendors/3')
        .send(vendor)
        .then(res => {
          expect(res.body.admin_id).toBe(6);
        });
    })
  })

  describe('/:id DELETE', () => {
    it('should return 200 status', async () => {
      return request.delete('/vendors/1')
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.delete('/vendors/2')
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return 404 status', () => {
      return request.get('/vendors/1')
        .expect(404);
    })
  })
})
