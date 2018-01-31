'use strict';

const _ = require('lodash');
const http = require('http');
const redis = require('redis');
const Promise = require('bluebird');
const {promisify} = require('util');
const client = redis.createClient('redis://redis:6379');

// Using promisify, create async redis client methods as described here:
// https://github.com/NodeRedis/node_redis/blob/master/README.md
const lRangeAsync = promisify(client.lrange).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);
const getKeyTypeAsync = promisify(client.type).bind(client);

// Retrieve the value from the DB asynchonously
// This function assumes that the values will have a type of <set> or <list>
async function getElementsAsync(key) {
        let keyType = await getKeyTypeAsync(key);
        return keyType == 'set' ? await smembersAsync(key) : lRangeAsync(key, 0, -1);
}

// Iterate over list of keys synchronously, but retrieve the key value asychonously
// This method will return the difference between the max and min values
async function processKeys(keys) {
    for (const i in keys) {
        let value = await getElementsAsync(keys[i]);
        console.log(value);
    }
}

// Call redis client using exec function
// Use then() method to wait for completion of processing and then close connection to redis
client
    .multi()
    .dbsize()
    .keys('*')
    .exec((err, keys) => {
        if (err) throw err;

        console.log('Connected to DB successfully '); 

        processKeys(keys[1])
            .then(() => {
                console.log("Closing connection to DB")
                client.quit();
            })
    })