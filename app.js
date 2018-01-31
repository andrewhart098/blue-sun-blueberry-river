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

// Retrieve the value from the DB asynchronously
// This function assumes that the values will have a type of <set> or <list>
async function getElementsAsync(key) {
        let keyType = await getKeyTypeAsync(key);
        return keyType == 'set' ? await smembersAsync(key) : await lRangeAsync(key, 0, -1);
}

// Returns if JS array contains anagrams or not
// Uses the ES6 Set() method as described here to achieve O(n)-ish speed 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function doesNotContainAnagram(arr) {
    for ( let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].split("").sort().join("");
    }

    return arr.length === new Set(arr).size;
}

// Iterate over list of keys synchronously, but retrieve the key value asynchronously
// This method will return the difference between the max and min values
async function processKeys(keys) {
    var minMaxDifferences = 0;
    
    for (const i in keys) {
        let  arr = await getElementsAsync(keys[i]);

        if (doesNotContainAnagram(arr.slice())) {
            minMaxDifferences += Math.max(...arr) - Math.min(...arr);
        }
    }

    return minMaxDifferences;
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
            .then((minMaxDifferences) => {
                http.get('http://answer:3000/' + minMaxDifferences, function(res, err) {
                    if (err) throw err;

                    if (res.statusCode == 400) {
                        console.log('booo..you got it wrong :(');
                    }

                    if (res.statusCode == 200) {
                        console.log('nice...you got it right :)');
                    }
                })
            })
            .then(() => {
                console.log("Closing connection to DB")
                client.quit();
            })
    })