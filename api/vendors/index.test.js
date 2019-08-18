const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
// const db = require('./model');
const knex = require('../../data/dbConfig');
const genToken = require('../auth/genToken');

const tkn1 = genToken({id: 1}, 1000*60*60*2);
const tkn2 = genToken({id: 2}, 1000*60*60*2);
const tkn3 = genToken({id: 3}, 1000*60*60*2);
const tkn4 = genToken({id: 4}, 1000*60*60*2);

describe('/vendors', () => {
  beforeAll(async () => {
    // Reset vendors table before running tests
    await knex.raw("TRUNCATE TABLE vendors RESTART IDENTITY CASCADE");
  })

  describe('/ POST', () => {
    it('should return 201 status', () => {
      const vendor = {
        name: "Leigh's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      return request.post('/vendors')
       .send(vendor)
       .set({authorization: tkn1})
       .expect(201);
    })
    
    it('should return an object', () => {
      const vendor = {
        name: "Mindy's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      return request.post('/vendors')
        .send(vendor)
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ next ID', () => {
      const vendor = {
        name: "Matt's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      return request.post('/vendors')
        .send(vendor)
        .set({authorization: tkn3})
        .then(res => expect(res.body.id).toBe(3));
    })
    
    it('should return an object w/ items array', () => {
      const vendor = {
        name: "Lajawanti's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        items: ["something","something else"]
      }
      return request.post('/vendors')
        .send(vendor)
        .set({authorization: tkn4})
        .then(res => expect(getType(res.body.items)).toBe('array'));
    })
  })

  describe('/ GET', () => {
    it('should return 200 status', () => {
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
    it('should return 200 status', () => {
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
    it('should return 200 status', () => {
      const vendor = { name: "TEST 1" }
      return request.put('/vendors/1')
        .send(vendor)
        .set({authorization: tkn1})
        .expect(200);
    })
    
    it('should return an object', () => {
      const vendor = { name: "TEST 2" }
      return request.put('/vendors/2')
        .send(vendor)
        .set({authorization: tkn2})
        .then(res => {
          expect(getType(res.body)).toBe('object');
        });
    })
    
    it('should return an object with new name', () => {
      const vendor = { name: "TEST 3" }
      return request.put('/vendors/3')
        .send(vendor)
        .set({authorization: tkn3})
        .then(res => {
          expect(res.body.name).toBe("TEST 3");
        });
    })
  })

  describe('/:id DELETE', () => {
    it('should return 200 status', () => {
      return request.delete('/vendors/1')
       .set({authorization: tkn1})
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.delete('/vendors/2')
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return 404 status', () => {
      return request.delete('/vendors/1')
        .set({authorization: tkn1})
        .expect(404);
    })
  })
})
