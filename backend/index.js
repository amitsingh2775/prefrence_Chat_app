const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("redis");
const { v4: uuidv4 } = require("uuid");

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Redis setup
const redisClient = Redis.createClient({
  url: "rediss://default:AdmVAAIjcDFjOTE3Y2Y2M2FmN2Y0MzVlYTMwNTQxZmVmOWZkZDhhMnAxMA@intent-panda-55701.upstash.io:6379",
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully.");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

const subscriber = redisClient.duplicate();
const publisher = redisClient.duplicate();

(async () => {
  try {
    await subscriber.connect();
    await publisher.connect();
    console.log("Redis Pub/Sub connected successfully.");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

app.use(express.json());
app.get("/", (req, res) => res.send("Redis-based server is running!"));

// Constants
const MAX_USERS_PER_ROOM = 5;

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userID;
  console.log("User connected:", userId);

  await redisClient.set(`user:${userId}`, socket.id);

  socket.on("choose_preference", async ({ preference }) => {
    try {
      const event = { userId, preference };
      await publisher.publish("preference-events", JSON.stringify(event));
      console.log("Event published:", event);
    } catch (err) {
      console.error("Error publishing preference event:", err);
    }
  });

  socket.on("send_message", async ({ roomID, message }) => {
    if (roomID && message) {
      io.to(roomID).emit("receive_message", {
        sender: userId,
        message,
      });
      console.log(`Message broadcasted to room ${roomID}: ${message}`);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", userId);
    await redisClient.del(`user:${userId}`);

    const keys = await redisClient.keys("room:*");
    for (const key of keys) {
      await redisClient.lRem(key, 0, userId);
    }
  });
});

subscriber.subscribe("preference-events", async (message) => {
  try {
    const event = JSON.parse(message);
    const { userId, preference } = event;

    let roomID = null;
    const roomKeys = await redisClient.keys(`room:${preference}:*`);

    for (const key of roomKeys) {
      const usersCount = await redisClient.lLen(key);
      if (usersCount < MAX_USERS_PER_ROOM) {
        roomID = key.split(":")[2];
        break;
      }
    }

    if (!roomID) {
      roomID = uuidv4();
      console.log(`Created new room: ${roomID} for preference: ${preference}`);
    }

    const roomKey = `room:${preference}:${roomID}`;
    await redisClient.rPush(roomKey, userId);

    const userSocketId = await redisClient.get(`user:${userId}`);
    const userSocket = io.sockets.sockets.get(userSocketId);
    if (userSocket) {
      userSocket.join(roomID);
      const users = await redisClient.lRange(roomKey, 0, -1);
      userSocket.emit("join_room", { roomID, users });
      console.log(`User ${userId} joined room ${roomID}`);
    }
  } catch (err) {
    console.error("Error processing preference event:", err);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
