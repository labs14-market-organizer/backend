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
    await knex.raw("TRUNCATE TABLE market_days RESTART IDENTITY CASCADE");
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

    it("should return an object w/ 'operation' array", () => {
      const market = { name: "Lajawanti's" }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn4})
        .then(res => expect(getType(res.body.operation)).toBe('array'));
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
        .then(res => expect(res.body).toHaveLength(4));
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
    
    it('should return an object w/ new name', () => {
      const market = { name: "TEST 3" }
      return request.put('/markets/3')
        .send(market)
        .set({authorization: tkn3})
        .then(res => {
          expect(res.body.name).toBe(market.name);
        });
    })
    
    it('should return an object w/ new hours of operation', () => {
      const market = {
        name: "TEST 4",
        operation: [{
          day: "sunday",
          start: "08:00:00",
          end: "17:00:00"
        }]
      }
      return request.put('/markets/4')
        .send(market)
        .set({authorization: tkn4})
        .then(res => {
          expect(res.body.operation[0]).toEqual(expect.objectContaining(market.operation[0]));
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



