'use strict';

const _ = require('lodash');
const http = require('http');
const redis = require('redis');
const assert = require('assert');
const client = redis.createClient('redis://redis:6379');

client.multi()
  .dbsize()
  .keys('*')
  .exec((err, replies) => {
    if (err) throw err;
    
    console.log('Can connect to DB');
    client.quit();
});
