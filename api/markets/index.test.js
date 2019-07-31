const server = require('../server');
const request = require('supertest')(server);
const getType = require('jest-get-type');
// const db = require('./index');
const knex = require('../../data/dbConfig');
const genToken = require('../auth/genToken');

const tkn1 = genToken({id: 1}, 1000*60*60*2);
const tkn2 = genToken({id: 2}, 1000*60*60*2);
const tkn3 = genToken({id: 3}, 1000*60*60*2);
const tkn4 = genToken({id: 4}, 1000*60*60*2);

describe('/markets', () => {
  beforeAll(async () => {
    // Reset markets table before running tests
    await knex.raw("TRUNCATE TABLE markets RESTART IDENTITY CASCADE");
  })

  describe('/ POST', () => {
    it('should return 201 status', () => {
      const market = {
        name: "Leigh's",
        city: "Forest Park",
        state: "GA",
        zipcode: "30298"
      }
      return request.post('/markets')
       .send(market)
       .set({authorization: tkn1})
       .expect(201);
    })
    
    it('should return an object', () => {
      const market = {
        name: "Mindy's",
        city: "Atlanta",
        state: "GA",
        zipcode: "30301"
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ next ID', () => {
      const market = {
        name: "Matt's",
        city: "Atlanta",
        state: "GA",
        zipcode: "30302"
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn3})
        .then(res => expect(res.body.name).toBe("Matt's"));
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

  describe('/search GET', () => {
    it('should return 200 status', () => {
      return request.get('/markets/search?q=30298')
        .expect(200);
    })

    it('should return w/ proper length when searching by zipcode', () => {
      return request.get('/markets/search?q=30298')
        .then(res => expect((res.body)).toHaveLength(1));
    })
    
    it('should return w/ proper length when searching by city', () => {
      return request.get('/markets/search?q=Atlanta')
        .then(res => expect(res.body).toHaveLength(2));
    })
    
    it('should return w/ proper length when searching by state', () => {
      return request.get('/markets/search?q=GA')
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
      const market = { name: "TEST 1" }
      return request.put('/markets/1')
       .send(market)
       .set({authorization: tkn1})
       .expect(200);
    })
    
    it('should return an object', () => {
      const market = { name: "TEST 2" }
      return request.put('/markets/2')
        .send(market)
        .set({authorization: tkn2})
        .then(res => {
          expect(getType(res.body)).toBe('object');
        });
    })
    
    it('should return an object', () => {
      const market = { name: "TEST 3" }
      return request.put('/markets/3')
        .send(market)
        .set({authorization: tkn3})
        .then(res => {
          expect(res.body.admin_id).toBe(3);
        });
    })
  })

  describe('/:id DELETE', () => {
    it('should return 200 status', () => {
      return request.delete('/markets/1')
       .set({authorization: tkn1})
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.delete('/markets/2')
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return 404 status after deleting', () => {
      return request.delete('/markets/1')
        .set({authorization: tkn1})
        .expect(404);
    })
  })
})



