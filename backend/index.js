const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("redis");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const redisClient = Redis.createClient({
  url: "rediss://default:ATNnAAIjcDEwZDMwZjMwYTBiMWQ0NTE1OWNlMzk0ODUwNTViZTk0NHAxMA@useful-jackal-13159.upstash.io:6379",
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

  messageSubscriber.pSubscribe("chat-room:*", async (message, channel) => {
    const chatEvent = JSON.parse(message);
    io.to(chatEvent.roomID).emit("receive_message", {
      sender: chatEvent.sender,
      message: chatEvent.message,
      timestamp: chatEvent.timestamp || new Date(),
    });

    await redisClient.rPush(`messages:${chatEvent.roomID}`, JSON.stringify(chatEvent));
    await redisClient.lTrim(`messages:${chatEvent.roomID}`, -100, -1);
  });
})();

app.use(express.json());
app.get("/", (req, res) => res.send("Redis-based chat server is running!"));

const MAX_USERS_PER_ROOM = 5;

// Global helper function to update room status
async function updateRoomStatus(roomID) {
  const roomSockets = await io.in(roomID).fetchSockets();
  const usersInRoom = roomSockets.map((s) => s.handshake.query.userID);

  io.to(roomID).emit("room_update", {
    message: usersInRoom.length > 0 ? `Users in room: ${usersInRoom.length}` : "Room is empty",
    users: usersInRoom.length,
    userList: usersInRoom,
  });

  if (usersInRoom.length === 0) {
    await redisClient.del(`messages:${roomID}`);
    const preferenceKeys = await redisClient.keys(`room:*:${roomID}`);
    for (const key of preferenceKeys) {
      await redisClient.del(key); // Delete room key with preference prefix
    }
    console.log(`Room ${roomID} is empty and deleted.`);
  }
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userID;
  console.log(`User connected: ${userId}`);

  await redisClient.set(`user:${userId}`, socket.id);

  const previousRoomID = await redisClient.get(`user-room:${userId}`);
  if (previousRoomID) {
    socket.join(previousRoomID);
    const storedMessages = await redisClient.lRange(`messages:${previousRoomID}`, 0, -1);
    storedMessages.forEach((msg) => {
      const parsedMsg = JSON.parse(msg);
      socket.emit("receive_message", {
        sender: parsedMsg.sender,
        message: parsedMsg.message,
        timestamp: parsedMsg.timestamp || new Date(),
      });
    });
    await updateRoomStatus(previousRoomID);
  }

  socket.on("choose_preference", async ({ preference }) => {
    await publisher.publish(
      `preference:${preference}`,
      JSON.stringify({ userId, preference })
    );
  });

  socket.on("send_message", async ({ roomID, message }) => {
    await publisher.publish(
      `chat-room:${roomID}`,
      JSON.stringify({ roomID, sender: userId, message, timestamp: new Date() })
    );
  });

  socket.on("join_room", async ({ roomID }) => {
    socket.join(roomID);
    await redisClient.set(`user-room:${userId}`, roomID);

    const storedMessages = await redisClient.lRange(`messages:${roomID}`, 0, -1);
    storedMessages.forEach((msg) => {
      const parsedMsg = JSON.parse(msg);
      socket.emit("receive_message", {
        sender: parsedMsg.sender,
        message: parsedMsg.message,
        timestamp: parsedMsg.timestamp || new Date(),
      });
    });

    await updateRoomStatus(roomID);
  });

  socket.on("leave_room", async ({ roomID }) => {
    socket.leave(roomID);
    await redisClient.del(`user-room:${userId}`);
    await updateRoomStatus(roomID);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
    const roomID = await redisClient.get(`user-room:${userId}`);
    if (roomID) {
      await updateRoomStatus(roomID);
    }
    await redisClient.del(`user:${userId}`);
  });
});

async function createSubscriberForPreference(preference) {
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
      await updateRoomStatus(roomID); 
    }
  });
}

["Coding", "Science", "Music", "Jobs"].forEach(createSubscriberForPreference);

server.listen(3000, () => console.log("Server running on http://localhost:3000"));