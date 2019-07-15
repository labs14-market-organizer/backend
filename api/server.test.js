const request = require('supertest');
const server = require('./server.js');
const db = require('../data/dbConfig');

describe('test environment', () => {
  it('runs', () => {
    expect(true).toBe(true);
  })
})

describe('server', () => {
  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request(server)
        .get('/')
        .expect(200);
    })
  })
})
