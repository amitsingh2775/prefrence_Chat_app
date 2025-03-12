require("dotenv").config();
const Redis = require("redis");

const redisClient = Redis.createClient({
  url: 'rediss://default:Ae8MAAIjcDE1NjBiODFkOWEyMmY0OWM2OWY3MThlZTY3OTFiODg1OXAxMA@legible-squid-61196.upstash.io:6379'
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