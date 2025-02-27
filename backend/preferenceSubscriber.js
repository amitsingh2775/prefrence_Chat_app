const { updateRoomStatus } = require("./roomManager");
const { v4: uuidv4 } = require("uuid");

const MAX_USERS_PER_ROOM = process.env.MAX_CLIENT;

async function createSubscriberForPreference(preference, io, redisClient) {
  const sub = redisClient.duplicate();
  await sub.connect();

  sub.subscribe(`preference:${preference}`, async (message) => {
    const { userId } = JSON.parse(message);
    let roomID = null;

    const roomKeys = await redisClient.keys(`room:${preference}:*`);
    for (const key of roomKeys) {
      if ((await redisClient.lLen(key)) < MAX_USERS_PER_ROOM) {
        roomID = key.split(":")[2];
        break;
      }
    }

    if (!roomID) roomID = uuidv4();
    const roomKey = `room:${preference}:${roomID}`;
    await redisClient.rPush(roomKey, userId);

    const userSocketId = await redisClient.get(`user:${userId}`);
    const userSocket = io.sockets.sockets.get(userSocketId);
    if (userSocket) {
      userSocket.join(roomID);
      userSocket.emit("join_room", {
        roomID,
        users: await redisClient.lRange(roomKey, 0, -1),
      });
      await updateRoomStatus(roomID, io, redisClient);
    }
  });
}

module.exports = createSubscriberForPreference;