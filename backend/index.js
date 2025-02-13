const express = require("express"); 
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("redis");
const { v4: uuidv4 } = require("uuid");


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const redisClient = Redis.createClient({
  url: "rediss://default:AdmVAAIjcDFjOTE3Y2Y2M2FmN2Y0MzVlYTMwNTQxZmVmOWZkZDhhMnAxMA@intent-panda-55701.upstash.io:6379",
});

(async () => {
  await redisClient.connect();
  console.log(" Redis connected");
})();

const publisher = redisClient.duplicate();
const preferenceSubscriber = redisClient.duplicate();
const messageSubscriber = redisClient.duplicate();

(async () => {
  await publisher.connect();
  await preferenceSubscriber.connect();
  await messageSubscriber.connect();
  console.log(" Redis Pub/Sub connected");

  messageSubscriber.pSubscribe("chat-room:*", async (message, channel) => {
    const chatEvent = JSON.parse(message);
    io.to(chatEvent.roomID).emit("receive_message", {
      sender: chatEvent.sender,
      message: chatEvent.message,
    });
  });
})();

app.use(express.json());
app.get("/", (req, res) => res.send("Redis-based chat server is running!"));

const MAX_USERS_PER_ROOM = 5;

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userID;
  console.log(` User connected: ${userId}`);

  await redisClient.set(`user:${userId}`, socket.id);
  //io.emit("updatesOnlineUsers", await getOnlineUsers());

  socket.on("choose_preference", async ({ preference }) => {
    await publisher.publish(
      `preference:${preference}`,
      JSON.stringify({ userId, preference })
    );
  });

  socket.on("send_message", async ({ roomID, message }) => {
    await publisher.publish(
      `chat-room:${roomID}`,
      JSON.stringify({ roomID, sender: userId, message })
    );
  });

  socket.on("join_room", async ({ roomID }) => {
    socket.join(roomID);
    //.roomID = roomID;
    await redisClient.set(`user-room:${userId}`, roomID);
    // Get the list of users in the room
    const roomSockets = await io.in(roomID).fetchSockets();
    const usersInRoom = roomSockets.map(s => s.handshake.query.userID);

    io.to(roomID).emit("room_update", {
        message: `A new user has joined the room!`,
        users: usersInRoom.length,
        userList: usersInRoom,  // Send full list of users in the room
    });

    // io.emit("updatesOnlineUsers", await getOnlineUsers());
  });

  socket.on("leave_room", async ({ roomID }) => {
    socket.leave(roomID);
    
    // Get the updated list of users in the room
    const roomSockets = await io.in(roomID).fetchSockets();
    const usersInRoom = roomSockets.map(s => s.handshake.query.userID);

    io.to(roomID).emit("room_update", {
        message: `A user has left the room!`,
        users: usersInRoom.length,
        userList: usersInRoom,  // Send the updated list of users
    });

    // io.emit("updatesOnlineUsers", await getOnlineUsers());
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
   // await redisClient.del(`user:${userId}`);
    const roomID = await redisClient.get(`user-room:${userId}`);
    if (roomID) {
      socket.leave(roomID);
  
      // Get the updated list of users in the room
      const roomSockets = await io.in(roomID).fetchSockets();
      const usersInRoom = roomSockets.map(s => s.handshake.query.userID);
  
      io.to(roomID).emit("room_update", {
        message: `A user has disconnected!`,
        users: usersInRoom.length,
        userList: usersInRoom,
      });
  
      // Remove user-room mapping from Redis
      await redisClient.del(`user-room:${userId}`);
    }
  
    // Remove user from Redis
    await redisClient.del(`user:${userId}`);
  
    // io.emit("updatesOnlineUsers", await getOnlineUsers());
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
    }
  });
}

["Coding", "Science", "Music", "Jobs"].forEach(createSubscriberForPreference);

// async function getOnlineUsers() {
//   const allUsers = await redisClient.keys("user:*");
//   return allUsers.length;
// }

server.listen(3000, () => console.log(" Server running on http://localhost:3000"));
