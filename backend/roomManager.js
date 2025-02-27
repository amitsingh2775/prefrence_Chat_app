async function updateRoomStatus(roomID, io, redisClient) {
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
        await redisClient.del(key);
      }
      console.log(`Room ${roomID} is empty and deleted.`);
    }
  }
  
  module.exports = { updateRoomStatus };