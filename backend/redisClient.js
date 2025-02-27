const Redis = require("redis");

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
});

(async () => {
  await redisClient.connect();
  console.log("Redis connected");
})();

const publisher = redisClient.duplicate();
const preferenceSubscriber = redisClient.duplicate();
const messageSubscriber = redisClient.duplicate();

(async () => {
  await publisher.connect();
  await preferenceSubscriber.connect();
  await messageSubscriber.connect();
  console.log("Redis Pub/Sub connected");
})();

module.exports = {
  redisClient,
  publisher,
  preferenceSubscriber,
  messageSubscriber,
};