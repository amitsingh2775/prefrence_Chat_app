const { updateRoomStatus } = require("./roomManager");
const { publisher } = require("./redisClient");
const { v4: uuidv4 } = require("uuid");

function setupSocketHandlers(io, socket, redisClient) {
  const userId = socket.handshake.query.userID;
  console.log(`User connected: ${userId}`);

  redisClient.set(`user:${userId}`, socket.id);

  // Handle user reconnecting to previous room
  (async () => {
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
          id: parsedMsg.id,
          reactions: parsedMsg.reactions || {},
        });
      });
      await updateRoomStatus(previousRoomID, io, redisClient);
    }
  })();

  socket.on("choose_preference", async ({ preference }) => {
    await publisher.publish(
      `preference:${preference}`,
      JSON.stringify({ userId, preference })
    );
  });

  socket.on("send_message", async ({ roomID, message }) => {
    const messageId = uuidv4();
    await publisher.publish(
      `chat-room:${roomID}`,
      JSON.stringify({
        roomID,
        sender: userId,
        message,
        timestamp: new Date(),
        id: messageId,
        reactions: {},
      })
    );
  });

  socket.on("add_reaction", async ({ messageId, userId, emoji, roomId }) => {
    const messageKey = `messages:${roomId}`;
    try {
      const storedMessages = await redisClient.lRange(messageKey, 0, -1);
      for (let i = 0; i < storedMessages.length; i++) {
        const msg = JSON.parse(storedMessages[i]);
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};

          // Remove existing reaction by user
          for (const [existingEmoji, users] of Object.entries(reactions)) {
            const index = users.indexOf(userId);
            if (index > -1) {
              users.splice(index, 1);
              if (users.length === 0) delete reactions[existingEmoji];
            }
          }

          // Add new reaction
          if (!reactions[emoji]) reactions[emoji] = [];
          if (!reactions[emoji].includes(userId)) reactions[emoji].push(userId);

          msg.reactions = reactions;
          await redisClient.lSet(messageKey, i, JSON.stringify(msg));

          // Broadcast reaction
          await publisher.publish(
            `reaction:${roomId}`,
            JSON.stringify({ roomId, messageId, emoji, reactions })
          );
          break;
        }
      }
    } catch (error) {
      console.error(`Error adding reaction: ${error}`);
    }
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
        id: parsedMsg.id,
        reactions: parsedMsg.reactions || {},
      });
    });

    await updateRoomStatus(roomID, io, redisClient);
  });

  socket.on("leave_room", async ({ roomID }) => {
    socket.leave(roomID);
    await redisClient.del(`user-room:${userId}`);
    await redisClient.del(`user:${userId}`);
    await updateRoomStatus(roomID, io, redisClient);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
    const roomID = await redisClient.get(`user-room:${userId}`);
    if (roomID) {
      await updateRoomStatus(roomID, io, redisClient);
    }
    await redisClient.del(`user-room:${userId}`);
  });
}

module.exports = setupSocketHandlers;