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

// Pub/Sub setup
const subscriber = redisClient.duplicate();
const publisher = redisClient.duplicate();

(async () => {
  try {
    await subscriber.connect();
    console.log("subscriber connected");
    

    await publisher.connect();
    console.log("publisher connected");
    
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

app.use(express.json());
app.get("/", (req, res) => res.send("Redis-based server is running!"));

// Constants
const MAX_USERS_PER_ROOM = 10;

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle preference selection
  socket.on("choose_preference", async ({ preference }) => {
    try {
      const event = { userId: socket.id, preference };
      await publisher.publish("preference-events", JSON.stringify(event));
      console.log("Event published:", event);
    } catch (err) {
      console.error("Error publishing preference event:", err);
    }
  });

  // Handle sending messages
  socket.on("send_message", async ({ roomID, message }) => {
    try {
      // Emit the message to all users in the room
      io.to(roomID).emit("receive_message", {
        sender: socket.id,
        message,
      });
      console.log(`Message broadcasted to room ${roomID}: ${message}`);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    try {
      console.log("User disconnected:", socket.id);
      const keys = await redisClient.keys("room:*");
      keys.forEach((key) => redisClient.lRem(key, 0, socket.id));
    } catch (err) {
      console.error("Error on user disconnect:", err);
    }
  });
});

// Redis subscriber for processing preference events
subscriber.subscribe("preference-events", async (message) => {
  try {
    const event = JSON.parse(message);
    const { userId, preference } = event;

    // Check for existing room with space
    let roomID = null;
    const roomKeys = await redisClient.keys(`room:${preference}:*`);
    for (const key of roomKeys) {
      const usersCount = await redisClient.lLen(key);
      if (usersCount < MAX_USERS_PER_ROOM) {
        roomID = key.split(":")[2]; // Extract room ID
        break;
      }
    }

    // If no room available, create a new one
    if (!roomID) {
      roomID = uuidv4();
      console.log(`Created new room: ${roomID} for preference: ${preference}`);
    }

    const roomKey = `room:${preference}:${roomID}`;
    await redisClient.rPush(roomKey, userId);

    // Notify the user
    const userSocket = io.sockets.sockets.get(userId);
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
