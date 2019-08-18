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
const tkn5 = genToken({id: 5}, 1000*60*60*2);

describe('/markets', () => {
  beforeAll(async () => {
    // Reset markets table before running tests
    await knex.raw("TRUNCATE TABLE market_reserve RESTART IDENTITY CASCADE");
    await knex.raw("TRUNCATE TABLE market_vendors RESTART IDENTITY CASCADE");
    await knex.raw("TRUNCATE TABLE market_days RESTART IDENTITY CASCADE");
    await knex.raw("TRUNCATE TABLE market_booths RESTART IDENTITY CASCADE");
    await knex.raw("TRUNCATE TABLE markets RESTART IDENTITY CASCADE");
  })

  describe('/ POST', () => {
    it('should return 201 status', () => {
      const market = {
        name: "Leigh's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        city: "Forest Park",
        state: "GA",
        zipcode: "30298",
        operation: [{
          "day": "friday",
          "start": "08:00",
          "end": "17:00"
        }]
      }
      return request.post('/markets')
       .send(market)
       .set({authorization: tkn1})
       .expect(201);
    })
    
    it('should return an object', () => {
      const market = {
        name: "Mindy's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        city: "Atlanta",
        state: "GA",
        zipcode: "30301",
        operation: [{
          "day": "friday",
          "start": "08:00",
          "end": "17:00"
        }]
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return an object w/ next ID', () => {
      const market = {
        name: "Matt's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        city: "Atlanta",
        state: "GA",
        zipcode: "30302",
        operation: [{
          "day": "friday",
          "start": "08:00",
          "end": "17:00"
        }]
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn3})
        .then(res => expect(res.body.name).toBe("Matt's"));
    })

    it("should return an object w/ 'operation' array", () => {
      const market = {
        name: "Lajawanti's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        operation: [{
          "day": "friday",
          "start": "08:00",
          "end": "17:00"
        }]
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn4})
        .then(res => expect(getType(res.body.operation)).toBe('array'));
    })

    it("should return an object w/ 'booths' array", () => {
      const market = {
        name: "Kayla's",
        email: "someone@somewhere.com",
        phone: "555-555-5555",
        operation: [{
          "day": "friday",
          "start": "08:00",
          "end": "17:00"
        }]
      }
      return request.post('/markets')
        .send(market)
        .set({authorization: tkn5})
        .then(res => expect(getType(res.body.booths)).toBe('array'));
    })
  })
  
  describe('/:id/request POST', () => {
    it('should return 201 status', async () => {
      const vendor = {
        name: "Leigh's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      await request.post('/vendors')
       .send(vendor)
       .set({authorization: tkn1});
      return request.post('/markets/3/request')
        .set({authorization: tkn1})
        .expect(201);
    })

    it('should return an object', async () => {
      const vendor = {
        name: "Mindy's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      await request.post('/vendors')
       .send(vendor)
       .set({authorization: tkn2});
      return request.post('/markets/3/request')
        .set({authorization: tkn2})
        .then(res => expect(getType(res.body)).toBe('object'));
    })

    it('should return an object w/ next ID', async () => {
      const vendor = {
        name: "Matt's",
        email: "someone@somewhere.com",
        phone: "555-555-5555"
      }
      await request.post('/vendors')
       .send(vendor)
       .set({authorization: tkn3});
      return request.post('/markets/3/request')
        .set({authorization: tkn3})
        .then(res => expect(res.body.id).toBe(3));
    })
  })
  
  describe('/:id/booths POST', () => {
    it('should return 201 status', () => {
      const booth = { name: "Booth One", number: 42 }
      return request.post('/markets/3/booths')
       .set({authorization: tkn3})
       .send(booth)
       .expect(201);
    })
    
    it("should return an object w/ 'booths' array", () => {
      const booth = { name: "Booth Two", number: 42 }
      return request.post('/markets/3/booths')
        .set({authorization: tkn3})
        .send(booth)
        .then(res => expect(getType(res.body.booths)).toBe('array'));
    })
    
    it('should return booth w/ passed number', () => {
      const booth = { name: "Booth Three", number: 4242 }
      return request.post('/markets/3/booths')
        .set({authorization: tkn3})
        .send(booth)
        .then(res => expect(res.body.booths[2].number).toBe(booth.number));
    })
  })

  describe('markets/:id/booths/:bID/reserve/ POST', () => {
    it('should return 201 status', () => {
      const reserve = {reserve_date: "9999-12-31"};
      return request.post('/markets/3/booths/3/reserve/')
        .set({authorization: tkn3})
        .send(reserve)
        .expect(201);
    })

    it('should return an array', () => {
      const reserve = {reserve_date: "9999-12-31"};
      return request.post('/markets/3/booths/3/reserve/')
        .set({authorization: tkn3})
        .send(reserve)
        .then(res => expect(getType(res.body)).toBe('array'));
    })
    
    it('should return an object with passed date', () => {
      const reserve = {reserve_date: "9999-12-31"};
      return request.post('/markets/3/booths/3/reserve/')
        .set({authorization: tkn3})
        .send(reserve)
        .then(res => {
          const booth = res.body.find(booth => booth.id === 3);
          expect(booth.number > Number(booth.available)).toBe(true)
        });
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
        .then(res => expect(res.body).toHaveLength(5));
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

  
  describe('/:id/request/:rID PUT', () => {
    it('should return 200 status', () => {
      const joinMkt = {status: 0};
      return request.put('/markets/1/request/1')
        .set({authorization: tkn1})
        .send(joinMkt)
        .expect(200);
    })

    it('should return an object', () => {
      const joinMkt = {status: 0};
      return request.put('/markets/1/request/2')
        .set({authorization: tkn1})
        .send(joinMkt)
        .then(res => expect(getType(res.body)).toBe('object'));
    })

    it('should return an object w/ new status', () => {
      const joinMkt = {status: 0};
      return request.put('/markets/1/request/3')
        .set({authorization: tkn1})
        .send(joinMkt)
        .then(res => expect(res.body.status).toBe(joinMkt.status));
    })
  })

  describe('/:id/booths/:bID PUT', () => {
    it('should return 200 status', () => {
      const booth = { name: 'TEST 1' }
      return request.put('/markets/3/booths/1')
       .send(booth)
       .set({authorization: tkn3})
       .expect(200);
    })
    
    it("should return a 'booths' array", () => {
      const booth = { name: 'TEST 2' }
      return request.put('/markets/3/booths/2')
        .send(booth)
        .set({authorization: tkn3})
        .then(res => {
          expect(getType(res.body.booths)).toBe('array');
        });
    })
    
    it('should return an object w/ new name', () => {
      const booth = { name: 'TEST 3' }
      return request.put('/markets/3/booths/3')
        .send(booth)
        .set({authorization: tkn3})
        .then(res => {
          expect(res.body.booths[2].name).toBe(booth.name);
        });
    })
  })

  describe('/:id/booths/:bID/reserve/:rsID PUT', () => {
    it('should return 200 status', () => {
      const reserve = {reserve_date: "9999-12-24"};
      return request.put('/markets/3/booths/3/reserve/1')
        .set({authorization: tkn3})
        .send(reserve)
        .expect(200);
    })

    it('should return an array', () => {
      const reserve = {reserve_date: "9999-12-17"};
      return request.put('/markets/3/booths/3/reserve/2')
        .set({authorization: tkn3})
        .send(reserve)
        .then(res => expect(getType(res.body)).toBe('array'));
    })
    
    it('should return an object with passed date', () => {
      const reserve = {reserve_date: "9999-12-10"};
      return request.put('/markets/3/booths/3/reserve/3')
        .set({authorization: tkn3})
        .send(reserve)
        .then(res => {
          const booth = res.body.find(booth => booth.id === 3);
          expect(Number(booth.reserved)).toBe(1)
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

  describe('/:id/request/:rqID DELETE', () => {
    it('should return 200 status', () => {
      return request.get('/markets/3/request/1')
       .set({authorization: tkn3})
       .expect(200);
    })
    
    it('should return an object', () => {
      return request.delete('/markets/3/request/2')
        .set({authorization: tkn3})
        .then(res => expect(getType(res.body)).toBe('object'));
    })
    
    it('should return 404 status after deleting', () => {
      return request.delete('/markets/3/request/1')
        .set({authorization: tkn3})
        .expect(404);
    })
  })

  describe('/:id/booths DELETE', () => {
    it('should return 200 status', () => {
      return request.delete('/markets/3/booths/1')
       .set({authorization: tkn3})
       .expect(200);
    })
    
    it("should return a 'booths' array", () => {
      return request.delete('/markets/3/booths/2')
        .set({authorization: tkn3})
        .then(res => {
          expect(getType(res.body.booths)).toBe('array');
        });
    })
    
    it('should return 404 status after deleting', () => {
      return request.delete('/markets/3/booths/1')
        .set({authorization: tkn3})
        .expect(404);
    })
  })
  
  describe('/:id/booths/:bID/reserve/:rsID DELETE', () => {
    it('should return 200 status', () => {
      return request.delete('/markets/3/booths/3/reserve/1')
       .set({authorization: tkn3})
       .expect(200);
    })
    
    it('should return an array', () => {
      return request.delete('/markets/3/booths/3/reserve/2')
        .set({authorization: tkn3})
        .then(res => expect(getType(res.body)).toBe('array'));
    })
    
    it('should return with no reserved booths', () => {
      return request.delete('/markets/3/booths/3/reserve/3')
          .set({authorization: tkn3})
          .then(res => {
            const booth = res.body.find(booth => booth.id === 3);
            expect(Number(booth.reserved)).toBe(0)
          });
    })
  
    it('should return 404 status after deleting', () => {
      return request.delete('/markets/3/booths/3/reserve/1')
       .set({authorization: tkn3})
       .expect(404);
    })
  })
})

